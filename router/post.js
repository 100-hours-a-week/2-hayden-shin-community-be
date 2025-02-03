import express from 'express';
import * as postController from '../controller/post.js';
import { handleUpload } from '../middleware/upload.js';
const router = express.Router({ mergeParams: true });

// 새 게시글 생성
router.post('/', handleUpload('media'), postController.createPost);

// 특정 게시글 가져오기
router.get('/:post_id', postController.getPost);

// 모든 게시글 가져오기
router.get('/', postController.getAllPosts);

// 게시글 수정
router.patch('/:post_id', handleUpload('media'), postController.editPost);

// 게시글 삭제
router.delete('/:post_id', postController.deletePost);

export default router;
