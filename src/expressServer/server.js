const GtfsRealtimeBindings = require('gtfs-realtime-bindings')
const express = require('express')
const serverless = require('serverless-http')
const constants = require('../utilities/constants')
const webCallUtils = require('../utilities/webCallUtils')
const app = express()

const router = express.Router()

router.get('/tripupdates/:agencyId(\\d+)', (req, res, next) => {
  var agencyId = req.params.agencyId
  if (!agencyId) {
    throw new Error('Agency ID must be defined')
  }

  const translocCall = webCallUtils.createTranslocCall(agencyId, constants.defaultTranslocAPIKey)

  translocCall.end(function (translocRes) {
    const feedMessage = webCallUtils.getTripUpdateFeedMessage(translocRes, agencyId)

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

  const translocCall = webCallUtils.createTranslocCall(agencyId, constants.defaultTranslocAPIKey)

  translocCall.end(function (translocRes) {
    const feedMessage = webCallUtils.getVehiclePositionFeedMessage(translocRes, agencyId)

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
