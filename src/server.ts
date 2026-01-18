import dotenv from 'dotenv';
import express, { Express } from 'express';
import mongoose from 'mongoose';
import postRoutes from './routes/postRoute';
import commentRoutes from './routes/commentRoute';
import userRoutes from './routes/userRoute';

// Load environment variables from .env file
dotenv.config();

const PORT: number = parseInt(process.env.PORT || '3000');
// Create Express app
const app: Express = express();

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/assignment2');
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

//Routes
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/users', userRoutes);

//Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});