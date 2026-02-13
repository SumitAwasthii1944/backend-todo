import {Router} from 'express'
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import {z} from 'zod'
import bcrypt from 'bcrypt'
import {UserModel} from '../models/users.models.js'
import {TodoModel} from '../models/todo.models.js'
import jwt from 'jsonwebtoken'
import { userMiddleware } from '../middlewares/userMiddleware.js'
const jwtsecret=process.env.JWT_SECRET
const userRouter=Router();

userRouter.post('/signup',async function(req,res){
          const requiredBody=z.object({
                    fullname:z.string(),
                    email:z.string().min(6).max(30).email(),
                    mobileno:z.string().length(10, "Mobile number must be 10 digits"),
                    password:z.string().min(3).max(20)
          })

          const parsedDataWithSuccess=requiredBody.safeParse(req.body)
          if(!parsedDataWithSuccess.success){
                    res.status(401).json({
                              message:"incorrect format",
                              error:parsedDataWithSuccess.error
                    })
                    return
          }

          const {fullname,email,mobileno,password} =parsedDataWithSuccess.data
          try {
                    const hashedPassword=await bcrypt.hash(password,10);
                    await UserModel.create({
                              fullname,
                              email,
                              mobileno,
                              password:hashedPassword
                    })
                    return res.json({message:"user signed up successfully"})
                    
          } catch (error) {
                    return res.status(500).json({
                              message:"error signing up",
                              error:error.message
                    })
          }
})

userRouter.post('/signin',async function(req,res){
          const {email,password} =req.body
          const user=await UserModel.findOne({
                    email
          })
          if(!user){
                    return res.status(403).json({
                              message:"user not found"
                    })
          }

          const isPasswordMatch=await bcrypt.compare(password,user.password)
          if(isPasswordMatch){
                    const token=jwt.sign({
                              userId:user._id
                    },jwtsecret)
                    res.json({
                              message:'user signed in succesfully',
                              token:token
                    })
          }
          else{
                    res.status(403).json({
                              message:"incorrect credentials"
                    })
          }
})
userRouter.post('/todos', userMiddleware, async function(req,res){
  const creatorId = req.userId; // comes from JWT via middleware
  const { text, completed } = req.body;

  try {
    const todo = await TodoModel.create({
      text,
      completed,
      userId: creatorId
    });

    res.json({
      _id: todo._id.toString(),
      text: todo.text,
      completed: todo.completed,
      userId: todo.userId
    });
  } catch (error) {
    res.status(500).json({
      message: "error creating todo",
      error: error.message
    });
  }
});

userRouter.get('/todos', userMiddleware, async function(req, res) {
  try {
    const creatorId = req.userId;
    const todos = await TodoModel.find({ userId: creatorId });

    res.json({ 
      todos: todos.map(todo => ({
        _id: todo._id.toString(),
        text: todo.text,
        completed: todo.completed,
        userId: todo.userId.toString()
      }))
    });
  } catch (error) {
    res.status(500).json({
      message: "error fetching todos",
      error: error.message
    });
  }
});
userRouter.put('/todos/:id', userMiddleware, async function(req, res) {
  try {
    const todoId = req.params.id;
    const { text } = req.body;
    const creatorId = req.userId;
    
    if (!text) {
      return res.status(400).json({
        message: "text is required"
      });
    }
    
    const todo = await TodoModel.findOneAndUpdate(
      { _id: todoId, userId: creatorId },
      { text },
      { new: true }
    );
    
    if (!todo) {
      return res.status(404).json({
        message: "todo not found"
      });
    }
    
    res.json({
      _id: todo._id.toString(),
      text: todo.text,
      completed: todo.completed,
      userId: todo.userId.toString()
    });
  } catch (error) {
    res.status(500).json({
      message: "error updating todo",
      error: error.message
    });
  }
});

userRouter.patch('/todos/toggle/:id', userMiddleware, async function(req, res) {
  try {
    const todoId = req.params.id;
    const creatorId = req.userId;
    
    const todo = await TodoModel.findOne({ _id: todoId, userId: creatorId });
    
    if (!todo) {
      return res.status(404).json({
        message: "todo not found"
      });
    }
    
    todo.completed = !todo.completed;
    await todo.save();
    
    res.json({
      _id: todo._id.toString(),
      text: todo.text,
      completed: todo.completed,
      userId: todo.userId.toString()
    });
  } catch (error) {
    res.status(500).json({
      message: "error toggling todo",
      error: error.message
    });
  }
});

userRouter.delete('/todos/:id', userMiddleware, async function(req, res) {
  try {
    const todoId = req.params.id;
    const creatorId = req.userId;
    
    const todo = await TodoModel.findOneAndDelete({ 
      _id: todoId, 
      userId: creatorId 
    });
    
    if (!todo) {
      return res.status(404).json({
        message: "todo not found"
      });
    }
    
    res.json({
      _id: todo._id.toString(),
      text: todo.text,
      completed: todo.completed,
      userId: todo.userId.toString()
    });
  } catch (error) {
    res.status(500).json({
      message: "error deleting todo",
      error: error.message
    });
  }
});

export default userRouter;