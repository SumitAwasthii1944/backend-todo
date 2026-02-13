import dotenv from 'dotenv'
dotenv.config({path: '../.env'});
import userRouter from './routes/users.js'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js';
const app=express()
app.use(cors({
  origin:'http://localhost:5173',
  credentials:true
}))
app.use(express.json())

app.use(userRouter)

connectDB()//it returns a promise, so we can use .then and .catch to handle the success and error cases respectively. If the connection is successful, we can log a message or perform any other necessary actions. If there is an error during the connection process, we catch it, log the error message, and exit the process with a failure code to prevent the application from running without a database connection.
.then(() => {
          app.on("error", (error) => {//listening to error events
                    console.log("err: ",error);
                    throw error
          })
          app.listen(process.env.PORT || 8000, () => {
                    console.log(`Server is running on port ${process.env.PORT || 8000}`);
          })
})
.catch((error) => {
  console.error("Error connecting to MongoDB:", error);
  process.exit(1);
});