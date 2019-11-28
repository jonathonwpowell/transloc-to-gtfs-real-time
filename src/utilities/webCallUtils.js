const get = require('lodash/get')
const unirest = require('unirest')
const constants = require('./constants')
const gtfsUtils = require('./gtfsBindingsBuilders')
const GtfsRealtimeBindings = require('gtfs-realtime-bindings')

function getVehicleArray (translocResponse, agencyId) {
  const resposeVehicleData = get(translocResponse, 'body.data', {})
  return get(resposeVehicleData, agencyId, [])
}

function createTranslocCall (agencyId, transocAPIKey) {
  var apiCall = unirest('GET', constants.translocVehicleEndpoint)

  apiCall.query({
    callback: 'call',
    agencies: agencyId
  })

  apiCall.headers({
    'x-rapidapi-host': constants.translocAPIHost,
    'x-rapidapi-key': transocAPIKey
  })

  return apiCall
}

function getTripUpdateFeedMessage (translocRes, agencyId) {
  var agencyData = []

  if (translocRes.error) {
    console.log('Error retrieving data from API:\n' + translocRes.error)
  } else {
    agencyData = getVehicleArray(translocRes, agencyId)
  }

  var feedMessage = new GtfsRealtimeBindings.transit_realtime.FeedMessage()
  feedMessage.header = gtfsUtils.createFeedHeader(get(translocRes, 'body.generated_on'))

  agencyData.forEach((vehicle) => {
    var tripUpdate = gtfsUtils.createTripUpdate(vehicle)

    var feedEntity = new GtfsRealtimeBindings.transit_realtime.FeedEntity({
      id: vehicle.vehicle_id,
      tripUpdate: tripUpdate
    })
    feedMessage.entity.push(feedEntity)
  })

  return feedMessage
}

function getVehiclePositionFeedMessage (translocRes, agencyId) {
  var agencyData = []

  if (translocRes.error) {
    console.log('Error retrieving data from API:\n' + translocRes.error)
  } else {
    agencyData = getVehicleArray(translocRes, agencyId)
  }

  var feedMessage = new GtfsRealtimeBindings.transit_realtime.FeedMessage()
  feedMessage.header = gtfsUtils.createFeedHeader(get(translocRes, 'body.generated_on'))

  agencyData.forEach((vehicle) => {
    var vehiclePos = gtfsUtils.createVehiclePos(vehicle)

    var feedEntity = new GtfsRealtimeBindings.transit_realtime.FeedEntity({
      vehicle: vehiclePos,
      id: vehicle.vehicle_id
    })
    feedMessage.entity.push(feedEntity)
  })

  return feedMessage
}

module.exports = {
  getVehicleArray,
  createTranslocCall,
  getTripUpdateFeedMessage,
  getVehiclePositionFeedMessage
}
