const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null
    };
}

const connectDB = async () => {

    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is missing");
    }

    if (!cached.promise) {

        cached.promise = mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000
        })
        .then(instance => instance)
        .catch(error => {
            cached.promise = null;
            throw error;
        });

    }

    cached.conn = await cached.promise;

    return cached.conn;
};

module.exports = connectDB;