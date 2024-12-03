const express = require('express');
const {
  updateProfile,
  updatePassword,
} = require('../controllers/userController');

const router = express.Router();

// 프로필 수정
router.patch('/:user_id', updateProfile);

// 비밀번호 변경
router.patch('/:user_id/password', updatePassword);

module.exports = router;
