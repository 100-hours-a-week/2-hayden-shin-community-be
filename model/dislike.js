import { db } from '../db/database.js';
import { countDislike } from './post.js';

export async function getByPostIdAndUserId(postId, userId) {
  return db
    .execute('SELECT * FROM dislikes WHERE postId = ? AND userId = ?', [
      postId,
      userId,
    ]) //
    .then((result) => result[0][0]);
}

export async function add(dislike) {
  const { postId, userId } = dislike;
  return db
    .execute('INSERT INTO dislikes (postId, userId) VALUES (?,?)', [
      postId,
      userId,
    ]) //
    .then((result) => result[0].insertId);
}

export async function remove(dislike) {
  const { id, postId } = dislike;
  return db
    .execute('DELETE FROM dislikes WHERE id = ?', [id]) //
    .then(() => countDislike(postId, id));
}
