const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // 🟢 Mongoose-kku connection ready aagura varaikkum wait panna solra logic
        mongoose.set('strictQuery', false);

        // 🚀 LOCALHOST FIX: 127.0.0.1 use panna handshake innum fast-aa aagum
        const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/vnm_job_portal";

        const conn = await mongoose.connect(dbURI, {
            dbName: 'vnm_job_portal', 
            serverSelectionTimeoutMS: 5000, 
            socketTimeoutMS: 45000,
            family: 4, 
            // 🔴 Idhu mukkiyam: Initial connection fail aana thirumba try pannum
            connectTimeoutMS: 10000 
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📂 Database Name: ${conn.connection.name}`); 

    } catch (error) {
        console.error(`❌ DB Connection Error: ${error.message}`);
        
        // 🚀 RECOVERY LOGIC: MongoDB service start aaga time edutha, 5s kalichu thirumba try pannum
        console.log("🔄 Retrying connection in 5 seconds...");
        setTimeout(connectDB, 5000); 
    }
};

module.exports = connectDB;