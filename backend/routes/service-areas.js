// backend/routes/service-areas.js
const express = require("express")
const router = express.Router()
const axios = require("axios")

// List of cities where we provide service
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

// Check if a zip code is in our service area
router.get("/check", async (req, res) => {
  const { zipCode } = req.query

  if (!zipCode) {
    return res.status(400).json({ message: "Zip code is required" })
  }

  try {
    // Use a geocoding service to convert zip code to city
    // For this example, we're using the free Zippopotam.us API
    const response = await axios.get(`https://api.zippopotam.us/us/${zipCode}`)

    if (response.data && response.data.places && response.data.places.length > 0) {
      const city = response.data.places[0]["place name"]

      // Check if the city is in our service areas
      const available = SERVICE_AREAS.some((area) => area.toLowerCase() === city.toLowerCase())

      return res.json({
        available,
        city,
        zipCode,
      })
    } else {
      return res.status(404).json({
        message: "Invalid zip code or location not found",
        available: false,
      })
    }
  } catch (error) {
    console.error("Error checking service area:", error)

    // Handle specific error for invalid zip code
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        message: "Invalid zip code",
        available: false,
      })
    }

    return res.status(500).json({
      message: "Error checking service area",
      error: error.message,
      available: false,
    })
  }
})

// Get all service areas
router.get("/", (req, res) => {
  res.json(SERVICE_AREAS)
})

module.exports = router
