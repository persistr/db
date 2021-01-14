const assert = require('assert')
const DB = require('@persistr/db')

async function main() {
  // Create a database. By default, an in-memory database will be created.
  const db = new DB()

  // You can also explicitly request an in-memory data store.
  //const db = new DB('memory')

  // Or create a data store backed by a local file.
  //const db = new DB('fs')

  // Or create a data store backed by a MySQL database.
  //const db = new DB('mysql://root@localhost:3306/keewee')

  // Connect to the database.
  await db.connect()

  // Register callback handlers with the database. Whenever a key-value pair
  // is set or deleted from the database, the callback handlers will be called.
  // Keep in mind that the notification is only sent for key-values modified
  // by your process. Values modified by other processes will not be notified on.
  db.on('set', (key, value) => console.log('set', key, value))
  db.on('deleted', (key, value) => console.log('deleted', key, value))

  // Set & get some key-value pairs.

  await db.set([ 'users', 1 ], 'john')
  assert.equal('john', await db.get([ 'users', 1 ]))

  await db.set([ 'orgs', 1 ], 'acme')
  assert.equal('acme', await db.get([ 'orgs', 1 ]))

  // You can set time-to-live when setting a key-value pair.
  //await db.set([ 'orgs', 1 ], 'acme', { ttl: 100 })

  // Create different namespaces by setting a key prefix.
  const db2 = db.prefix('users')
  await db2.set(2, 'mike')
  await db2.set(3, { name: 'mike' })

  assert.equal('john', await db2.get(1))
  assert.deepEqual({ name: 'mike' }, await db2.get(3))
  assert.equal('mike', await db2.get(2))
  assert.equal('john', await db.get([ 'users', 1 ]))
  assert.equal('mike', await db.get([ 'users', 2 ]))
  assert.equal('acme', await db.get([ 'orgs', 1 ]))

  // Iterate over all keys in a namespace.
  const results = await db.entries({ prefix: 'orgs:', limit: 10 })
  results.forEach(([ key, value ]) => console.log(key, value))

  // Disconnect from the database.
  await db.disconnect()
}

// Run main() and catch any errors.
async function run(f) { try { await f() } catch (error) { console.log(error) }}
run(main)
