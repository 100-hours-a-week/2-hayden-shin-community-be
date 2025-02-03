import express from 'express';
import * as authController from '../controller/auth.js';
import { handleUpload } from '../middleware/upload.js';
const router = express.Router({ mergeParams: true });

/* TODO: GET > POST > PUT/PATCH > DELETE 순으로 정리 */

// 회원가입
router.post('/signup', handleUpload('profile'), authController.signup);

// 로그인
router.post('/login', authController.login);

// 로그아웃
router.post('/logout', authController.logout);

// 사용자 프로필 가져오기
router.get('/profile', authController.getUserProfile);

// 사용자 정보 변경
router.patch('/profile', handleUpload('profile'), authController.updateProfile);

// 비밀번호 변경
router.patch('/password', authController.updatePassword);

// 회원 탈퇴
router.delete('/account', authController.deleteAccount);

export default router;
