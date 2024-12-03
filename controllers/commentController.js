const commentModel = require('../models/commentModel');

// 댓글 생성
exports.createComment = (req, res) => {
  const { post_id, content } = req.body;
  const user = req.session?.user;

  if (!user) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  if (!post_id || !content) {
    return res.status(400).json({ message: 'invalid_request', data: null });
  }

  try {
    const comments = commentModel.readCommentsFromFile();

    const newComment = {
      comment_id: comments.length + 1,
      post_id,
      content,
      created_at: new Date().toISOString(),
      author_id: user.id,
      author_profile_url: user.profile_image,
      author_nickname: user.nickname,
    };

    comments.push(newComment);
    commentModel.writeCommentsToFile(comments);

    res.status(201).json({ message: 'comment_created', data: newComment });
  } catch (error) {
    console.error('댓글 생성 실패:', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};

// 특정 게시글의 댓글 가져오기
exports.getCommentsByPostId = (req, res) => {
  const postId = parseInt(req.params.post_id);

  try {
    const comments = commentModel.readCommentsFromFile();
    const postComments = comments.filter(
      (comment) => comment.post_id === postId
    );

    res.status(200).json({ message: 'comments_retrieved', data: postComments });
  } catch (error) {
    console.error('댓글 가져오기 실패:', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};

// 댓글 수정
exports.updateComment = (req, res) => {
  const commentId = parseInt(req.params.comment_id, 10);
  const { new_content } = req.body;
  const user = req.session?.user;

  if (!user) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  if (!comment_id || !new_content) {
    return res.status(400).json({ message: 'invalid_request', data: null });
  }

  try {
    const comments = commentModel.readCommentsFromFile();

    const comment = comments.find((c) => c.comment_id === commentId);
    if (!comment) {
      return res.status(404).json({ message: 'comment_not_found', data: null });
    }

    if (comment.author_id !== user.id) {
      return res.status(403).json({ message: 'no_permission', data: null });
    }

    comment.content = new_content;
    comment.updated_at = new Date().toISOString();
    commentModel.writeCommentsToFile(comments);

    res.status(200).json({ message: 'comment_updated', data: comment });
  } catch (error) {
    console.error('댓글 수정 실패:', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};

// 댓글 삭제
exports.deleteComment = (req, res) => {
  const commentId = parseInt(req.params.comment_id, 10); // URL에서 comment_id를 가져옴
  const { comment_id } = req.body;
  const user = req.session?.user;

  if (!user) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  if (!comment_id) {
    return res.status(400).json({ message: 'invalid_request', data: null });
  }

  try {
    const comments = commentModel.readCommentsFromFile();

    const commentIndex = comments.findIndex((c) => c.comment_id === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ message: 'comment_not_found', data: null });
    }

    const comment = comments[commentIndex];
    if (comment.author_id !== user.id) {
      return res.status(403).json({ message: 'no_permission', data: null });
    }

    comments.splice(commentIndex, 1);
    commentModel.writeCommentsToFile(comments);

    res.status(204).send();
  } catch (error) {
    console.error('댓글 삭제 실패:', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};
