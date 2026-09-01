const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

let isConnectedToMongo = false;
const DATA_DIR = path.join(__dirname, '../../data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Local JSON Storage Engine (Zero-dependency fallback)
class LocalStore {
  constructor(collectionName) {
    this.name = collectionName;
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2));
    }
  }

  _read() {
    try {
      const data = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(data || '[]');
    } catch (e) {
      console.error(`Error reading ${this.name}:`, e);
      return [];
    }
  }

  _write(items) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(items, null, 2));
    } catch (e) {
      console.error(`Error writing ${this.name}:`, e);
    }
  }

  find(query = {}) {
    const items = this._read();
    return items.filter(item => {
      for (const [key, val] of Object.entries(query)) {
        if (val && typeof val === 'object' && val.$ne !== undefined) {
          if (item[key] === val.$ne) return false;
        } else if (val && typeof val === 'object' && val.$in !== undefined) {
          if (!val.$in.includes(item[key])) return false;
        } else if (val && typeof val === 'object' && val.$regex !== undefined) {
          const reg = new RegExp(val.$regex, val.$options || 'i');
          if (!reg.test(item[key] || '')) return false;
        } else if (item[key] !== val) {
          return false;
        }
      }
      return true;
    });
  }

  findOne(query = {}) {
    const results = this.find(query);
    return results.length > 0 ? results[0] : null;
  }

  findById(id) {
    return this.findOne({ _id: id });
  }

  create(doc) {
    const items = this._read();
    const newDoc = {
      _id: doc._id || 'tbf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    };
    items.unshift(newDoc);
    this._write(items);
    return newDoc;
  }

  insertMany(docs) {
    const items = this._read();
    const created = docs.map(doc => ({
      _id: doc._id || 'tbf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...doc
    }));
    items.push(...created);
    this._write(items);
    return created;
  }

  findByIdAndUpdate(id, updateData, options = {}) {
    const items = this._read();
    const index = items.findIndex(i => i._id === id);
    if (index === -1) return null;

    const updated = {
      ...items[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    items[index] = updated;
    this._write(items);
    return updated;
  }

  updateOne(query, updateData) {
    const doc = this.findOne(query);
    if (!doc) return null;
    return this.findByIdAndUpdate(doc._id, updateData);
  }

  findByIdAndDelete(id) {
    const items = this._read();
    const index = items.findIndex(i => i._id === id);
    if (index === -1) return null;
    const removed = items.splice(index, 1)[0];
    this._write(items);
    return removed;
  }

  deleteMany(query = {}) {
    const items = this._read();
    const remaining = items.filter(item => {
      for (const [key, val] of Object.entries(query)) {
        if (item[key] === val) return false;
      }
      return true;
    });
    const deletedCount = items.length - remaining.length;
    this._write(remaining);
    return { deletedCount };
  }

  countDocuments(query = {}) {
    return this.find(query).length;
  }
}

const localStores = {};
function getLocalStore(collectionName) {
  if (!localStores[collectionName]) {
    localStores[collectionName] = new LocalStore(collectionName);
  }
  return localStores[collectionName];
}

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri && !mongoUri.includes('<username>') && !mongoUri.includes('<password>')) {
    try {
      console.log('Attempting MongoDB Atlas connection (cluster0.oyrf2y7.mongodb.net)...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000
      });
      isConnectedToMongo = true;
      console.log('✓ Successfully connected to MongoDB Atlas (cluster0.oyrf2y7.mongodb.net)');
      return true;
    } catch (err) {
      console.warn('⚠️ MongoDB Atlas connection error:', err.message);
      console.log('ℹ️ Operating in resilient local persistent JSON datastore mode in ./data/');
      isConnectedToMongo = false;
      return false;
    }
  } else {
    console.log('ℹ️ MongoDB Atlas target: cluster0.oyrf2y7.mongodb.net');
    console.log('ℹ️ Currently running on local persistent JSON datastore in ./data/. To connect directly to the live Atlas cluster, replace <username> and <password> in your .env file or Cloud Run environment variables.');
    isConnectedToMongo = false;
    return false;
  }
}

module.exports = {
  connectDB,
  isConnectedToMongo: () => isConnectedToMongo,
  getLocalStore
};
