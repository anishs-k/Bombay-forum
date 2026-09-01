const { Subscriber } = require('../models');

async function subscribe(req, res) {
  try {
    const { email, name } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await Subscriber.findOne({ email: cleanEmail });

    if (existing) {
      if (existing.status === 'unsubscribed') {
        await Subscriber.findByIdAndUpdate(existing._id, { status: 'active' });
        return res.json({ success: true, message: 'Welcome back to The Saturday Communiqué.' });
      }
      return res.json({ success: true, message: 'You are already subscribed to The Saturday Communiqué.' });
    }

    await Subscriber.create({
      email: cleanEmail,
      name: name || '',
      status: 'active'
    });

    res.json({ success: true, message: 'Thank you for subscribing to The Saturday Communiqué.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function listSubscribers(req, res) {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await Subscriber.countDocuments();
    const subscribers = await Subscriber.find({}, { createdAt: -1 }, limitNum, skip);

    res.json({
      success: true,
      data: subscribers,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

async function exportSubscribersCsv(req, res) {
  try {
    const subscribers = await Subscriber.find({ status: 'active' }, { createdAt: -1 });
    let csv = 'Email,Name,SubscribedAt,Status\n';
    for (const s of subscribers) {
      csv += `"${s.email}","${s.name || ''}","${s.subscribedAt || s.createdAt || ''}","${s.status}"\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="tbf-subscribers.csv"');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

module.exports = {
  subscribe,
  listSubscribers,
  exportSubscribersCsv
};
