import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;
const SOLAR_API_KEY = process.env.SOLAR_API_KEY;

app.use(cors());
app.use(express.json());

app.post('/api/solar', async (req, res) => {
  const { address } = req.body;
  if (!address) {
    console.warn('❗ Missing address in request body');
    return res.status(400).json({ error: 'Missing address' });
  }

  try {
    const response = await fetch(
      `https://solar.googleapis.com/v1/buildingInsights:findClosest?key=${SOLAR_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location: { address } }),
      }
    );

    const text = await response.text(); // Raw response text for debugging
    console.log('📦 Raw Google Solar API response:', text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError);
      return res.status(500).json({ error: 'Failed to parse Solar API response' });
    }

    if (!response.ok) {
      console.warn('⚠️ Solar API returned error:', data);
    }

    res.status(response.status).json(data);
  } catch (err) {
    console.error('🚨 Error contacting Solar API:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/', (req, res) => {
  res.send('☀️ Solar API Proxy is running.');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
