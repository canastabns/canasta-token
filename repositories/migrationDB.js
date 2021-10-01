const low = require('lowdb'),
  FileSync = require('lowdb/adapters/FileSync'),
  path = require('path');

const adapter = new FileSync(`${path.resolve(__dirname)}/migrationDB.json`)
const db = low(adapter);

const insertValueByKey = (key, value) => db.set(key, value).write();
const selectByKey = key => db.get(key).write();

module.exports = {
  saveByKeyName: (key, address) => insertValueByKey(key, address),
  getByKeyName: key => selectByKey(key),
};
