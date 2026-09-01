const mongoose = require('mongoose');
const { getLocalStore, isConnectedToMongo } = require('../config/db');

// Define Mongoose Schemas if Mongo is used
const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  category: { type: String, required: true, enum: ['founders', 'creators', 'wealth', 'future', 'suite', 'bombay'] },
  format: { type: String, default: 'feature', enum: ['brief', 'feature', 'profile', 'edit', 'opinion', 'explainer', 'list'] },
  author: { type: String, default: 'TBF Editorial Desk' },
  heroImage: { type: String, required: true },
  heroCaption: { type: String, default: '' },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  pullQuotes: { type: [String], default: [] },
  inlineImages: [{ url: String, caption: String, position: Number }],
  keyStats: [{ value: String, label: String }],
  tags: { type: [String], default: [] },
  metaTitle: { type: String, required: true },
  metaDesc: { type: String, required: true },
  ogImage: { type: String, default: '' },
  status: { type: String, default: 'draft', enum: ['draft', 'published', 'scheduled', 'archived'] },
  sourceUrl: { type: String, default: '' },
  sourceName: { type: String, default: '' },
  confidence: { type: Number, default: 1.0 },
  views: { type: Number, default: 0 },
  publishedAt: { type: Date, default: null }
}, { timestamps: true });

const ProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  type: { type: String, required: true, enum: ['founder', 'creator'] },
  company: { type: String, default: '' },
  role: { type: String, default: '' },
  medium: { type: String, default: '' },
  location: { type: String, default: 'Mumbai, India' },
  heroImage: { type: String, required: true },
  quote: { type: String, required: true },
  bio: { type: [String], default: [] },
  stats: { type: Object, default: {} },
  platforms: { type: Object, default: {} },
  articles: [{ type: String }],
  content: { type: String, default: '' },
  metaTitle: { type: String, default: '' },
  metaDesc: { type: String, default: '' },
  status: { type: String, default: 'published', enum: ['draft', 'published'] }
}, { timestamps: true });

const HomepageConfigSchema = new mongoose.Schema({
  coverStoryId: { type: String, default: '' },
  editorsPickIds: { type: [String], default: [] },
  featuredThisWeekIds: { type: [String], default: [] },
  sponsoredStrip: {
    enabled: { type: Boolean, default: false },
    label: { type: String, default: 'Sponsored Partner' },
    text: { type: String, default: 'Curated investments in Mumbai prime real estate.' },
    linkUrl: { type: String, default: '/spotlight' },
    sponsorName: { type: String, default: 'Lodha Luxury' }
  },
  active: { type: Boolean, default: true }
}, { timestamps: true });

const SourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, default: 'rss', enum: ['rss', 'gnews', 'instagram', 'api'] },
  category: { type: String, required: true, enum: ['founders', 'creators', 'wealth', 'future', 'suite', 'bombay'] },
  active: { type: Boolean, default: true },
  pollIntervalMinutes: { type: Number, default: 240 },
  lastPolledAt: { type: Date, default: null },
  itemsFetched: { type: Number, default: 0 },
  lastError: { type: String, default: '' }
}, { timestamps: true });

const IngestedSchema = new mongoose.Schema({
  hash: { type: String, required: true, unique: true },
  sourceUrl: { type: String, required: true },
  title: { type: String, required: true },
  sourceName: { type: String, default: '' },
  category: { type: String, required: true },
  status: { type: String, default: 'drafted', enum: ['drafted', 'skipped', 'low_confidence', 'error'] },
  articleId: { type: String, default: '' },
  confidence: { type: Number, default: 1.0 }
}, { timestamps: true });

const SubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  status: { type: String, default: 'active', enum: ['active', 'unsubscribed'] },
  subscribedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const SpotlightSchema = new mongoose.Schema({
  brandName: { type: String, required: true },
  contactName: { type: String, required: true },
  contactEmail: { type: String, required: true },
  contactPhone: { type: String, default: '' },
  package: { type: String, default: 'Dedicated Editorial' },
  budget: { type: String, default: '' },
  message: { type: String, default: '' },
  status: { type: String, default: 'new', enum: ['new', 'contacted', 'in_progress', 'published', 'closed'] }
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: 'Editor-in-Chief' },
  role: { type: String, default: 'editor', enum: ['admin', 'editor', 'writer'] }
}, { timestamps: true });

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

