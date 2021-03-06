[![Netlify Status](https://api.netlify.com/api/v1/badges/1e85c3f6-1242-4394-acf2-10a9f606b180/deploy-status)](https://app.netlify.com/sites/nervous-wing-1097db/deploys)
[![Coverage Status](https://coveralls.io/repos/github/jonathonwpowell/transloc-to-gtfs-real-time/badge.svg?branch=master)](https://coveralls.io/github/jonathonwpowell/transloc-to-gtfs-real-time?branch=master)
[![Build Status](https://travis-ci.org/jonathonwpowell/transloc-to-gtfs-real-time.svg?branch=master)](https://travis-ci.org/jonathonwpowell/transloc-to-gtfs-real-time)
[![Dependencies Status](https://david-dm.org/jonathonwpowell/transloc-to-gtfs-real-time/status.svg)](https://david-dm.org/jonathonwpowell/transloc-to-gtfs-real-time)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# transloc-to-gtfs-real-time
The goal of this project is to create a method of converting the proprietary Transloc API to gtfs realtime.
This will allow for the data to be in a standardized format, to be used for ingestion by other programs such as google maps.

# To run locally
- Clone locally
- Run `yarn install` to install dependancies
- Run `yarn start` to start the server
The program will start, and is at http://localhost:3000/.netlify/functions/server

# To run on Netlify
The program is designed to run on a function on AWS that can de deployed onto Netlify. Use `yarn install && yarn run build` as the build command on netlify.  The master branch of this repository is being automatically deployed to https://nervous-wing-1097db.netlify.com/.netlify/functions/server currently

# How to use
The program currently has two endpoints:

`/vehiclepositions/<agencyId>`, this can be tested at https://nervous-wing-1097db.netlify.com/.netlify/functions/server/vehiclepositions/20 (or with any other agency ID)
 
 `/tripupdates/<agencyId>`, this can be tested at https://nervous-wing-1097db.netlify.com/.netlify/functions/server/tripupdates/20 (or with any other agency ID)
 
 # Current Limitations
 Currently the transloc API does not provide a means to map a vehicle to a specific trip, such as a trip_id or start time / end time.  Without this data it is impossible to know for sure when a vehicle is supposed to arrive at a specific stop.  It also inhibits the use of this data for ingestion into Google Maps, as Google Maps seems to require trip_id to show any realtime data.
 
 Currently my API key for Transloc is located in src > utilities > constants.js.  Feel free to use it for testing, but I would recommend not using it if you plan on running large volumes of requests.
 
 # Helpful Tools
 Here is a list of helpful tools I have used along the way:
  - [Awesome-Transit](https://project-awesome.org/CUTR-at-USF/awesome-transit#gtfs-realtime-convertors): A list of great tools for transit data, I got most of the tools I used from there
  - [OneBusAway Realtime Visualizer](https://github.com/OneBusAway/onebusaway-gtfs-realtime-visualizer/wiki): Used to sanity check output
  - [GTFS Realtime Reference](https://developers.google.com/transit/gtfs-realtime/reference): Reference for the GTFS Realtime format
  - [GTFS Realtime Validator](https://github.com/CUTR-at-USF/gtfs-realtime-validator): Used to validate the GTFS REaltime feed being generated
  - [Transloc API](https://rapidapi.com/transloc/api/openapi-1-2): API that provides vehicle data, including realtime vehicle locations
