const { Source } = require('../models');

async function listSources(req, res) {
  try {
    const sources = await Source.find({}, { createdAt: -1 });
    res.json({ success: true, data: sources });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function createSource(req, res) {
  try {
    const { name, url, category, type = 'rss', pollIntervalMinutes = 240 } = req.body;
    if (!name || !url || !category) {
      return res.status(400).json({ success: false, error: 'Name, URL, and category are required' });
    }

    const newSource = await Source.create({
      name,
      url,
      category,
      type,
      pollIntervalMinutes: parseInt(pollIntervalMinutes, 10) || 240,
      active: true,
      itemsFetched: 0
    });

    res.status(201).json({ success: true, data: newSource });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function updateSource(req, res) {
  try {
    const updated = await Source.findByIdAndUpdate(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Source not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function toggleSource(req, res) {
  try {
    const source = await Source.findById(req.params.id);
    if (!source) return res.status(404).json({ success: false, error: 'Source not found' });

    const updated = await Source.findByIdAndUpdate(req.params.id, { active: !source.active });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function deleteSource(req, res) {
  try {
    const deleted = await Source.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Source not found' });
    res.json({ success: true, message: 'Source deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  listSources,
  createSource,
  updateSource,
  toggleSource,
  deleteSource
};
