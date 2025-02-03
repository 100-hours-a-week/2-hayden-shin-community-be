import { db } from '../db/database.js';
import { countComment } from './post.js';

const SELECT_JOIN = `
  SELECT c.id, c.content, 
        DATE_FORMAT(c.createdAt, '%Y-%m-%d %H:%i') AS createdAt, 
        DATE_FORMAT(c.updatedAt, '%Y-%m-%d %H:%i') AS updatedAt,
        c.userId, u.username, u.url 
  FROM comment AS c 
  JOIN user AS u ON c.userId = u.id
  `;
const ORDER_ASC = 'ORDER BY c.createdAt ASC';

export async function getById(id) {
  return db
    .execute(`${SELECT_JOIN} WHERE c.id = ?`, [id]) //
    .then((result) => result[0][0]);
}

export async function getByPostId(id) {
  return db
    .execute(`${SELECT_JOIN} WHERE postId = ? ${ORDER_ASC}`, [id]) //
    .then((result) => result[0]);
}

export async function create(comment) {
  const { content, postId, userId } = comment;
  return db
    .execute('INSERT INTO comment (content, postId, userId) VALUES (?,?,?)', [
      content,
      postId,
      userId,
    ]) //
    .then((result) => result[0].insertId);
}

export async function update(content, id) {
  return db
    .execute('UPDATE comment SET content = ?, updatedAt = NOW() WHERE id = ?', [
      content,
      id,
    ]) //
    .then(() => getById(id));
}

export async function remove(id, postId) {
  return db
    .execute('DELETE FROM comment WHERE id = ?', [id]) //
    .then(() => countComment(postId, id));
}
