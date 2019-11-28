const webCallUtils = require('./webCallUtils')

const emptyArray = {
  body: {
    rate_limit: 1,
    expires_in: 1,
    api_latest_version: '1.2',
    generated_on: '2014-01-03T21:22:05+00:00',
    data: {},
    api_version: '1.2'
  }
}

const oneAgencyArray = {
  body: {
    rate_limit: 1,
    expires_in: 1,
    api_latest_version: '1.2',
    generated_on: '2014-01-03T21:22:05+00:00',
    data: {
      16: [
        {
          description: null,
          passenger_load: null,
          standing_capacity: null,
          seating_capacity: null,
          last_updated_on: '2014-01-03T21:12:47.570000+00:00',
          call_name: '4281',
          speed: 0,
          vehicle_id: '4002320',
          segment_id: '4043935',
          route_id: '4000098',
          arrival_estimates: [],
          tracking_status: 'up',
          location: {
            lat: 35.78867,
            lng: -78.67292
          },
          heading: 101
        },
        {
          description: null,
          passenger_load: 17,
          standing_capacity: 25,
          seating_capacity: 20,
          last_updated_on: '2014-01-03T21:12:47.553000+00:00',
          call_name: '4278',
          speed: 31.484,
          vehicle_id: '4000196',
          segment_id: '4055095',
          route_id: '4002998',
          arrival_estimates: [
            {
              route_id: '4002998',
              arrival_at: '2014-01-03T16:22:54-05:00',
              stop_id: '4099366'
            },
            {
              route_id: '4002998',
              arrival_at: '2014-01-03T16:36:29-05:00',
              stop_id: '4102038'
            }
          ],
          tracking_status: 'up',
          location: {
            lat: 35.78919,
            lng: -78.69319
          },
          heading: 93
        }
      ]
    },
    api_version: '1.2'
  }
}

const oneAgencyArrayWithError = Object.assign({ error: 'bad things have happened' }, oneAgencyArray.body)
const noBodyWithError = { error: 'bad things have happened' }

describe('get vehicle data', () => {
  test('empty vehicle array', () => {
    expect(webCallUtils.getVehicleArray(emptyArray, 16)).toEqual([])
  })

  test('no response data', () => {
    expect(webCallUtils.getVehicleArray({}, 16)).toEqual([])
  })

  test('wrong agency ID', () => {
    expect(webCallUtils.getVehicleArray(oneAgencyArray, 15)).toEqual([])
  })

  test('no agency ID', () => {
    expect(webCallUtils.getVehicleArray(oneAgencyArray)).toEqual([])
  })

  test('with right agency ID', () => {
    expect(webCallUtils.getVehicleArray(oneAgencyArray, 16)).toEqual(oneAgencyArray.body.data[16])
  })
})

describe('create transloc call', () => {
  test('create endpoint', () => {
    const generatedCall = webCallUtils.createTranslocCall(16, 'abcd')
    expect(generatedCall.options.headers).toEqual({
      'x-rapidapi-host': 'transloc-api-1-2.p.rapidapi.com',
      'x-rapidapi-key': 'abcd'
    })
    expect(generatedCall.options.url).toBe('https://transloc-api-1-2.p.rapidapi.com/vehicles.json?callback=call&agencies=16')
  })
})

