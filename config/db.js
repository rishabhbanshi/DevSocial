const mongoose=require('mongoose');
const config = require('config');
const db=config.get('mongoURI');

const connectDB= async () =>{
    try{
        mongoose.connect(db,{
            useUnifiedTopology: true,
            useNewUrlParser: true
        });
        console.log("Database Connected...");

    }catch(err){
        console.error(err.message);
        process.exit(1); // To exit the program incase of error
    }
}

module.exports= connectDB;