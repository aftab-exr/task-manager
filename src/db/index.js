import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected to: ', conn.connection.host);
    } catch (error) {
        console.warn("Error connecting to Database: ", error);
        process.exit(1);
    }
}

export default connectDB;