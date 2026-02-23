const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Location = require("../models/Location");

/*
=================================================
ADMIN SEARCH USER
Search by:
- email
OR
- simNumber

URL:
GET /api/admin/search?query=value
=================================================
*/

router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query required" });
    }

    // Search by email OR simNumber
    const user = await User.findOne({
      $or: [
        { email: query },
        { simNumber: query }
      ]
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, user });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


/*
=================================================
ADMIN: GET USER LAST 3 DAYS ROUTE
URL:
GET /api/admin/history/:simNumber
=================================================
*/

router.get("/history/:simNumber", async (req, res) => {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const locations = await Location.find({
      simNumber: req.params.simNumber,
      timestamp: { $gte: threeDaysAgo }
    }).sort({ timestamp: 1 });

    res.json({ success: true, count: locations.length, locations });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;