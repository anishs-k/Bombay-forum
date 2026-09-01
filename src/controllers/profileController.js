const { Profile } = require('../models');
const { generateSlug } = require('../utils/helpers');

async function listProfiles(req, res) {
  try {
    const { type, status } = req.query;
    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const profiles = await Profile.find(query, { createdAt: -1 });
    res.json({ success: true, data: profiles });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getProfileById(req, res) {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function getProfileBySlug(req, res) {
  try {
    const profile = await Profile.findOne({ slug: req.params.slug });
    if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function createProfile(req, res) {
  try {
    const data = req.body;
    if (!data.name || !data.type || !data.quote) {
      return res.status(400).json({ success: false, error: 'Name, profile type, and signature quote are required' });
    }

    let slug = data.slug ? generateSlug(data.slug) : generateSlug(data.name);
    const existing = await Profile.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const newProfile = await Profile.create({
      name: data.name,
      slug: slug,
      type: data.type,
      company: data.company || '',
      role: data.role || '',
      medium: data.medium || '',
      location: data.location || 'Mumbai, India',
      heroImage: data.heroImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&h=1000&q=80',
      quote: data.quote,
      bio: Array.isArray(data.bio) ? data.bio : (data.bio ? data.bio.split('\n\n').map(p => p.trim()).filter(Boolean) : []),
      stats: data.stats || {},
      platforms: data.platforms || {},
      articles: data.articles || [],
      content: data.content || '',
      metaTitle: data.metaTitle || `${data.name} | ${data.type === 'founder' ? 'Founder' : 'Creator'} Profile · TBF`,
      metaDesc: data.metaDesc || (data.quote || '').substring(0, 160),
      status: data.status || 'published'
    });

    res.status(201).json({ success: true, data: newProfile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const profileId = req.params.id;
    const updateData = { ...req.body };

    if (typeof updateData.bio === 'string') {
      updateData.bio = updateData.bio.split('\n\n').map(p => p.trim()).filter(Boolean);
    }

    const updated = await Profile.findByIdAndUpdate(profileId, updateData);
    if (!updated) return res.status(404).json({ success: false, error: 'Profile not found' });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function deleteProfile(req, res) {
  try {
    const deleted = await Profile.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Profile not found' });
    res.json({ success: true, message: 'Profile deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  listProfiles,
  getProfileById,
  getProfileBySlug,
  createProfile,
  updateProfile,
  deleteProfile
};
