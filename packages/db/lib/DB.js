const Adapters = require('./Adapters')
const Store = require('./Store')

class DB extends Store {
  constructor(uri, opts) {
    if (!uri && !opts) uri = 'memory'
    const options = Object.assign(
      (typeof uri === 'string') ? { uri } : uri,
      opts
    )

    const adapter = Adapters.createAdapter(options)
    if (typeof adapter.on === 'function') {
      adapter.on('error', error => this.emit('error', error))
    }

    super({ ...options, adapter })
  }
}

module.exports = DB
