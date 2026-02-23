const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  simNumber: {
    type: String,
    required: true,
    index: true
  },

  coordinates: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number],   // [lng, lat]
      required: true
    }
  },

  timestamp: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 3   // Auto delete after 3 days
  }
});

// Geo index (for maps)
locationSchema.index({ coordinates: "2dsphere" });

// Fast query index
locationSchema.index({ simNumber: 1, timestamp: -1 });

module.exports = mongoose.model("Location", locationSchema);