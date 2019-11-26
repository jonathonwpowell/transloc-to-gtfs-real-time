const GtfsRealtimeBindings = require('gtfs-realtime-bindings');

function createVehicleDescriptor(id) {
    return new GtfsRealtimeBindings.transit_realtime.VehicleDescriptor({
        "id": id
    });
}

module.exports = {createVehicleDescriptor}