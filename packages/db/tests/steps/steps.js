const { Given, When, Then } = require('cucumber')
const assert = require('assert')
const JSON5 = require('json5')
const DB = require('../../lib')

Given('database containing', async function (table) {
  for (const row of table.hashes()) {
    await this.db.set(parseKey(row.Key), parseValue(row.Value))
  }
  this.events = []
})

When('I create a new database {string} with default options', async function (name) {
  if (!this.dbs) this.dbs = {}
  this.dbs[name] = new DB()
})

When('I use {string} as a prefix', function (prefix) {
  this.db = this.db.prefix(prefix)
})

When('I unprefix once', function () {
  this.db = this.db.unprefix()
})

When('I unprefix twice', function () {
  this.db = this.db.unprefix().unprefix()
})

When(/^I store (.+)=(.+) in the database$/, async function (key, value) {
  return await this.db.set(parseKey(key), parseValue(value))
})

When(/^I store (.+)=(.+) with TTL=(-?\d+)$/, async function (key, value, ttl) {
  return await this.db.set(parseKey(key), parseValue(value), { ttl })
})

When(/^I rename (.+) to (.+)$/, async function (from, to) {
  return await this.db.rename(parseKey(from), parseKey(to))
})

When(/^I delete (.+)$/, async function (key) {
  return await this.db.delete(parseKey(key))
})

When(/^I clear the database$/, async function () {
  return await this.db.clear()
})

When('wait {int} milliseconds', async function (delay) {
  return await new Promise(r => setTimeout(r, delay))
})

When('wait {int} seconds', async function (delay) {
  return await new Promise(r => setTimeout(r, delay * 1000))
})

Then('the type of {string} database should be {string}', async function (name, type) {
  assert(this.dbs[name].uri === type || this.dbs[name].uri.startsWith(`${type}:`))
})

Then('I can verify that there are {int} keys in the database', async function (count) {
  assert.equal(count, await this.db.count())
})

Then(/^I can verify that (.+)=(.+) is in the database$/, async function (key, value) {
  assert(await this.db.has(parseKey(key)))
  assert.deepEqual(parseValue(value), await this.db.get(parseKey(key)))
})

Then(/^I can verify that (.+) is NOT in the database$/, async function (key) {
  assert.equal(false, await this.db.has(parseKey(key)))
  assert.equal(undefined, await this.db.get(parseKey(key)))
})

Then('iterating should return', async function (table) {
  const results = await this.db.entries()
  for (let i = 0; i < results.length; i++) {
    const [ key, value ] = results[i]
    const row = table.hashes()[i]
    assert.deepEqual(parseKey(row.Key), key)
    assert.deepEqual(parseValue(row.Value), value)
  }
})

Then('iterating keys should return', async function (table) {
  const results = await this.db.keys()
  for (let i = 0; i < results.length; i++) {
    const key = results[i]
    const row = table.hashes()[i]
    assert.deepEqual(parseKey(row.Key), key)
  }
})

Then('iterating values should return', async function (table) {
  const results = await this.db.values()
  for (let i = 0; i < results.length; i++) {
    const value = results[i]
    const row = table.hashes()[i]
    assert.deepEqual(parseValue(row.Value), value)
  }
})

Then('iterating on prefix {string} should return', async function (prefix, table) {
  const results = await this.db.entries({ prefix })
  for (let i = 0; i < results.length; i++) {
    const [ key, value ] = results[i]
    const row = table.hashes()[i]
    assert.deepEqual(parseKey(row.Key), key)
    assert.deepEqual(parseValue(row.Value), value)
  }
})

Then('iterating on prefix {string} with a limit of {int} should return', async function (prefix, limit, table) {
  const results = await this.db.entries({ prefix, limit })
  for (let i = 0; i < results.length; i++) {
    const [ key, value ] = results[i]
    const row = table.hashes()[i]
    assert.deepEqual(parseKey(row.Key), key)
    assert.deepEqual(parseValue(row.Value), value)
  }
})

Then('decoding keys while iterating on prefix {string} should return', async function (prefix, table) {
  const results = await this.db.entries({ prefix, decodeKeys: true })
  for (let i = 0; i < results.length; i++) {
    const [ key, value ] = results[i]
    const row = table.hashes()[i]
    assert.deepEqual(parseKey(row.Key), key)
    assert.deepEqual(parseValue(row.Value), value)
  }
})

Then(/^I am notified of (.+)=(.+) having been stored$/, async function (key, value) {
  assert.equal(1, this.events.length)
  assert.equal('set', this.events[0].type)
  assert.equal(parseKey(key), this.events[0].key)
  assert.equal(parseValue(value), this.events[0].value)
})

Then(/^I am notified of (.+) having been deleted$/, async function (key) {
  assert.equal(1, this.events.length)
  assert.equal('deleted', this.events[0].type)
  assert.equal(parseKey(key), this.events[0].key)
})

Then(/^I am notified of (.+) having been renamed to (.+)$/, async function (before, after) {
  assert.equal(1, this.events.length)
  assert.equal('renamed', this.events[0].type)
  assert.equal(parseKey(before), this.events[0].before)
  assert.equal(parseKey(after), this.events[0].after)
})

Then(/^I am notified of all of the following having been deleted in this order$/, async function (table) {
  assert.equal(table.hashes().length + 1, this.events.length)
  for (const [i, row] of table.hashes().entries()) {
    assert.equal('deleted', this.events[i].type)
    assert.equal(row.Key, this.events[i].key)
  }
  assert.equal('cleared', this.events[this.events.length - 1].type)
})

//
// Support functions
//

function parseKey(str) {
  if (str[0] === '[') return toArray(str, parseKey)
  const number = Number(str)
  if (!isNaN(number)) return number
  return str
}

function parseValue(str) {
  if (str[0] === '[') return toArray(str, parseValue)
  if (str[0] === '{') return toObject(str)
  if (str === 'true') return true
  if (str === 'false') return false
  const number = Number(str)
  if (!isNaN(number)) return number
  return str
}

function toArray(str, parse) {
  return str.replace(/[\[\]]/g, '').split(',').map(s => parse(s.trim()))
}

function toObject(str) {
  return JSON5.parse(str)
}

