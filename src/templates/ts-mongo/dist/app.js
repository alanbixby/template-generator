import 'dotenv/config'
import mongo from './util/mongo.js'
await mongo(process.env.MONGO_URI, process.env.MONGO_DB_NAME)
console.log(`connected to ${process.env.MONGO_DB_NAME}`)
