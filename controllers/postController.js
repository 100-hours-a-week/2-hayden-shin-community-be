const postModel = require('../models/postModel');

// 새 게시글 생성
exports.createPost = (req, res) => {
  const { title, content, image_url } = req.body;
  const user = req.session?.user;

  // 인증되지 않은 사용자인 경우
  if (!user) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  if (!title || !content) {
    return res.status(400).json({ message: 'invalid_request', data: null });
  }

  try {
    const posts = postModel.readPostsFromFile();

    // 새 게시글 생성
    const newPost = {
      post_id: posts.length + 1,
      title,
      content,
      image_url: image_url || null,
      author_id: user.id,
      author_profile_url: user.profile_image,
      author_nickname: user.nickname,
      created_at: new Date().toISOString(),
      likes: 0,
      views: 0,
      comment_ids: [],
    };

    posts.push(newPost);
    postModel.writePostsToFile(posts);

    return res
      .status(201)
      .json({ message: 'post_created', data: { post_id: newPost.post_id } });
  } catch (error) {
    console.error('게시글 생성 실패:', error);
    return res
      .status(500)
      .json({ message: 'internal_server_error', data: null });
  }
};

// 특정 게시글 가져오기
exports.getPostById = (req, res) => {
  const postId = parseInt(req.params.post_id);
  console.log('Requested postId:', postId); // 요청된 post_id 로그

  try {
    const posts = postModel.readPostsFromFile();
    console.log('All posts:', posts); // 로그용 - 전체 포스트

    const comments = postModel.readCommentsFromFile();

    const post = posts.find((p) => p.post_id === postId);
    console.log('Found post:', post); // 로그용 - 특정 포스트

    if (!post) {
      return res.status(404).json({ message: 'post_not_found', data: null });
    }

    // 게시글의 댓글 로드
    const postComments = comments.filter((comment) =>
      post.comment_ids.includes(comment.comment_id)
    );

    // 조회수 증가
    post.views += 1;
    postModel.writePostsToFile(posts);

    res.status(200).json({
      message: 'post_retrieved',
      data: { ...post, comments: postComments || [] },
    });
  } catch (error) {
    console.error('게시글 가져오기 실패:', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};

exports.editPost = (req, res) => {
  const postId = parseInt(req.params.post_id);
  console.log('수정 요청 게시글 ID: ', postId);

  const { newTitle, newContent, newImageUrl } = req.body;
  console.log('수정 요청 데이터: ', newTitle, newContent, newImageUrl);

  try {
    // 게시글 수정

    // posts.json 파일에서 게시글 불러오기
    const posts = postModel.readPostsFromFile;

    // 수정할 게시글 찾기
    const post = posts.find((p) => p.post_id === postId);

    if (!post) {
      return res.status(404).json({ message: 'post_not_found', data: null });
    }

    const user = req.session?.user; // 현재 로그인한 사용자 정보
    if (!user || post.author_id !== user.id) {
      return res.status(401).json({ message: 'no_permission', data: null });
    }

    if (newTitle) post.title = newTitle;
    if (newContent) post.content = newContent;
    if (newImageUrl) post.image_url = newImageUrl;
    post.updated_at = new Date().toISOString();

    postModel.writePostsToFile(posts);

    res.status(200).json({ message: 'post_updated', data: post });
  } catch {
    console.log('댓글 수정 실패', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};

// 모든 게시글 가져오기
exports.getAllPosts = (req, res) => {
  try {
    const posts = postModel.readPostsFromFile();

    // Ensure all posts have consistent structure
    const sanitizedPosts = posts.map((post) => ({
      ...post,
      commentIds: post.commentIds || [],
    }));

    console.log('Retrieved posts:', posts); // 디버그 로그
    res.status(200).json({ message: 'posts_retrieved', data: posts });
  } catch (error) {
    console.error('게시글 목록 가져오기 실패:', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};

// 게시글 삭제
exports.deletePost = (req, res) => {
  const postId = parseInt(req.params.post_id);
  const user = req.session?.user;

  // 인증되지 않은 사용자인 경우
  if (!user) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  try {
    const posts = postModel.readPostsFromFile();

    const postIndex = posts.findIndex((p) => p.post_id === postId);
    if (postIndex === -1) {
      return res.status(404).json({ message: 'post_not_found', data: null });
    }

    const post = posts[postIndex];
    if (post.author_id !== user.id) {
      return res.status(403).json({ message: 'no_permission', data: null });
    }

    posts.splice(postIndex, 1);
    postModel.writePostsToFile(posts);

    res.status(204).send();
  } catch (error) {
    console.error('게시글 삭제 실패:', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};

// 댓글 추가
exports.addComment = (req, res) => {
  const { post_id, content } = req.body;
  const user = req.session?.user;

  if (!user) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  if (!post_id || !content) {
    return res.status(400).json({ message: 'invalid_request', data: null });
  }

  try {
    const posts = postModel.readPostsFromFile();
    const comments = postModel.readCommentsFromFile();

    const post = posts.find((p) => p.post_id === post_id);
    if (!post) {
      return res.status(404).json({ message: 'post_not_found', data: null });
    }

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
    post.comment_ids.push(newComment.comment_id);

    postModel.writeCommentsToFile(comments);
    postModel.writePostsToFile(posts);

    res.status(201).json({ message: 'comment_created', data: newComment });
  } catch (error) {
    console.error('댓글 추가 실패:', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};

// 좋아요 증감
exports.likePost = (req, res) => {
  const postId = parseInt(req.params.post_id);

  try {
    const posts = postModel.readPostsFromFile();
    const post = posts.find((p) => p.post_id === postId);
    if (!post) {
      return res.status(404).json({ message: 'post_not_found', data: null });
    }

    if (liked) {
      // 좋아요 취소 = 좋아요 -1
      post.likes -= 1;
      postModel.writePostsToFile(posts);
      res
        .status(200)
        .json({ message: 'like_updated', data: { likes: post.likes } });
    } else {
      // 좋아요 +1
      post.likes += 1;
      postModel.writePostsToFile(posts);
      res
        .status(200)
        .json({ message: 'like_updated', data: { likes: post.likes } });
    }
  } catch (error) {
    console.error('Like update failed:', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};

exports.unlikePost = (req, res) => {
  const postId = parseInt(req.params.post_id);

  try {
    const posts = postModel.readPostsFromFile();
    const post = posts.find((p) => p.post_id === postId);
    if (!post) {
      return res.status(404).json({ message: 'post_not_found', data: null });
    }

    post.likes -= 1;
    postModel.writePostsToFile(posts);

    res
      .status(200)
      .json({ message: 'like_updated', data: { likes: post.likes } });
  } catch (error) {
    console.error('Like update failed:', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};
