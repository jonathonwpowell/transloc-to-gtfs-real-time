var unirest = require("unirest");
var GtfsRealtimeBindings = require('gtfs-realtime-bindings');
var express = require("express");
const serverless = require('serverless-http');
var app = express();

const router = express.Router();

router.get("/bus.pb", (req,res,next) => {

    var busCall = unirest("GET", "https://transloc-api-1-2.p.rapidapi.com/vehicles.json");

    busCall.query({
        "callback": "call",
        "agencies": "16"
    });

    busCall.headers({
        "x-rapidapi-host": "transloc-api-1-2.p.rapidapi.com",
        "x-rapidapi-key": "IcmLKZZ5zEmshFRGhk5AZLEqKIN8p1EhU12jsnox1jlqBKWleK"
    });


    busCall.end(function (busRes) {
        if (busRes.error) throw new Error(busRes.error);
        var feedMessage = new GtfsRealtimeBindings.transit_realtime.FeedMessage();
        feedMessage.header = new GtfsRealtimeBindings.transit_realtime.FeedHeader({
            "gtfs_realtime_version": "2.0",
            "incrementality": 0,
            "timestamp": new Date(busRes.body.generated_on).getTime() / 1000
        });

        var buses = busRes.body["data"]["16"];
        buses.forEach((bus) => {
            var position = new GtfsRealtimeBindings.transit_realtime.Position({
                "latitude": bus.location.lat,
                "longitude": bus.location.lng
            })


            var vehicleDesc = new GtfsRealtimeBindings.transit_realtime.VehicleDescriptor({
                "id": bus.vehicle_id,
            });

            var vehiclePos = new GtfsRealtimeBindings.transit_realtime.VehiclePosition({
                position,
                "timestamp": new Date(bus.last_updated_on).getTime() / 1000,
                vehicle: vehicleDesc,
            })


            var feedEntity = new GtfsRealtimeBindings.transit_realtime.FeedEntity({"vehicle": vehiclePos, "id": bus.vehicle_id});
            feedMessage.entity.push(feedEntity);
            // console.log("Is Vehicle pos valid: " + GtfsRealtimeBindings.transit_realtime.VehiclePosition.verify(vehiclePos));
            // console.log("Is pos valid: " + GtfsRealtimeBindings.transit_realtime.Position.verify(position));
            // console.log("Is feedEntity valid: " + GtfsRealtimeBindings.transit_realtime.FeedEntity.verify(feedEntity));
        });

        var encodedMessage = GtfsRealtimeBindings.transit_realtime.FeedMessage.encode(feedMessage).finish();
        //var decodedMessage = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(encodedMessage);
        // console.log(feedMessage.entity[0]);
        // console.log("----------------------------------------")
        //console.log(decodedMessage.entity);
        //res.set("Content-Length",encodedMessage.length.toString());
        res.set("Content-Type","application/x-protobuf");
        
        //res.set("Transfer-Encoding","chunked");
        res.end(encodedMessage);
        //console.log("Sent data. Content Length " + encodedMessage.length);
    });
});
app.use("/.netlify/functions/server",router);

module.exports = app;
module.exports.handler = serverless(app);

