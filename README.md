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

# To use
The program currently has two endpoints
/vehiclepositions/<agencyId>, this can be tested at https://nervous-wing-1097db.netlify.com/.netlify/functions/server/vehiclepositions/20
 /tripupdates/<agencyId>, this can be tested at https://nervous-wing-1097db.netlify.com/.netlify/functions/server/tripupdates/20 
