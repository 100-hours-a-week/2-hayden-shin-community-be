const express = require('express');
const {
  signup,
  login,
  logout,
  deleteAccount,
} = require('../controllers/userController');

const router = express.Router();

// 회원가입
router.post('/signup', signup);

// 로그인
router.post('/login', login);

// 로그아웃
router.post('/logout', logout);

// 회원 탈퇴
router.delete('/:user_id', deleteAccount);

module.exports = router;
