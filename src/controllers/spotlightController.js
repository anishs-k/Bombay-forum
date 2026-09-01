const { Spotlight } = require('../models');

async function submitInquiry(req, res) {
  try {
    const { brandName, contactName, contactEmail, contactPhone, package: pkg, budget, message } = req.body;

    if (!brandName || !contactEmail || !contactName) {
      return res.status(400).json({ success: false, error: 'Brand name, contact name, and email are required.' });
    }

    const newSpotlight = await Spotlight.create({
      brandName,
      contactName,
      contactEmail,
      contactPhone: contactPhone || '',
      package: pkg || 'Dedicated Editorial',
      budget: budget || '',
      message: message || '',
      status: 'new'
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out. The TBF Brand Partnerships desk will review your submission within 24 hours.',
      data: newSpotlight
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function listSpotlights(req, res) {
  try {
    const spotlights = await Spotlight.find({}, { createdAt: -1 });
    res.json({ success: true, data: spotlights });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function updateSpotlightStatus(req, res) {
  try {
    const { status } = req.body;
    const updated = await Spotlight.findByIdAndUpdate(req.params.id, { status });
    if (!updated) return res.status(404).json({ success: false, error: 'Spotlight record not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  submitInquiry,
  listSpotlights,
  updateSpotlightStatus
};
