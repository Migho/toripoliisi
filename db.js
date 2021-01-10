import { Database, SQLite3Connector  } from 'https://deno.land/x/denodb/mod.ts'

import Order from './models/Order.js'


const connector = new SQLite3Connector({
  filepath: './database.sqlite',
})

const db = new Database(connector)

db.link([Order])

export default db