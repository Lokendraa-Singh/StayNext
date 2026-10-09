require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });
require("node:dns").setServers(["8.8.8.8", "1.1.1.1"]);

const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const initData = require("./data.js");

const MONGO_URL =
  process.env.ATLAS_DB_URL || "mongodb://127.0.0.1:27017/wanderLust";

async function main() {
  await mongoose.connect(MONGO_URL);
}

async function initDB() {
  await Listing.deleteMany({});

  // sample listings need an owner, so create (or reuse) a demo user
  let demoUser = await User.findOne({ username: "demo" });
  if (!demoUser) {
    demoUser = await User.register(
      new User({ username: "demo", email: "demo@wanderlust.com" }),
      "demo1234",
    );
    console.log("Demo user created -> username: demo, password: demo1234");
  }

  const listings = initData.data.map((obj) => ({
    ...obj,
    owner: demoUser._id,
  }));
  await Listing.insertMany(listings);

  console.log("data was initialized");
}

main()
  .then(() => {
    console.log("Connected to DB");
    return initDB();
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => mongoose.connection.close());
