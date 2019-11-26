const gtfsBindingsBuilders = require('./gtfsBindingsBuilders')

test('Build Vehicle Desciptor with number ID', () => {
  expect(gtfsBindingsBuilders.createVehicleDescriptor(1).id).toBe(1)
})

test('Build Vehicle Desciptor with string ID', () => {
  expect(gtfsBindingsBuilders.createVehicleDescriptor('1').id).toBe('1')
})

test('Built Vehicle Desciptor with null', () => {
  expect(gtfsBindingsBuilders.createVehicleDescriptor(null).id).toBe('')
})

test('Built Vehicle Desciptor with no params', () => {
  expect(gtfsBindingsBuilders.createVehicleDescriptor().id).toBe('')
})