describe('create trip update feed message', () => {
  test('one agency with response error', () => {
    const result = webCallUtils.getTripUpdateFeedMessage(oneAgencyArrayWithError, 16).toJSON()
    expect(result).toHaveProperty('header')
    expect(result).toHaveProperty('header.timestamp')
    expect(result).toHaveProperty('header.gtfsRealtimeVersion')
    expect(result).toHaveProperty('header.incrementality')
    expect(result).not.toHaveProperty('entity')
  })

  test('no body with response error', () => {
    const result = webCallUtils.getTripUpdateFeedMessage(noBodyWithError, 16).toJSON()
    expect(result).toHaveProperty('header')
    expect(result).toHaveProperty('header.timestamp')
    expect(result).toHaveProperty('header.gtfsRealtimeVersion')
    expect(result).toHaveProperty('header.incrementality')
    expect(result).not.toHaveProperty('entity')
  })
  test('no agency ID', () => {
    expect(webCallUtils.getTripUpdateFeedMessage(oneAgencyArray, null).toJSON()).toEqual({
      header: {
        gtfsRealtimeVersion: '2.0',
        incrementality: 'FULL_DATASET',
        timestamp: '1388784125'
      }
    })
  })

  test('empty agency', () => {
    expect(webCallUtils.getTripUpdateFeedMessage(emptyArray, 16).toJSON()).toEqual({
      header: {
        gtfsRealtimeVersion: '2.0',
        incrementality: 'FULL_DATASET',
        timestamp: '1388784125'
      }
    })
  })

  test('with agency and vehicles', () => {
    expect(webCallUtils.getTripUpdateFeedMessage(oneAgencyArray, 16).toJSON()).toEqual({
      header: {
        gtfsRealtimeVersion: '2.0',
        incrementality: 'FULL_DATASET',
        timestamp: '1388784125'
      },
      entity: [
        {
          id: '4002320',
          tripUpdate: {
            timestamp: '1388783567.57',
            trip: {
              routeId: '4000098'
            },
            vehicle: {
              id: '4002320'
            }
          }
        },
        {
          id: '4000196',
          tripUpdate: {
            stopTimeUpdate: [
              {
                arrival: {
                  time: '1388784174'
                },
                stopId: '4099366'
              },
              {
                arrival: {
                  time: '1388784989'
                },
                stopId: '4102038'
              }
            ],
            timestamp: '1388783567.553',
            trip: {
              routeId: '4002998'
            },
            vehicle: {
              id: '4000196'
            }
          }
        }
      ]
    })
  })
})

describe('create vehicle position feed message', () => {
  test('one agency with response error', () => {
    const result = webCallUtils.getVehiclePositionFeedMessage(oneAgencyArrayWithError, 16).toJSON()
    expect(result).toHaveProperty('header')
    expect(result).toHaveProperty('header.timestamp')
    expect(result).toHaveProperty('header.gtfsRealtimeVersion')
    expect(result).toHaveProperty('header.incrementality')
    expect(result).not.toHaveProperty('entity')
  })

  test('no body with response error', () => {
    const result = webCallUtils.getVehiclePositionFeedMessage(noBodyWithError, 16).toJSON()
    expect(result).toHaveProperty('header')
    expect(result).toHaveProperty('header.timestamp')
    expect(result).toHaveProperty('header.gtfsRealtimeVersion')
    expect(result).toHaveProperty('header.incrementality')
    expect(result).not.toHaveProperty('entity')
  })

  test('no agency ID', () => {
    expect(webCallUtils.getVehiclePositionFeedMessage(oneAgencyArray, null).toJSON()).toEqual({
      header: {
        gtfsRealtimeVersion: '2.0',
        incrementality: 'FULL_DATASET',
        timestamp: '1388784125'
      }
    })
  })

  test('empty agency', () => {
    expect(webCallUtils.getVehiclePositionFeedMessage(emptyArray, 16).toJSON()).toEqual({
      header: {
        gtfsRealtimeVersion: '2.0',
        incrementality: 'FULL_DATASET',
        timestamp: '1388784125'
      }
    })
  })

  test('with agency and vehicles', () => {
    expect(webCallUtils.getVehiclePositionFeedMessage(oneAgencyArray, 16).toJSON()).toEqual({
      header: {
        gtfsRealtimeVersion: '2.0',
        incrementality: 'FULL_DATASET',
        timestamp: '1388784125'
      },
      entity: [
        {
          id: '4002320',
          vehicle: {
            position: {
              bearing: 101,
              latitude: 35.78867,
              longitude: -78.67292,
              speed: 0
            },
            timestamp: '1388783567.57',
            trip: {
              routeId: '4000098'
            },
            vehicle: {
              id: '4002320'
            }
          }
        },
        {
          id: '4000196',
          vehicle: {
            position: {
              bearing: 93,
              latitude: 35.78919,
              longitude: -78.69319,
              speed: 14.07460736
            },
            timestamp: '1388783567.553',
            trip: {
              routeId: '4002998'
            },
            vehicle: {
              id: '4000196'
            }
          }
        }
      ]
    })
  })
})
