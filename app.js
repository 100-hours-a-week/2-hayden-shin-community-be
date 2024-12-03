const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const session = require('express-session');

const app = express();
const PORT = 3000;

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentRoutes');

// CORS 설정
const corsOptions = {
  origin: 'http://localhost:2000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  // allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));

// 기본 미들웨어 설정
// JSON 요청 본문 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // URL-encoded 파싱

// 세션 설정
app.use(
  session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // HTTPS가 아닌 경우 false로 설정
      httpOnly: true, // 클라이언트에서 쿠키를 접근하지 못하도록 설정
      sameSite: 'lax', // 크로스-도메인 요청에서 쿠키 허용
    },
  })
);

// OPTIONS 요청 예외 처리
app.use('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:2000');
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  // res.sendStatus(201); // Preflight 요청 성공 응답
  next();
});

// 라우트 설정
app.use('/posts', postRoutes);
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts/:post_id/comments', commentRoutes);

// post-view 동적 경로
app.get('/posts/:post_id', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/pages/post-view.html'));
});

// JSON 파일 경로
const POSTS_FILE = path.join(__dirname, 'data/posts.json');
const USERS_FILE = path.join(__dirname, 'data/users.json');
const COMMENTS_FILE = path.join(__dirname, 'data/comments.json');

let posts = [];
let users = [];
let comments = [];

// JSON 데이터 로드 함수
const loadJSONData = () => {
  try {
    posts = JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
    users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    comments = JSON.parse(fs.readFileSync(COMMENTS_FILE, 'utf-8'));
    console.log('JSON 데이터가 성공적으로 로드되었습니다.');
  } catch (error) {
    console.error('JSON 데이터 로드 중 에러 발생:', error);
  }
};
loadJSONData();

// 기본 라우트
app.get('/', (req, res) => {
  res.send('아무 말 대잔치 커뮤니티입니다.');
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`백엔드 서버가 PORT ${PORT} 에서 실행 중입니다.`);
});
