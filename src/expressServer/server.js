const unirest = require('unirest')
const GtfsRealtimeBindings = require('gtfs-realtime-bindings')
const express = require('express')
const serverless = require('serverless-http')
const gtfsUtils = require('../utilities/gtfsBindingsBuilders')
const constants = require('../utilities/constants')
const app = express()

const router = express.Router()

router.get('/tripupdates/:agencyId(\\d+)', (req, res, next) => {
  var agencyId = req.params.agencyId
  if (!agencyId) {
    throw new Error('Agency ID must be defined')
  }

  var busCall = unirest('GET', constants.translocVehicleEndpoint)

  busCall.query({
    callback: 'call',
    agencies: agencyId
  })

  busCall.headers({
    'x-rapidapi-host': constants.translocAPIHost,
    'x-rapidapi-key': constants.defaultTranslocAPIKey
  })

  busCall.end(function (busRes) {
    if (busRes.error) {
      console.log('Error retrieving data from API:\n' + busRes.error)
      res.end()
      return
    } else if (!busRes || !busRes.body || !busRes.body.data) {
      console.log('Error retrieving data from API')
      res.end()
      return
    } else if (!busRes.body.data[agencyId]) {
      console.log('No data retreived for agency with id: ' + agencyId)
      res.end()
      return
    }

    var feedMessage = new GtfsRealtimeBindings.transit_realtime.FeedMessage()
    feedMessage.header = gtfsUtils.createFeedHeader(busRes.body.generated_on)

    var buses = busRes.body.data[agencyId]
    buses.forEach((bus) => {
      var tripUpdate = gtfsUtils.createTripUpdate(bus)

      var feedEntity = new GtfsRealtimeBindings.transit_realtime.FeedEntity({
        id: bus.vehicle_id,
        tripUpdate: tripUpdate
      })
      feedMessage.entity.push(feedEntity)
    })

    var encodedMessage = GtfsRealtimeBindings.transit_realtime.FeedMessage.encode(feedMessage).finish()
    res.set({ 'Content-Type': 'application/x-protobuf' })
    res.end(encodedMessage)
    console.log('Sent Trip Updates of size ' + encodedMessage.length + ' for agency ' + agencyId + ' at ' + new Date().toISOString())
  })
})

router.get('/vehiclepositions/:agencyId(\\d+)', (req, res, next) => {
  var agencyId = req.params.agencyId
  if (!agencyId) {
    throw new Error('Agency ID must be defined')
  }

  var busCall = unirest('GET', constants.translocVehicleEndpoint)

  busCall.query({
    callback: 'call',
    agencies: agencyId
  })

  busCall.headers({
    'x-rapidapi-host': constants.translocAPIHost,
    'x-rapidapi-key': constants.defaultTranslocAPIKey
  })

  busCall.end(function (busRes) {
    if (busRes.error) {
      console.log('Error retrieving data from API:\n' + busRes.error)
      res.end()
      return
    } else if (!busRes || !busRes.body || !busRes.body.data) {
      console.log('Error retrieving data from API')
      res.end()
      return
    } else if (!busRes.body.data[agencyId]) {
      console.log('No data retreived for agency with id: ' + agencyId)
      res.end()
      return
    }

    var feedMessage = new GtfsRealtimeBindings.transit_realtime.FeedMessage()
    feedMessage.header = gtfsUtils.createFeedHeader(busRes.body.generated_on)

    var buses = busRes.body.data[agencyId]
    buses.forEach((bus) => {
      var vehiclePos = gtfsUtils.createVehiclePos(bus)

      var feedEntity = new GtfsRealtimeBindings.transit_realtime.FeedEntity({
        vehicle: vehiclePos,
        id: bus.vehicle_id
      })
      feedMessage.entity.push(feedEntity)
    })

    var encodedMessage = GtfsRealtimeBindings.transit_realtime.FeedMessage.encode(feedMessage).finish()
    res.set({ 'Content-Type': 'application/x-protobuf' })
    res.end(encodedMessage)
    console.log('Sent Vehicle Positions of size ' + encodedMessage.length + ' for agency ' + agencyId + ' at ' + new Date().toISOString())
  })
})

app.use('/.netlify/functions/server', router)

module.exports = app
// We are defining the binary response types here to prevent the aws lambda from treating the response as a string
// Otherwise it may truncate the response
module.exports.handler = serverless(app, { binary: ['application/json', 'application/x-protobuf', 'application/octet-buffer'] })
