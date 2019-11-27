const GtfsRealtimeBindings = require('gtfs-realtime-bindings')
const conversions = require('./conversions')

function createVehiclePos (busData) {
  var position = new GtfsRealtimeBindings.transit_realtime.Position({
    latitude: busData.location.lat,
    longitude: busData.location.lng,
    bearing: busData.heading,
    speed: conversions.mphToMetersPerSec(busData.speed)
  })

  var vehicleDesc = createVehicleDescriptor(busData.vehicle_id)

  var vehiclePos = new GtfsRealtimeBindings.transit_realtime.VehiclePosition({
    position: position,
    timestamp: conversions.timestampToUnix(busData.last_updated_on),
    vehicle: vehicleDesc,
    trip: createTripDescriptor(null, busData.route_id)
  })

  return vehiclePos
}

function createVehicleDescriptor (id) {
  return new GtfsRealtimeBindings.transit_realtime.VehicleDescriptor({
    id: id
  })
}

function createFeedHeader (timestamp) {
  var feedHeader = new GtfsRealtimeBindings.transit_realtime.FeedHeader({
    gtfsRealtimeVersion: '2.0',
    incrementality: 0,
    timestamp: conversions.timestampToUnix(timestamp)
  })

  return feedHeader
}

function createStopTimeUpdate (stopId, arrivalEstimate) {
  return new GtfsRealtimeBindings.transit_realtime.TripUpdate.StopTimeUpdate({
    stopId: stopId,
    arrival: arrivalEstimate
  })
}

function createStopTimeEvent (timestamp) {
  var unixTime = conversions.timestampToUnix(timestamp)
  return new GtfsRealtimeBindings.transit_realtime.TripUpdate.StopTimeEvent({
    time: unixTime
  })
}

function createStopTimeUpdates (arrivalEstimates) {
  var updates = []

  arrivalEstimates.forEach(est => {
    var unixTime = createStopTimeEvent(est.arrival_at)
    updates.push(createStopTimeUpdate(est.stop_id, unixTime))
  })

  return updates
}

function createTripDescriptor (tripId, routeId) {
  return new GtfsRealtimeBindings.transit_realtime.TripDescriptor({
    tripId: tripId,
    routeId: routeId
  })
}

function createTripUpdate (busData) {
  var stopTimeUpdates = createStopTimeUpdates(busData.arrival_estimates)

  var tripUpdate = new GtfsRealtimeBindings.transit_realtime.TripUpdate({
    vehicle: createVehicleDescriptor(busData.vehicle_id),
    timestamp: conversions.timestampToUnix(busData.last_updated_on),
    stopTimeUpdate: stopTimeUpdates,
    trip: createTripDescriptor(null, busData.route_id)
  })

  return tripUpdate
}

module.exports = { createVehicleDescriptor, createTripUpdate, createTripDescriptor, createStopTimeUpdates, createStopTimeUpdate, createStopTimeEvent, createVehiclePos, createFeedHeader }
