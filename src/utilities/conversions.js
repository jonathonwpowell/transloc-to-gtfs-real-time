function mphToMetersPerSec (mph) {
  return mph * 0.44704
}

// Coverts the transloc timestamp to seconds since epoch
function timestampToUnix (timestamp) {
  return new Date(timestamp).getTime() / 1000
}

module.exports = { mphToMetersPerSec, timestampToUnix }
