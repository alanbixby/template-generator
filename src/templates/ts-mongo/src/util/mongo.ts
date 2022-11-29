import 'dotenv/config'
import mongoose from 'mongoose'
import os from 'os'

export default async (connectionString: string, dbName: string, options?: mongoose.ConnectOptions) => {
  return await mongoose.connect(connectionString, {
    appName: os.hostname(),
    authSource: 'admin',
    dbName,
    ...options,
  })
}
