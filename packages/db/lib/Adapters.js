class Adapters {
  static createAdapter(opt) {
    const adapters = {
/*
pg for PostgreSQL and Amazon Redshift
mysql for MySQL or MariaDB
sqlite3 for SQLite3
mssql for MSSQL
*/
/*
      redis: '@persistr/db-redis',
      mongodb: '@persistr/db-mongo',
      mongo: '@persistr/db-mongo',
*/
      // Redshift?
      // Aurora?
      memory: { module: '@persistr/db-memory' },
      fs: { module: '@persistr/db-fs' },
      mysql: { module: '@persistr/db-sql', config: { dialect: 'mysql' }},
      postgresql: { module: '@persistr/db-sql', config: { dialect: 'pg' }},
      postgres: { module: '@persistr/db-sql', config: { dialect: 'pg' }},
      file: { module: '@persistr/db-sql', config: { dialect: 'sqlite3' }},
      mssql: { module: '@persistr/db-sql', config: { dialect: 'mssql' }},
      oracledb: { module: '@persistr/db-sql', config: { dialect: 'oracledb' }}
    }

    const options = { uri: 'memory', ...opt }
    const name = /^[^:]*/.exec(options.uri)[0]
    const adapter = adapters[name]
    const Adapter = require(adapter.module)
    return new Adapter({ ...options, ...adapter.config })
  }
}

module.exports = Adapters
