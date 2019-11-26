const gtfsBindingsBuilders = require("./gtfsBindingsBuilders");

test('Build Vehicle Desciptor with number ID', () => {
    expect(gtfsBindingsBuilders.createVehicleDescriptor(1).id).toBe(1);
});

test('Build Vehicle Desciptor with string ID', () => {
    expect(gtfsBindingsBuilders.createVehicleDescriptor("1").id).toBe("1");
});

test('Built Vehicle Desciptor null', () => {
    expect(gtfsBindingsBuilders.createVehicleDescriptor(null).id).toBe("");
});