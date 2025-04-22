const express = require("express")
const router = express.Router()

// Service areas - cities where we provide service
const SERVICE_AREAS = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
  "San Jose",
]

// Zip code to city mapping (simplified example)
const ZIP_CODE_MAP = {
  10001: "New York",
  10002: "New York",
  90001: "Los Angeles",
  90002: "Los Angeles",
  60601: "Chicago",
  77001: "Houston",
  85001: "Phoenix",
  19101: "Philadelphia",
  78201: "San Antonio",
  92101: "San Diego",
  75201: "Dallas",
  95101: "San Jose",
}

// Check if service is available in a zip code
router.get("/check", (req, res) => {
  const { zipCode } = req.query

  if (!zipCode) {
    return res.status(400).json({ message: "Zip code is required" })
  }

  const city = ZIP_CODE_MAP[zipCode]
  const available = city && SERVICE_AREAS.includes(city)

  res.json({
    zipCode,
    city: city || "Unknown",
    available: !!available,
  })
})

// Get all service areas
router.get("/", (req, res) => {
  res.json(SERVICE_AREAS)
})

module.exports = router
