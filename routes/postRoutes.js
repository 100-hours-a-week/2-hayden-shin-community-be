const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// 새 게시글 생성
router.post('/', postController.createPost);

// 특정 게시글 가져오기
router.get('/:post_id', postController.getPostById);

// 모든 게시글 가져오기
router.get('/', postController.getAllPosts);

// 게시글 수정
router.patch('/:post_id', postController.editPost);

// 게시글 삭제
router.delete(':post_id', postController.deletePost);

// 좋아요 추가
router.patch('/:post_id/likes', postController.likePost);

module.exports = router;
