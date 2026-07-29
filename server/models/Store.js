const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Store || mongoose.model('Store', storeSchema);
