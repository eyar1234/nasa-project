const express = require("express");
const {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
} = require("./launches.controller");

const launchesRouter = express.Router();

launchesRouter.post("/", httpAddNewLaunch);
launchesRouter.get("/", httpGetAllLaunches);
launchesRouter.delete("/:id", httpAbortLaunch);
module.exports = launchesRouter;
