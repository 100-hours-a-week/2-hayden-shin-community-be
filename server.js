import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import authRouter from './router/auth.js';
import postRouter from './router/post.js';
import commentRouter from './router/comment.js';
import likeRouter from './router/like.js';
import dislikeRouter from './router/dislike.js';
import { config } from './config.js';
import { db } from './db/database.js';

const app = express();

// CORS config
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [config.url.clientUrl, 'http://127.0.0.1:2000'];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS error: Origin ${origin} not allowed`));
    }
  },
  methods: ['OPTIONS', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-USER-ID'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(
  session({
    secret: config.session.secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: config.session.expiresInSec,
    },
  })
);

// middleware setup
app.use(express.json({ limit: '512mb' }));
app.use(express.urlencoded({ limit: '512mb', extended: true }));
app.use(cookieParser());

// debugging middleware
app.use((req, res, next) => {
  console.log('--- requested info ---');
  console.log('cookie:', req.cookies); // cookie sent by client
  console.log('session:', req.session); // session stored in server
  console.log('--- --- ---');
  next();
});

app.use('/api/posts', postRouter);
app.use('/api/auth', authRouter);
app.use('/api/posts/:post_id/comments', commentRouter);
app.use('/api/posts/:post_id/likes', likeRouter);
app.use('/api/posts/:post_id/dislikes', dislikeRouter);

app.get('/api', (req, res) => {
  res.send('backend is running with /api prefix 🐖');
});

app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.use((req, res, next) => {
  console.error(`404 Not Found - ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Not Found' });
});

db.getConnection().then((connection) => console.log(`✅ mariadb is connected`));
app.listen(config.host.port, () => {
  console.log(`🚀 backend is running on port ${config.host.port}`);
});
