const launchesDataBase = require("./launches.mongo");
const planets = require("./planets.mongo");
const axios = require("axios");
// const launches = new Map();
let DEFULT_FLIGHT_NUMBER = 100;
const launch = {
  flightNumber: 100,
  mission: "kepler Exploration X",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27, 2030"),
  target: "Kepler-442 b",
  customers: ["ZTM", "NASA"],
  upcoming: true,
  succses: true,
};
saveLaunches(launch);

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";
async function populateLaunches() {
  console.log("downlowding launch data");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  if (response.status !== 200) {
    console.log("problem downloading launch data");
    throw new Error("launch date faild");
  }
  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });
    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers: customers,
    };
    console.log(launch);
    await saveLaunches(launch);
  }
}
async function loadLaunchesData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (firstLaunch) {
    console.log("launch data is already loded");
  } else {
    await populateLaunches();
  }
}
async function findLaunch(filter) {
  return await launchesDataBase.findOne(filter);
}

async function existLaunchWithId(launchID) {
  return await findLaunch({
    flightNumber: launchID,
  });
}

async function gatLatestFlightNumber() {
  const latestLaunch = await launchesDataBase.findOne().sort("-flightNumber");

  if (!latestLaunch) {
    return DEFULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
  return await launchesDataBase
    .find({}, { __V: 0, _id: 0 })
    .sort({
      flightNumber: 1,
    })
    .skip(skip)
    .limit(limit);
}
async function saveLaunches(launch) {
  await launchesDataBase.findOneAndUpdate(
    { flightNumber: launch.flightNumber },
    launch,
    {
      upsert: true,
    }
  );
}
// function addNewLaunch(launch) {
//   latestFligtNumber++;
//   launches.set(
//     latestFligtNumber,
//     Object.assign(launch, {
//       flightNumber: latestFligtNumber,
//       upcoming: true,
//       succses: true,
//       customers: ["Eyar Amiran", "NASA"],
//     })
//   );
// }

async function scheduleNewLaunch(launch) {
  const planet = await planets.findOne({
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error("the planet is not find");
  }

  const newFlightNumber = (await gatLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    succses: true,
    upcoming: true,
    customers: ["eyar", "poky"],
    flightNumber: newFlightNumber,
  });
  await saveLaunches(newLaunch);
}
async function abortLaunchById(launchId) {
  const aborted = await launchesDataBase.updateOne(
    { flightNumber: launchId },
    {
      upcoming: false,
      success: false,
    }
  );

  return aborted.modifiedCount === 1;
}
module.exports = {
  loadLaunchesData,
  getAllLaunches,
  scheduleNewLaunch,
  existLaunchWithId,
  abortLaunchById,
};
