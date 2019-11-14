var unirest = require("unirest");
var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var express = require("express");
const serverless = require('serverless-http');
var app = express();

const router = express.Router();

function mphToMetersPerSec(mph) {
    return mph * .44704;
}

function createVehiclePos(busData) {
    var position = new GtfsRealtimeBindings.transit_realtime.Position({
        "latitude": busData.location.lat,
        "longitude": busData.location.lng,
        "bearing": busData.heading,
        "speed": mphToMetersPerSec(busData.speed),
    })

    var vehicleDesc = createVehicleDescriptor(busData.vehicle_id)

    var vehiclePos = new GtfsRealtimeBindings.transit_realtime.VehiclePosition({
        "position": position,
        "timestamp": timestampToUnix(busData.last_updated_on),
        "vehicle": vehicleDesc,
        "trip": createTripDescriptor(null,busData.route_id),
    });

    return vehiclePos; 
}

function createVehicleDescriptor(id) {
    return new GtfsRealtimeBindings.transit_realtime.VehicleDescriptor({
        "id": id
    });
}

function createFeedHeader(timestamp) {
    var feedHeader = new GtfsRealtimeBindings.transit_realtime.FeedHeader({
        "gtfsRealtimeVersion": "2.0",
        "incrementality": 0,
        "timestamp": timestampToUnix(timestamp)
    });

    return feedHeader;
}

function createStopTimeUpdate(stopId, arrivalEstimate) {
    return new GtfsRealtimeBindings.transit_realtime.TripUpdate.StopTimeUpdate({
        "stopId": stopId,
        "arrival": arrivalEstimate
    });
}

function createStopTimeEvent(timestamp) {
    var unixTime = timestampToUnix(timestamp);
    return new GtfsRealtimeBindings.transit_realtime.TripUpdate.StopTimeEvent({
        "time": unixTime
    });
}

function createStopTimeUpdates(arrivalEstimates) {
    var updates = [];
    
    arrivalEstimates.forEach(est => {
        var unixTime = createStopTimeEvent(est.arrival_at);
        updates.push(createStopTimeUpdate(est.stop_id, unixTime));
    })

    return updates
}

function createTripDescriptor(trip_id, route_id) {
    return new GtfsRealtimeBindings.transit_realtime.TripDescriptor({
        "tripId": trip_id,
        "routeId": route_id
    });
}

function createTripUpdate(busData) {
    var stopTimeUpdates = createStopTimeUpdates(busData.arrival_estimates);

    var tripUpdate = new GtfsRealtimeBindings.transit_realtime.TripUpdate({
        "vehicle": createVehicleDescriptor(busData.vehicle_id),
        "timestamp": timestampToUnix(busData.last_updated_on),
        "stopTimeUpdate": stopTimeUpdates,
        "trip": createTripDescriptor(null, busData.route_id)
    });

    return tripUpdate;
}



function timestampToUnix(timestamp) {
    return new Date(timestamp).getTime() / 1000;
}

router.get("/tripupdates/:agencyId(\\d+)", (req,res,next) => {
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
        if (busRes.error) {
            console.log("Error retrieving data from API:\n" + busRes.error);
            res.end();
            return;
        } else if (!busRes || !busRes.body || !busRes.body["data"]) {
            console.log("Error retrieving data from API");
            res.end();
            return;
        } else if (!busRes.body["data"][agencyId]) {
            console.log("No data retreived for agency with id: " + agencyId);
            res.end();
            return;
        }

        var feedMessage = new GtfsRealtimeBindings.transit_realtime.FeedMessage();
        feedMessage.header = createFeedHeader(busRes.body.generated_on);

        var buses = busRes.body["data"][agencyId];
        buses.forEach((bus) => {

            var tripUpdate = createTripUpdate(bus);

            var feedEntity = new GtfsRealtimeBindings.transit_realtime.FeedEntity({ 
                "id": bus.vehicle_id,
                "tripUpdate": tripUpdate
            });
            feedMessage.entity.push(feedEntity);
        });

        var encodedMessage = GtfsRealtimeBindings.transit_realtime.FeedMessage.encode(feedMessage).finish();
        res.set({"Content-Type":"application/x-protobuf"});
        res.end(encodedMessage);
        console.log("Sent Trip Updates of size " + encodedMessage.length + " for agency " + agencyId + " at " + new Date().toISOString());
    });
});

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
        if (busRes.error) {
            console.log("Error retrieving data from API:\n" + busRes.error);
            res.end();
            return;
        } else if (!busRes || !busRes.body || !busRes.body["data"]) {
            console.log("Error retrieving data from API");
            res.end();
            return;
        } else if (!busRes.body["data"][agencyId]) {
            console.log("No data retreived for agency with id: " + agencyId);
            res.end();
            return;
        }

        var feedMessage = new GtfsRealtimeBindings.transit_realtime.FeedMessage();
        feedMessage.header = createFeedHeader(busRes.body.generated_on);

        var buses = busRes.body["data"][agencyId];
        buses.forEach((bus) => {

            var vehiclePos = createVehiclePos(bus);

            var feedEntity = new GtfsRealtimeBindings.transit_realtime.FeedEntity({
                "vehicle": vehiclePos, 
                "id": bus.vehicle_id,
            });
            feedMessage.entity.push(feedEntity);
        });

        var encodedMessage = GtfsRealtimeBindings.transit_realtime.FeedMessage.encode(feedMessage).finish();
        res.set({"Content-Type":"application/x-protobuf"});
        res.end(encodedMessage);
        console.log("Sent Vehicle Positions of size " + encodedMessage.length + " for agency " + agencyId + " at " + new Date().toISOString());
    });
});

app.use("/.netlify/functions/server",router);

module.exports = app;
module.exports.handler = serverless(app, {binary: ['application/json', 'application/x-protobuf', 'application/octet-buffer']});

