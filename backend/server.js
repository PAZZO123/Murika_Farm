const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const config = require('./config/config');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(config.database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB connection established successfully');
  console.log(`Using MongoDB URI: ${config.database}`);
});

// Passport middleware
app.use(passport.initialize());
// Import and configure Passport (assuming you're using JWT strategy)
require('./config/passport')(passport);

// Routes
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const caseRoutes = require('./routes/caseRoutes');
const postRoutes = require('./routes/postRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const eventOrCampaignRoutes = require('./routes/eventOrCampaignRoutes');
const discussionRoutes = require('./routes/discussionRoutes');
const productRoutes = require('./routes/ProductRoutes');
const projectRoutes = require('./routes/projectRoutes');
const campaignRoutes = require('./routes/campaignRoutes');

app.use('/api', eventOrCampaignRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api', messageRoutes);
app.use('/api', campaignRoutes);
app.use('/api', caseRoutes);
app.use('/api', projectRoutes);
app.use('/api', postRoutes); 
app.use('/api', discussionRoutes); 
app.use('/api/resources', resourceRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/media/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).json({ message: 'File not found' });
    }
  });
});

const { insertAdminUser } = require('./controllers/AuthController');
insertAdminUser();
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
