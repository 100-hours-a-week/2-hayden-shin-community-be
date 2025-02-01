import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import authRouter from './router/auth.js';
import postRouter from './router/post.js';
import commentRouter from './router/comment.js';
import likeRouter from './router/like.js';
import { config } from './config.js';
import { db } from './db/database.js';

const app = express();

// CORS 설정
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      config.url.clientUrl,
      'http://hayden.ap-northeast-2.elasticbeanstalk.com',
      'http://127.0.0.1:2000',
    ];
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

app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(
  session({
    secret: config.session.secretKey,
    resave: false,
    saveUninitialized: false,
    cookie: {
      domain: 'hayden-server.ap-northeast-2.elasticbeanstalk.com',
      secure: false,
      httpOnly: true,
      sameSite: 'Lax',
      maxAge: config.session.expiresInSec,
    },
  })
);

// 미들웨어 설정
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// 디버깅 미들웨어
app.use((req, res, next) => {
  console.log('--- 요청 정보 ---');
  console.log('쿠키:', req.cookies); // 클라이언트에서 전달된 쿠키
  console.log('세션 데이터:', req.session); // 서버에 저장된 세션 정보
  console.log('--- --- ---');
  next(); // 다음 미들웨어로 이동
});

app.use('/api/posts', postRouter);
app.use('/api/auth', authRouter);
app.use('/api/posts/:post_id/comments', commentRouter);
app.use('/api/posts/:post_id/likes', likeRouter);

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
