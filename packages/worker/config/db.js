const mongoose = require('mongoose');
const connectDB = async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`[Worker] MongoSV connected: ${conn.connection.host}`);
    }
    catch(error){
        console.log(`[Worker] Error connecting to mongoDB: ${error.message}`);
        process.exit(1);
    }
}
module.exports = connectDB;