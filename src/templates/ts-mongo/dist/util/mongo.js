import 'dotenv/config'
import mongoose from 'mongoose'
import os from 'os'
export default async (connectionString, dbName, options) => {
  return await mongoose.connect(connectionString, {
    appName: os.hostname(),
    authSource: 'admin',
    dbName,
    ...options,
  })
}
