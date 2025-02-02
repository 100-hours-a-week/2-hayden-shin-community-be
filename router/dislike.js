import express from 'express';
import * as dislikeController from '../controller/dislike.js';
const router = express.Router({ mergeParams: true });

router.get('/', dislikeController.getDislikeStatus);
router.post('/', dislikeController.toggleDislike);
router.delete('/', dislikeController.toggleDislike);

export default router;
