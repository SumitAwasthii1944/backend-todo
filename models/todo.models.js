import mongoose from 'mongoose'

const Schema =mongoose.Schema;

const todoSchema = new Schema({
          text:{
                    type:String,
                    required:true
          },
          completed:{
                    type:Boolean,
                    default:false
          },
          //to which user it belongs
          userId:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:"User",
          }
})

export const TodoModel=mongoose.model('Todo',todoSchema);