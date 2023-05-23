const http = require("http");
require("dotenv").config();
const app = require("./app");
const mongoConnect = require("./services/mongo");
const { loadPlanetsData } = require("../models/planets.modle");
const { loadLaunchesData } = require("../models/launches.modle");
const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchesData();
  server.listen(PORT, () => {
    console.log(`we are lisening on port ${PORT}`);
  });
}
startServer();
``;
