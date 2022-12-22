var express = require("express"),
  bodyParser = require("body-parser"),
  app = express(),
  cron = require("node-cron"),
  xml2js = require("xml2js"),
  //Create parser object for XML parsing
  xmlparser = new xml2js.Parser();

//Node fetch is funky since 3.0, supports only import statements, so easy workaround is this
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

let dnzDrones = [];

app.use(bodyParser.json());

//Fetching the pilot information of given serial number
async function fetchDetails(pilotid) {
  try {
    //Fetch pilot details from API
    let pilot = await fetch(
      `http://assignments.reaktor.com/birdnest/pilots/${pilotid}`,
      {
        method: "GET",
      }
    ).then((response) => {
      //Return the response in JSON
      return response.json();
    });
    return pilot;
  } catch (err) {
    console.log(err);
  }
}

//Main function for fetching all the drones, and handling the data from raw fetches, to a polished array.
async function fetchDrones() {
  try {
    //Fetch drones from API
    let drones = await fetch("http://assignments.reaktor.com/birdnest/drones", {
      method: "GET",
    }).then((response) => {
      //Return the response in XML
      return response.text();
    });
    //Parse the XML
    let parsedResult = await xmlparser.parseStringPromise(drones);
    //For the sake of readibility, assign the drones as objects to this variable to make it a little easier to read.
    //Otherwise playing with stuff like parsedResult.report.capture[0].drone[0] is a mess for the most part.
    let dronesObjects = parsedResult.report.capture[0].drone;

    //Loop over fetched drones. Fetched data is relatively small, so looping shouldn't be a problem.
    for (const item in dronesObjects) {
      const x = parseInt(dronesObjects[item].positionX);
      const y = parseInt(dronesObjects[item].positionY);
      const distanceToNest = distanceBetween(x, y);

      //Check if the drone already exists in the array
      //Could also do dnzDrones.some method
      const check = dnzDrones.filter(
        (pilot) => pilot.serialNumber === dronesObjects[item].serialNumber[0]
      );
      //Check if current drone is in no-fly zone
      if (distanceToNest <= 100) {
        if (check.length > 0) {
          console.log(`Old distance ${check[0].distance}`)
          console.log(`New distance ${distanceToNest}`)
          //Update the distance to nest, if last distance was further
          check[0].distance > distanceToNest
            ? (check[0].distance = distanceToNest)
            : null;
          check[0].timeStamp =
            parsedResult.report.capture[0]["$"].snapshotTimestamp;
          //Replace the item in array with map
          dnzDrones = dnzDrones.map(
            (obj) =>
              check.find((o) => o.serialNumber === obj.serialNumber) || obj
          );
        } else {
          //Fetch pilot details and push to array. Include distance, timestamp and serialNumber.
          const pilot = await fetchDetails(dronesObjects[item].serialNumber);
          dnzDrones.push({
            distance: distanceToNest,
            email: pilot.email,
            firstName: pilot.firstName,
            lastName: pilot.lastName,
            phoneNumber: pilot.phoneNumber,
            pilotId: pilot.pilotId,
            serialNumber: dronesObjects[item].serialNumber[0],
            timeStamp: parsedResult.report.capture[0]["$"].snapshotTimestamp,
          });
        }
      } else if (distanceToNest > 100 && check.length > 0) {
        //If drone was detected, already exists in the array but wasn't in no-fly zone
        //Update the timestamp
        check[0].timeStamp =
          parsedResult.report.capture[0]["$"].snapshotTimestamp;
        dnzDrones = dnzDrones.map(
          (obj) => check.find((o) => o.serialNumber === obj.serialNumber) || obj
        );
      }
    }
    //Filter out expired results from over 10 minutes ago and sort alphabetically
    const timeFiltered = dnzDrones.filter((item) => !checkTime(item.timeStamp));
    dnzDrones = timeFiltered.sort((a, b) =>
      a.firstName.localeCompare(b.firstName)
    );

    return parsedResult;
  } catch (err) {
    console.log(err);
  }
}

//Check if the timestamp is older than 10 minutes
const checkTime = (timestamp) => {
  //Convert timestamp to milliseconds
  const givenTime = new Date(timestamp).getTime();
  //Since 1 minute is 60 000 milliseconds -> multiply by 10, returns false if over 60k milliseconds ago
  return Date.now() - givenTime > 10 * 60 * 1000;
};

//Calculate distance to the center of no-fly zone using pythagoras
const distanceBetween = (x, y) => {
  //250000 is the dead center of no-fly zone
  const a = 250000 - x;
  const b = 250000 - y;
  const distance = Math.sqrt(a * a + b * b);
  //Divide by 1000, so returned value is in meters.
  return distance / 1000;
};

//Endpoint to fetch all the drones
app.get("/drones", function (req, res) {
  res.send(dnzDrones);
});

app.set("port", process.env.PORT || 5000);

app.listen(app.get("port"), function () {
  console.log("Proxy server listening on port " + app.get("port"));
});

//Use cron schedule for updating the drones, every 3 seconds.
cron.schedule("*/3 * * * * *", async () => {
  const items = await fetchDrones();
  console.log(
    "Fetched: " +
      new Date().getHours() +
      ":" +
      new Date().getMinutes() +
      ":" +
      new Date().getSeconds()
  );
});
