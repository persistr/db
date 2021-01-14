const { Before, Given, When, Then } = require('cucumber')
const DB = require('../../lib')

Before(async function() {
  this.db = new DB(process.env.DB, { transient: process.env.TRANSIENT })

  this.events = []
  this.db.on('set', (key, value) => this.events.push({ type: 'set', key, value }))
  this.db.on('deleted', (key, value) => this.events.push({ type: 'deleted', key, value }))
  this.db.on('renamed', (before, after, value) => this.events.push({ type: 'renamed', before, after, value }))
  this.db.on('cleared', prefix => this.events.push({ type: 'cleared', prefix }))

  await this.db.connect()
})
