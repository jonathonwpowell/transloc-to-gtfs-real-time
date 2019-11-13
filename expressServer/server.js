var unirest = require("unirest");
var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var express = require("express");
const serverless = require('serverless-http');
var app = express();

const router = express.Router();

function createVehiclePos(busData) {
    var position = new GtfsRealtimeBindings.transit_realtime.Position({
        "latitude": busData.location.lat,
        "longitude": busData.location.lng
    })

    var vehicleDesc = new GtfsRealtimeBindings.transit_realtime.VehicleDescriptor({
        "id": busData.vehicle_id,
    });

    var vehiclePos = new GtfsRealtimeBindings.transit_realtime.VehiclePosition({
        position,
        "timestamp": timestampToUnix(busData.last_updated_on),
        vehicle: vehicleDesc,
    });

    return vehiclePos;
}

function createFeedHeader(timestamp) {
    var feedHeader = new GtfsRealtimeBindings.transit_realtime.FeedHeader({
        "gtfs_realtime_version": "2.0",
        "incrementality": 0,
        "timestamp": timestampToUnix(timestamp)
    });

    return feedHeader;
}

function timestampToUnix(timestamp) {
    return new Date(timestamp).getTime() / 1000;
}

router.get("/here", (a,b,c) => {
    console.log("22");
    b.end("a");
})

router.get("/vehiclepositions/:agencyId(\\d+)", (req,res,next) => {
    var agencyId = req.params.agencyId;
    if (!agencyId) {
        throw new Error("Agency ID must be defined");
    }

    var busCall = unirest("GET", "https://transloc-api-1-2.p.rapidapi.com/vehicles.json");
    
    busCall.query({
        "callback": "call",
        "agencies": agencyId
    });

    busCall.headers({
        "x-rapidapi-host": "transloc-api-1-2.p.rapidapi.com",
        "x-rapidapi-key": "IcmLKZZ5zEmshFRGhk5AZLEqKIN8p1EhU12jsnox1jlqBKWleK"
    });

    busCall.end(function (busRes) {
        if (busRes.error) throw new Error(busRes.error);
        var feedMessage = new GtfsRealtimeBindings.transit_realtime.FeedMessage();
        feedMessage.header = createFeedHeader(busRes.body.generated_on);

        var buses = busRes.body["data"][agencyId];
        buses.forEach((bus) => {

            var vehiclePos = createVehiclePos(bus);

            var feedEntity = new GtfsRealtimeBindings.transit_realtime.FeedEntity({"vehicle": vehiclePos, "id": bus.vehicle_id});
            feedMessage.entity.push(feedEntity);
        });

        var encodedMessage = GtfsRealtimeBindings.transit_realtime.FeedMessage.encode(feedMessage).finish();
        res.set("Content-Type","application/x-protobuf");
        
        //res.set("Transfer-Encoding","chunked");
        res.end(encodedMessage);
        console.log("Sent data for agency " + agencyId + " at " + new Date().toISOString());
    });
});
app.use("/.netlify/functions/server",router);

module.exports = app;
module.exports.handler = serverless(app);

