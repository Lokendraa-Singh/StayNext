const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

// username, hash and salt are added automatically by this plugin
userSchema.plugin(passportLocalMongoose.default || passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);