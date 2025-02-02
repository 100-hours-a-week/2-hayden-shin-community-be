import { db } from '../db/database.js';

const POSTS_SELECT_JOIN = `
  SELECT p.id, p.title, p.likeCount, p.dislikeCount, p.viewCount, p.commentCount, COALESCE(p.updatedAt, p.createdAt) AS createdAt, p.userId, u.username, u.url 
  FROM post as p 
  JOIN user as u ON p.userId = u.id
  `;
const POST_SELECT_JOIN = `
  SELECT p.id, p.title, p.content, p.image, p.likeCount, p.dislikeCount, p.viewCount, p.commentCount, COALESCE(p.updatedAt, p.createdAt) AS createdAt, p.userId, u.username, u.url
  FROM post AS p
  JOIN user AS u ON p.userId = u.id
`;
const ORDER_DESC = 'ORDER BY p.createdAt DESC';

export async function getAll() {
  return db
    .execute(`${POSTS_SELECT_JOIN} ${ORDER_DESC}`) //
    .then((result) => result[0]);
}

export async function getById(id) {
  return db
    .execute(`${POST_SELECT_JOIN} WHERE p.id = ?`, [id]) //
    .then((result) => result[0][0]);
}

export async function create(post) {
  const { title, content, image = null, userId } = post;
  return db
    .execute(
      'INSERT INTO post (title, content, image, userId) VALUES (?,?,?,?)',
      [title, content, image, userId]
    ) //
    .then((result) => getById(result[0].insertId));
}

export async function update(title, content, image = null, id) {
  return db
    .execute('UPDATE post SET title = ?, content = ?, image = ? WHERE id = ?', [
      title,
      content,
      image,
      id,
    ]) //
    .then(() => getById(id));
}

export async function remove(id) {
  return db.execute('DELETE FROM post WHERE id = ?', [id]);
}

export async function view(id) {
  return db
    .execute('UPDATE post SET viewCount = viewCount + 1 WHERE id = ?', [id]) //
    .then((result) => result[0][0]);
}

export async function countComment(id, commentId) {
  if (commentId) {
    await db.execute(
      'UPDATE post SET commentCount = commentCount - 1 WHERE id = ?',
      [id]
    );
  } else {
    await db.execute(
      'UPDATE post SET commentCount = commentCount + 1 WHERE id = ?',
      [id]
    );
  }
  return db
    .execute('SELECT commentCount FROM post WHERE id = ?', [id]) //
    .then((result) => result[0][0].commentCount);
}

export async function countLike(id, likeId) {
  if (likeId) {
    await db.execute('UPDATE post SET likeCount = likeCount - 1 WHERE id = ?', [
      id,
    ]);
  } else {
    await db.execute('UPDATE post SET likeCount = likeCount + 1 WHERE id = ?', [
      id,
    ]);
  }
  return db
    .execute('SELECT likeCount FROM post WHERE id = ?', [id]) //
    .then((result) => result[0][0].likeCount);
}

export async function countDislike(id, dislikeId) {
  if (dislikeId) {
    await db.execute(
      'UPDATE post SET dislikeCount = dislikeCount - 1 WHERE id = ?',
      [id]
    );
  } else {
    await db.execute(
      'UPDATE post SET dislikeCount = dislikeCount + 1 WHERE id = ?',
      [id]
    );
  }
  return db
    .execute('SELECT dislikeCount FROM post WHERE id = ?', [id]) //
    .then((result) => result[0][0].dislikeCount);
}
