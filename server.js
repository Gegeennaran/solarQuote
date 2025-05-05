import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.SOLAR_API_KEY; // same key used for both APIs

app.use(cors());
app.use(express.json());

app.post('/api/solar', async (req, res) => {
  const { address } = req.body;
  if (!address) {
    return res.status(400).json({ error: 'Missing address' });
  }

  try {
    // Step 1: Geocode the address to get lat/lng
    const geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;
    const geoRes = await fetch(geocodeURL);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    const { lat, lng } = geoData.results[0].geometry.location;
    console.log(`📍 Geocoded: ${lat}, ${lng}`);

    // Step 2: Use lat/lng to call the Solar API
    const solarURL = `https://solar.googleapis.com/v1/buildingInsights:findClosest?key=${API_KEY}`;
    const solarRes = await fetch(solarURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: {
          latLng: { latitude: lat, longitude: lng },
        },
      }),
    });

    const solarText = await solarRes.text();
    console.log('☀️ Solar API response:', solarText);

    let solarData;
    try {
      solarData = JSON.parse(solarText);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to parse Solar API response' });
    }

    res.status(solarRes.status).json(solarData);
  } catch (err) {
    console.error('🚨 Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/', (req, res) => {
  res.send('☀️ Solar API Proxy is running with geocoding.');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
