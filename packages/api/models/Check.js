const mongoose = require("mongoose");

const checkSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Please provide a name for the check"],
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    protocol: {
      type: String,
      required: true,
      enum: ["HTTP", "HTTPS", "TCP"],
      uppercase: true,
    },
    path: {
      type: String,
      trim: true,
    },
    port: Number,
    timeout: {
      type: Number,
      default: 5,
    },
    interval: {
      type: Number,
      default: 10,
    },
    threshold: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["up", "down", "paused"],
      default: "paused",
    },
    lastChecked: Date,
  },
  {
    timestamps: true,
  }
);

const Check = mongoose.model("Check", checkSchema);
module.exports = Check;
