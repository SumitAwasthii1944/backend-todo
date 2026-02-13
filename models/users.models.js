import mongoose from 'mongoose'

const Schema =mongoose.Schema

const userSchema = new Schema({
          name:String,
          fullname:{
                    type:String,
                    required:true,
          },
          email:{
                    type:String,
                    required:true,
                    unique:true
          },
          mobileno:{
                    type:Number,
                    required:true,
                    unique:true
          },
          password:{
                    type:String,
                    required:true
          },
          


},{timestamps:true})

export const UserModel=mongoose.model('User',userSchema)