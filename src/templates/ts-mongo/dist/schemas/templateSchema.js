import mongoose from 'mongoose'
const { model, Schema } = mongoose
const TemplateSchema = new Schema({
  _id: {
    type: String,
    alias: 'idAlias',
  },
})
export const Template = model('concurrency_control', TemplateSchema)
