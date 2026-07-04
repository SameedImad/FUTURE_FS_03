const express=require('express');
const cors=require('cors');
const connectDB = require("./config/db.js");
const authRoutes = require("./routes/authRoutes.js");
const orderRoutes = require("./routes/orderRoutes.js");
require('dotenv').config();

const app=express();
connectDB();

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get("/",(req,res)=>{
    res.send("Server running");
});

app.use("/auth", authRoutes);
app.use("/orders", orderRoutes);

const PORT=process.env.PORT;

app.listen(PORT,()=>{
    console.log("Server is running");
});


