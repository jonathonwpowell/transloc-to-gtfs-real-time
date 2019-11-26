const conversions = require("./conversions");

test('Basic mph to m/s conversion', () => {
    expect(conversions.mphToMetersPerSec(1)).toBeCloseTo(0.44704);
});

test('Test with no speed', () => {
    expect(conversions.mphToMetersPerSec(0)).toBeCloseTo(0);
});

test('Test with high speed', () => {
    expect(conversions.mphToMetersPerSec(123)).toBeCloseTo(54.985);
});

test('Test with decimals', () => {
    expect(conversions.mphToMetersPerSec(64.5)).toBeCloseTo(28.83408);
});

test('Test with negative speed', () => {
    expect(conversions.mphToMetersPerSec(-64.5)).toBeCloseTo(-28.83408);
});