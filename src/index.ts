import express, { Express } from 'express';
import mongoose from 'mongoose';
import postRoutes from './routes/postRoute';
import commentRoutes from './routes/commentRoute';
import userRoutes from './routes/userRoute';
import authRoute from './routes/authRoute';
import { swaggerUi, swaggerSpec } from './swagger';

import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

// Create Express app
const app: Express = express();

// Middleware to parse JSON
app.use(express.json());

// Swagger UI setup
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Assignment-2 API Docs',
}));

//API Routes
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/users', userRoutes);
app.use('/', authRoute);

const initApp = () => {
    const pr = new Promise<Express>((resolve, reject) => {
        // Connect to MongoDB
        const dbUrl = process.env.MONGODB_URI;
        if (!dbUrl) {
            reject("Database URL not provided");
            return;
        }

        mongoose
        .connect(dbUrl)
        .then(() => { 
            resolve(app);
        });

        const db = mongoose.connection;
        db.on('error', (error) => reject(error));
        db.once('open', () => console.log('Connected to Database'));
    });

    return pr;
}

export default initApp;