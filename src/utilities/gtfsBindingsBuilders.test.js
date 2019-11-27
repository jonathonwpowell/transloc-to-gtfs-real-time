const gtfs = require('./gtfsBindingsBuilders')

const noEstimatesData =
      {
        standing_capacity: null,
        description: null,
        seating_capacity: null,
        last_updated_on: '2019-11-26T22:25:31+00:00',
        call_name: '1701',
        speed: 0,
        vehicle_id: '4015293',
        segment_id: null,
        passenger_load: 0.018518518518518517,
        route_id: '4010486',
        arrival_estimates: [],
        tracking_status: 'up',
        location: {
          lat: 35.79107,
          lng: -78.73659
        },
        heading: 63
      }

const withEstimatesData =
      {
        standing_capacity: null,
        description: null,
        seating_capacity: null,
        last_updated_on: '2019-11-27T02:27:34+00:00',
        call_name: '1726',
        speed: 0,
        vehicle_id: '4015865',
        segment_id: '4384559',
        passenger_load: 0.07407407407407407,
        route_id: '4000100',
        arrival_estimates: [
          {
            route_id: '4000100',
            arrival_at: '2019-11-26T21:28:03-05:00',
            stop_id: '4216578'
          },
          {
            route_id: '4000100',
            arrival_at: '2019-11-26T21:28:58-05:00',
            stop_id: '4105082'
          },
          {
            route_id: '4000100',
            arrival_at: '2019-11-26T21:30:32-05:00',
            stop_id: '4102042'
          }
        ],
        tracking_status: 'up',
        location: {
          lat: 35.781435,
          lng: -78.672195
        },
        heading: 196
      }

describe('Vehicle Position Builder', () => {
  test('with no arrival estimates', () => {
    expect(gtfs.createVehiclePos(noEstimatesData).toJSON()).toEqual({
      position: {
        bearing: 63,
        latitude: 35.79107,
        longitude: -78.73659,
        speed: 0
      },
      timestamp: '1574807131',
      trip: {
        routeId: '4010486'
      },
      vehicle: {
        id: '4015293'
      }
    })
  })

  test('with arrival estimates', () => {
    expect(gtfs.createVehiclePos(withEstimatesData).toJSON()).toEqual({
      position: {
        bearing: 196,
        latitude: 35.781435,
        longitude: -78.672195,
        speed: 0
      },
      timestamp: '1574821654',
      trip: {
        routeId: '4000100'
      },
      vehicle: {
        id: '4015865'
      }
    })
  })
})

describe('Trip Update Builder', () => {
  test('with no arrival estimates', () => {
    expect(gtfs.createTripUpdate(noEstimatesData).toJSON()).toEqual({
      timestamp: '1574807131',
      trip: {
        routeId: '4010486'
      },
      vehicle: {
        id: '4015293'
      }
    })
  })

  test('with arrival estimates', () => {
    expect(gtfs.createTripUpdate(withEstimatesData).toJSON()).toEqual({
      stopTimeUpdate: [
        {
          arrival: {
            time: '1574821683'
          },
          stopId: '4216578'
        },
        {
          arrival: {
            time: '1574821738'
          },
          stopId: '4105082'
        },
        {
          arrival: {
            time: '1574821832'
          },
          stopId: '4102042'
        }
      ],
      timestamp: '1574821654',
      trip: {
        routeId: '4000100'
      },
      vehicle: {
        id: '4015865'
      }
    })
  })
})

describe('Vehicle Description Builder', () => {
  test('Build Vehicle Desciptor with number ID', () => {
    expect(gtfs.createVehicleDescriptor(1).id).toBe(1)
  })

  test('Build Vehicle Desciptor with string ID', () => {
    expect(gtfs.createVehicleDescriptor('1').id).toBe('1')
  })

  test('Built Vehicle Desciptor with null', () => {
    expect(gtfs.createVehicleDescriptor(null).id).toBe('')
  })

  test('Built Vehicle Desciptor with no params', () => {
    expect(gtfs.createVehicleDescriptor().id).toBe('')
  })
})

describe('Feed Header Builder', () => {
  test('Build Feed Header', () => {
    expect(gtfs.createFeedHeader('2019-11-26T22:25:31+00:00').toJSON()).toEqual({
      gtfsRealtimeVersion: '2.0',
      incrementality: 'FULL_DATASET',
      timestamp: '1574807131'
    })
  })
})
