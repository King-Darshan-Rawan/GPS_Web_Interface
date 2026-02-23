const express = require("express");
const router = express.Router();
const Location = require("../models/Location");

/*
=================================================
POST GPS DATA (ESP will call this)
URL: POST /api/location
Body:
{
  simNumber: "9876543210",
  lat: 22.7196,
  lng: 75.8577,
  timestamp: "2026-02-22T10:30:00Z"
}
=================================================
*/

router.post("/", async (req, res) => {
  try {
    const { simNumber, lat, lng, timestamp } = req.body;

    // Validation
    if (!simNumber || lat === undefined || lng === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await Location.create({
      simNumber,
      coordinates: {
        type: "Point",
        coordinates: [lng, lat]   // IMPORTANT: [lng, lat]
      },
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });

    res.status(201).json({ success: true, message: "Location saved" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/*
=================================================
GET LAST 3 DAYS HISTORY
URL: GET /api/location/history/:simNumber
=================================================
*/

// router.get("/history/:simNumber", async (req, res) => {
//   try {
//     const threeDaysAgo = new Date();
//     threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

//     const locations = await Location.find({
//       simNumber: req.params.simNumber,
//       timestamp: { $gte: threeDaysAgo }
//     }).sort({ timestamp: 1 });

//     res.json(locations);

//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

router.get("/history/:simNumber", async (req, res) => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const locations = await Location.find({
      simNumber: req.params.simNumber,
      timestamp: { $gte: threeDaysAgo }
    })
    .sort({ timestamp: 1 })
    .select("coordinates timestamp")
    .lean();

    // Downsample: take every 5th point
    const reduced = locations.filter((_, index) => index % 5 === 0);

    res.json(reduced);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
=================================================
GET LATEST LOCATION
URL: GET /api/location/latest/:simNumber
=================================================
*/

router.get("/latest/:simNumber", async (req, res) => {
  try {
    const latest = await Location.findOne({
      simNumber: req.params.simNumber
    }).sort({ timestamp: -1 });

    res.json(latest);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;