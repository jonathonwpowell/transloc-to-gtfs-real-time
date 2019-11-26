const conversions = require('./conversions')

describe('MPH to M/S conversion test', () => {
  test('Basic mph to m/s conversion', () => {
    expect(conversions.mphToMetersPerSec(1)).toBeCloseTo(0.44704)
  })

  test('Test with no speed', () => {
    expect(conversions.mphToMetersPerSec(0)).toBeCloseTo(0)
  })

  test('Test with high speed', () => {
    expect(conversions.mphToMetersPerSec(123)).toBeCloseTo(54.985)
  })

  test('Test with decimals', () => {
    expect(conversions.mphToMetersPerSec(64.5)).toBeCloseTo(28.83408)
  })

  test('Test with negative speed', () => {
    expect(conversions.mphToMetersPerSec(-64.5)).toBeCloseTo(-28.83408)
  })
})

describe('Timestamp to Unix time test', () => {
  test('Test using null timestamp', () => {
    // Passing in no value is not supported behavior.
    // TODO: Think more about what should happen here
    expect(conversions.timestampToUnix()).toBe(NaN)
  })

  test('Basic timestamp conversion with transloc format', () => {
    expect(conversions.timestampToUnix('2019-11-26T18:30:52+00:00')).toBe(1574793052)
  })

  test('Basic timestamp conversion in the future', () => {
    expect(conversions.timestampToUnix('2055-01-26T12:30:52+00:00')).toBe(2684579452)
  })
})
