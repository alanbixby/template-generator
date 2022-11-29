import mongoose from 'mongoose';
export interface ITemplateSchema {
    _id: string;
}
export declare const Template: mongoose.Model<ITemplateSchema>;
