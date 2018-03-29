import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import dotenv from 'dotenv';


dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/api/cities', async (req: any, res: any ) => {
  try {
    const cities = await prisma.city.findMany();
    res.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ error: 'Failed to fetch cities' });
  }
});

app.post('/api/cities', async (req: any, res: any) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'City name is required' });
  }

  try {
    const city = await prisma.city.create({
      data: { name },
    });
    res.status(201).json(city);
  } catch (error) {
    console.error('Error adding city:', error);
    res.status(500).json({ error: 'Failed to add city' });
  }
});

app.get('api/cities/:id/weather', async (req: any, res: any) => {
  const { id } = req.params;

  try {
    const city = await prisma.city.findUnique({
      where: { id: Number(id) },
    });

    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }

   const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city.name}&appid=${process.env.WEATHER_API_KEY}&units=metric`);

   const weatherData = {
      city: city.name,
      temperature: response.data.main.temp,
      condition: response.data.weather[0].description
   }
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
})


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
