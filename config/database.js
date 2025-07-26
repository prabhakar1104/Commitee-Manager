const mongoose = require("mongoose");

const dbconnect = ()=>{
    mongoose.connect(process.env.DATABASE_URL)
    .then(()=>console.log("Database connection successfully"))
    .catch((err)=>{
        console.log("Database connection sucessfully");
        console.error(err);
        process.exit(1);
    });
}

module.exports = dbconnect;