import mongoose from 'mongoose';
import GermanyMin15Prices from '../../models/min15Prices'; // Adjust path to your model

const mongoURI = process.env.MONGO_URI || 'mongodb+srv://max:Julian1705@strom.vm0dp8f.mongodb.net/?retryWrites=true&w=majority&appName=Strom';

async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect(mongoURI);
  } catch (err) {
    throw new Error(`MongoDB connection failed: ${err.message}`);
  }
}

// Parse DD/MM/YYYY to YYYY-MM-DD
function parseDeliveryDay(dateStr) {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split('/');
  const parsedDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
  return !isNaN(parsedDate) ? parsedDate.toISOString().split('T')[0] : null;
}

// Calculate ISO calendar week
function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { year: d.getFullYear(), week: weekNo };
}

// Format week as string (e.g., "KW 42 2025")
function formatWeek(weekObj) {
  return `KW ${weekObj.week} ${weekObj.year}`;
}

// Sort weeks chronologically
function sortWeeks(weeks) {
  return weeks.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.week - b.week;
  });
}

export default async function handler(req, res) {
  try {
    await connectDB();
    const data = await GermanyMin15Prices.find({}).lean();

    const parsedDates = data.map(item => parseDeliveryDay(item['Delivery day'])).filter(date => date !== null);
    const uniqueWeeks = [...new Set(parsedDates.map(date => {
      const weekObj = getISOWeek(new Date(date));
      return JSON.stringify(weekObj);
    }))].map(str => JSON.parse(str));
    const sortedUniqueWeeks = sortWeeks(uniqueWeeks);

    // Calculate weekly averages
    const weeklyAverages = sortedUniqueWeeks.map(weekObj => {
      const filteredData = data.filter(record => {
        const date = parseDeliveryDay(record['Delivery day']);
        if (!date) return false;
        const recordWeek = getISOWeek(new Date(date));
        return recordWeek.year === weekObj.year && recordWeek.week === weekObj.week;
      });

      const priceFields = Array.from({ length: 24 }, (_, h) => {
        const hour = h + 1;
        if (hour === 3) {
          return ['Hour 3A Q1', 'Hour 3A Q2', 'Hour 3A Q3', 'Hour 3A Q4', 'Hour 3B Q1', 'Hour 3B Q2', 'Hour 3B Q3', 'Hour 3B Q4'];
        }
        return [
          `Hour ${hour} Q1`,
          `Hour ${hour} Q2`,
          `Hour ${hour} Q3`,
          `Hour ${hour} Q4`,
        ];
      }).flat();

      let totalSum = 0;
      let totalCount = 0;

      filteredData.forEach(record => {
        priceFields.forEach(field => {
          const value = record[field]?.$numberDouble || record[field]?.$numberInt || record[field] || null;
          if (value !== null) {
            const parsedValue = parseFloat(value);
            if (!isNaN(parsedValue)) {
              totalSum += parsedValue;
              totalCount++;
            }
          }
        });
      });

      return {
        week: weekObj,
        average: totalCount > 0 ? (totalSum / totalCount) * 0.1 : null, // Convert to ct/kWh
      };
    });

    // Group by month
    const monthlyData = {};
    weeklyAverages.forEach(({ week, average }) => {
      const date = new Date(week.year, 0, 1 + (week.week - 1) * 7);
      const monthKey = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      if (!monthlyData[monthKey]) monthlyData[monthKey] = [];
      if (average !== null) {
        monthlyData[monthKey].push({
          kw: week.week.toString().padStart(2, '0'),
          year: week.year,
          average: average.toFixed(2),
        });
      }
    });

    res.status(200).json({ monthlyData });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: `Failed to fetch data: ${err.message}` });
  }
}