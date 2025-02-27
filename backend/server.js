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

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongoose.connect(config.database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB connection established successfully');
  console.log(`Using MongoDB URI: ${config.database}`);
});

app.use(passport.initialize());
require('./config/passport')(passport);

const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const productRoutes = require('./routes/ProductRoutes');
const projectRoutes = require('./routes/projectRoutes');
const chatRoutes = require("./routes/chatRoutes");
const expenseRoutes = require('./routes/expenseRoutes'); 
const clientproductRoutes = require("./routes/clientproductRoutes");
const campaignRoutes = require('./routes/campaignRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api', messageRoutes);
app.use("/api", clientproductRoutes);
app.use('/api', projectRoutes);
app.use("/api/chats", chatRoutes);
app.use('/api', campaignRoutes);
app.use('/api', expenseRoutes);

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