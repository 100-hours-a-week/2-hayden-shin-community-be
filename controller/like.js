import * as likeRepository from '../model/like.js';
import * as postRepository from '../model/post.js';

export async function isLiked(postId, userId) {
  return !!(await likeRepository.getByPostIdAndUserId(postId, userId));
}

// 좋아요 상태 확인
export const getLikeStatus = async (req, res) => {
  const postId = parseInt(req.params.post_id, 10);
  const userId = req.session?.user?.id;

  if (!postId || !userId) {
    return res.status(400).json({
      message: 'Missing required parameters: postId or userId',
      data: null,
    });
  }

  try {
    const likeStatus = await isLiked(postId, userId);

    res.status(200).json({
      message: 'like status retrieve success',
      data: { isLiked: likeStatus },
    });
  } catch (error) {
    console.error(`좋아요 상태 확인 실패: ${error}`);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 좋아요 추가/삭제
export const toggleLike = async (req, res) => {
  const postId = parseInt(req.params.post_id, 10);
  const userId = req.session?.user?.id;
  if (!postId) {
    return res.status(400).json({ message: 'invalid post', data: null });
  }
  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  try {
    const post = await postRepository.getById(postId);
    if (!post) {
      return res.status(404).json({ message: 'post not found', data: null });
    }

    const like = await likeRepository.getByPostIdAndUserId(postId, userId);

    if (like) {
      // 좋아요 취소
      await likeRepository.remove(like);
      return res.status(200).json({
        message: 'like remove success',
        data: { isLiked: false, likeCount: post.likeCount - 1 },
      });
    } else {
      const like = {
        postId,
        userId,
      };
      const id = await likeRepository.add(like);
      const likeCount = await postRepository.countLike(postId);
      return res.status(200).json({
        message: 'like add success',
        data: { id, isLiked: true, likeCount },
      });
    }
  } catch (error) {
    console.error('좋아요 토글 실패:', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};
