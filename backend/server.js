const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const mongoose   = require('mongoose');
const cors       = require('cors');
const bodyParser = require('body-parser');
const passport   = require('passport');
const multer     = require('multer');
const config     = require('./config/config');
const path       = require('path');
const fs         = require('fs');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 5000;

// ── Socket.IO ─────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});
const onlineUsers = new Map(); // userId (string) → socketId

app.set('io', io);
app.set('onlineUsers', onlineUsers);

// ── Middleware ────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// ── MongoDB ───────────────────────────────────────────────────────────────
mongoose.connect(config.database, {
  useNewUrlParser:    true,
  useUnifiedTopology: true,
});
mongoose.connection.once('open', () => {
  console.log('MongoDB connection established successfully');
  console.log(`Using MongoDB URI: ${config.database}`);
});

// ── Passport ──────────────────────────────────────────────────────────────
app.use(passport.initialize());
require('./config/passport')(passport);

// ── Chat media upload ─────────────────────────────────────────────────────
const authMiddleware  = require('./Middlewares/authMiddleware');
const chatUploadDir   = path.join(__dirname, 'uploads', 'chat');
if (!fs.existsSync(chatUploadDir)) fs.mkdirSync(chatUploadDir, { recursive: true });

const chatStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, chatUploadDir),
  filename:    (_req, file,  cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});
const chatUpload = multer({
  storage: chatStorage,
  limits:  { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

app.post(
  '/api/chat/upload',
  authMiddleware,
  chatUpload.single('file'),
  (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const ext = path.extname(req.file.originalname).toLowerCase();
    let mediaType = 'document';
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext))           mediaType = 'image';
    else if (['.mp4', '.mov', '.avi', '.mkv'].includes(ext))                        mediaType = 'video';
    else if (['.mp3', '.wav', '.ogg', '.webm', '.m4a', '.aac', '.opus'].includes(ext)) mediaType = 'audio';
    res.json({
      url:       `/uploads/chat/${req.file.filename}`,
      mediaType,
      fileName:  req.file.originalname,
    });
  },
);

// ── Routes ────────────────────────────────────────────────────────────────
const authRoutes          = require('./routes/authRoutes');
const messageRoutes       = require('./routes/messageRoutes');
const productRoutes       = require('./routes/ProductRoutes');
const projectRoutes       = require('./routes/projectRoutes');
const chatRoutes          = require('./routes/chatRoutes');
const expenseRoutes       = require('./routes/expenseRoutes');
const clientproductRoutes = require('./routes/clientproductRoutes');
const campaignRoutes      = require('./routes/campaignRoutes');
const groupMessageRoutes  = require('./routes/groupMessageRoutes');

app.use('/api/auth',          authRoutes);
app.use('/api/products',      productRoutes);
app.use('/api',               messageRoutes);
app.use('/api',               clientproductRoutes);
app.use('/api',               projectRoutes);
app.use('/api/chats',         chatRoutes);
app.use('/api',               campaignRoutes);
app.use('/api',               expenseRoutes);
app.use('/api/group-messages', groupMessageRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/media/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', req.params.filename);
  res.sendFile(filePath, (err) => {
    if (err) res.status(404).json({ message: 'File not found' });
  });
});

// ── Socket.IO events ──────────────────────────────────────────────────────
io.on('connection', (socket) => {

  socket.on('user-online', (userId) => {
    onlineUsers.set(String(userId), socket.id);
    io.emit('online-users', Array.from(onlineUsers.keys()));
  });

  socket.on('disconnect', () => {
    for (const [uid, sid] of onlineUsers.entries()) {
      if (sid === socket.id) { onlineUsers.delete(uid); break; }
    }
    io.emit('online-users', Array.from(onlineUsers.keys()));
  });

  // ── WebRTC voice-call signaling ─────────────────────────────────────
  socket.on('call-offer', ({ targetUserId, offer, callerId, callerName }) => {
    const target = onlineUsers.get(String(targetUserId));
    if (target) io.to(target).emit('incoming-call', { callerId, callerName, offer });
  });

  socket.on('call-answer', ({ callerId, answer }) => {
    const callerSocket = onlineUsers.get(String(callerId));
    if (callerSocket) io.to(callerSocket).emit('call-answered', { answer });
  });

  socket.on('ice-candidate', ({ targetUserId, candidate }) => {
    const target = onlineUsers.get(String(targetUserId));
    if (target) io.to(target).emit('ice-candidate', { candidate });
  });

  socket.on('call-end', ({ targetUserId }) => {
    const target = onlineUsers.get(String(targetUserId));
    if (target) io.to(target).emit('call-ended');
  });
});

// ── Seed admin ────────────────────────────────────────────────────────────
const { insertAdminUser } = require('./controllers/AuthController');
insertAdminUser();

server.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
