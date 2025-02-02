import * as dislikeRepository from '../model/dislike.js';
import * as postRepository from '../model/post.js';

export async function isDisliked(postId, userId) {
  return !!(await dislikeRepository.getByPostIdAndUserId(postId, userId));
}

// 좋아요 상태 확인
export const getDislikeStatus = async (req, res) => {
  const postId = parseInt(req.params.post_id, 10);
  const userId = req.session?.user?.id;
  try {
    const dislikeStatus = await isDisliked(postId, userId);

    res.status(200).json({
      message: 'dislike status retrieve success',
      data: { isDisliked: dislikeStatus },
    });
  } catch (error) {
    console.error(`dislike status retrieve fail: ${error}`);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};

// 좋아요 추가/삭제
export const toggleDislike = async (req, res) => {
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

    const dislike = await dislikeRepository.getByPostIdAndUserId(
      postId,
      userId
    );

    if (dislike) {
      await dislikeRepository.remove(dislike);
      return res.status(200).json({
        message: 'dislike remove success',
        data: { isDisliked: false, dislikeCount: post.dislikeCount - 1 },
      });
    } else {
      const dislike = {
        postId,
        userId,
      };
      const id = await dislikeRepository.add(dislike);
      const dislikeCount = await postRepository.countLike(postId);
      return res.status(200).json({
        message: 'dislike add success',
        data: { id, isDisliked: true, dislikeCount },
      });
    }
  } catch (error) {
    console.error('dislike toggle fail:', error);
    res.status(500).json({ message: 'internal server error', data: null });
  }
};
