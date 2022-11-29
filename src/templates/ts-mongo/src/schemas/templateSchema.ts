import mongoose from 'mongoose'
const { model, Schema } = mongoose

export interface ITemplateSchema {
  _id: string
}

const TemplateSchema = new Schema<ITemplateSchema>({
  _id: {
    type: String,
    alias: 'idAlias',
  },
})

export const Template: mongoose.Model<ITemplateSchema> = model('concurrency_control', TemplateSchema)
