const express = require('express');
const mongoose = require('mongoose');
const postRoutes = require('./routes/postRoute');
const commentRoutes = require('./routes/commentRoute');

const PORT = 3000;
// Create Express app
const app = express();

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/assignment1');
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to Database'));

//Routes
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);

//Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});