const mongoose = require("mongoose");
const MONGODB_URL =
  "mongodb+srv://eyar2000:fCU31mh4MqtC8zdS@clusternasa.lwi88k0.mongodb.net/nasa?retryWrites=true&w=majority";

mongoose.connection.once("open", () => {
  console.log("mongo is on the air!");
});
mongoose.connection.on("error", (err) => {
  console.error(err);
});

async function mongoConnect() {
  await mongoose.connect(MONGODB_URL);
}
async function mongoDisconnect() {
  await mongoose.disconnect(MONGODB_URL);
}
(module.exports = mongoConnect), mongoDisconnect;
