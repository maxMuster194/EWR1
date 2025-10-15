import mongoose from 'mongoose';

const min15PricesOldSchema = new mongoose.Schema({
  'Delivery day': {
    type: String,
    required: true,
  },
  // Hourly price fields for 1 to 24, including special case for Hour 3A and 3B
  ...Array.from({ length: 24 }, (_, h) => {
    const hour = h + 1;
    const fields = {};
    if (hour === 3) {
      ['Hour 3A Q1', 'Hour 3A Q2', 'Hour 3A Q3', 'Hour 3A Q4', 'Hour 3B Q1', 'Hour 3B Q2', 'Hour 3B Q3', 'Hour 3B Q4'].forEach(field => {
        fields[field] = { type: mongoose.Schema.Types.Mixed }; // Mixed to handle null, number, or string
      });
    } else {
      [`Hour ${hour} Q1`, `Hour ${hour} Q2`, `Hour ${hour} Q3`, `Hour ${hour} Q4`].forEach(field => {
        fields[field] = { type: mongoose.Schema.Types.Mixed }; // Mixed to handle varying types
      });
    }
    return fields;
  }).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
  // Additional fields
  Afternoon: { type: mongoose.Schema.Types.Mixed },
  Baseload: { type: mongoose.Schema.Types.Mixed },
  Business: { type: mongoose.Schema.Types.Mixed },
  'Early afternoon': { type: mongoose.Schema.Types.Mixed },
  'Early morning': { type: mongoose.Schema.Types.Mixed },
  Evening: { type: mongoose.Schema.Types.Mixed },
  'High noon': { type: mongoose.Schema.Types.Mixed },
  'Late morning': { type: mongoose.Schema.Types.Mixed },
  Maximum: { type: mongoose.Schema.Types.Mixed },
  'Middle night': { type: mongoose.Schema.Types.Mixed },
  Minimum: { type: mongoose.Schema.Types.Mixed },
  Morning: { type: mongoose.Schema.Types.Mixed },
  Night: { type: mongoose.Schema.Types.Mixed },
  'Off-peak': { type: mongoose.Schema.Types.Mixed },
  'Off-peak 1': { type: mongoose.Schema.Types.Mixed },
  'Off-peak 2': { type: mongoose.Schema.Types.Mixed },
  Peakload: { type: mongoose.Schema.Types.Mixed },
  'Rush hour': { type: mongoose.Schema.Types.Mixed },
  'Sun peak': { type: mongoose.Schema.Types.Mixed },
}, { collection: 'GermanyMin15Prices' });

export default mongoose.models.GermanyMin15PricesOld || mongoose.model('GermanyMin15PricesOld', min15PricesOldSchema);