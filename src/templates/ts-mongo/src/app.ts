import 'dotenv/config'
import mongo from './util/mongo.js'

await mongo(process.env.MONGO_URI as string, process.env.MONGO_DB_NAME as string)
console.log(`connected to ${process.env.MONGO_DB_NAME as string}`)
