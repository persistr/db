const { After } = require('cucumber')
const DB = require('../../lib')

After(async function() {
  await this.db.clear()
  await this.db.disconnect()
})