// Generic Model Adapter that routes to Mongoose or LocalStore
function createModelAdapter(modelName, collectionName, schema) {
  let MongooseModel = null;
  try {
    MongooseModel = mongoose.models[modelName] || mongoose.model(modelName, schema);
  } catch (e) {
    // Model creation placeholder
  }

  const localStore = getLocalStore(collectionName);

  return {
    name: modelName,
    async find(query = {}, sort = { createdAt: -1 }, limit = null, skip = 0) {
      if (isConnectedToMongo() && MongooseModel) {
        let q = MongooseModel.find(query).sort(sort);
        if (skip) q = q.skip(skip);
        if (limit) q = q.limit(limit);
        return await q.lean();
      }
      let items = localStore.find(query);
      // Sorting
      if (sort) {
        const sortKey = Object.keys(sort)[0];
        const sortDir = sort[sortKey];
        if (sortKey) {
          items.sort((a, b) => {
            const valA = a[sortKey] || '';
            const valB = b[sortKey] || '';
            if (valA < valB) return sortDir === 1 ? -1 : 1;
            if (valA > valB) return sortDir === 1 ? 1 : -1;
            return 0;
          });
        }
      }
      if (skip) items = items.slice(skip);
      if (limit) items = items.slice(0, limit);
      return items;
    },

    async findOne(query = {}) {
      if (isConnectedToMongo() && MongooseModel) {
        return await MongooseModel.findOne(query).lean();
      }
      return localStore.findOne(query);
    },

    async findById(id) {
      if (isConnectedToMongo() && MongooseModel) {
        return await MongooseModel.findById(id).lean();
      }
      return localStore.findById(id);
    },

    async create(data) {
      if (isConnectedToMongo() && MongooseModel) {
        const doc = new MongooseModel(data);
        return await doc.save();
      }
      return localStore.create(data);
    },

    async insertMany(docs) {
      if (isConnectedToMongo() && MongooseModel) {
        return await MongooseModel.insertMany(docs);
      }
      return localStore.insertMany(docs);
    },

    async findByIdAndUpdate(id, updateData, options = { new: true }) {
      if (isConnectedToMongo() && MongooseModel) {
        return await MongooseModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
      }
      return localStore.findByIdAndUpdate(id, updateData);
    },

    async updateOne(query, updateData) {
      if (isConnectedToMongo() && MongooseModel) {
        return await MongooseModel.updateOne(query, updateData);
      }
      return localStore.updateOne(query, updateData);
    },

    async findByIdAndDelete(id) {
      if (isConnectedToMongo() && MongooseModel) {
        return await MongooseModel.findByIdAndDelete(id).lean();
      }
      return localStore.findByIdAndDelete(id);
    },

    async deleteMany(query = {}) {
      if (isConnectedToMongo() && MongooseModel) {
        return await MongooseModel.deleteMany(query);
      }
      return localStore.deleteMany(query);
    },

    async countDocuments(query = {}) {
      if (isConnectedToMongo() && MongooseModel) {
        return await MongooseModel.countDocuments(query);
      }
      return localStore.countDocuments(query);
    }
  };
}

module.exports = {
  Article: createModelAdapter('Article', 'articles', ArticleSchema),
  Profile: createModelAdapter('Profile', 'profiles', ProfileSchema),
  HomepageConfig: createModelAdapter('HomepageConfig', 'homepageconfigs', HomepageConfigSchema),
  Source: createModelAdapter('Source', 'sources', SourceSchema),
  Ingested: createModelAdapter('Ingested', 'ingested', IngestedSchema),
  Subscriber: createModelAdapter('Subscriber', 'subscribers', SubscriberSchema),
  Spotlight: createModelAdapter('Spotlight', 'spotlights', SpotlightSchema),
  User: createModelAdapter('User', 'users', UserSchema),
  Setting: createModelAdapter('Setting', 'settings', SettingSchema)
};
