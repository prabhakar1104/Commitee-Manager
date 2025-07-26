const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require('path');

const app = express();
const cookieParser = require('cookie-parser');

// Set views directory explicitly
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static("images")); 
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");
app.use(cookieParser());

const adminAuth = require("./routes/adminAuth");
const adminRoutes = require("./routes/adminRoutes");
const memberRoutes = require("./routes/memberRoutes");
// const memberRoutes = require("./routes/member");

dotenv.config(); // Load .env variables


const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true})); 

// Routes
// app.use("/",adminAuth);  
app.use("/api/admin",adminAuth); 
app.use("/api/admin", adminRoutes);  
app.use("/api/admin",memberRoutes);

// app.use("/api/member", memberRoutes); 


const dbconnect = require("./config/database");
dbconnect();

app.get("/", (req, res) => {
  res.redirect("/api/admin"); // or render a separate homepage
});


app.listen(PORT,()=>{
    console.log("App is listinig on port 3000");
})

