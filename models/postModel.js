const fs = require('fs');
const path = require('path');

const postsFilePath = path.join(__dirname, '../data/posts.json');
const commentsFilePath = path.join(__dirname, '../data/comments.json');

// JSON 파일에서 데이터를 읽어오는 함수
function readPostsFromFile() {
  const data = fs.readFileSync(postsFilePath, 'utf-8');
  return JSON.parse(data);
}

function readCommentsFromFile() {
  const data = fs.readFileSync(commentsFilePath, 'utf-8');
  return JSON.parse(data);
}

// JSON 파일에 데이터를 쓰는 함수
function writePostsToFile(posts) {
  fs.writeFileSync(postsFilePath, JSON.stringify(posts, null, 2), 'utf-8');
}

function writeCommentsToFile(comments) {
  fs.writeFileSync(
    commentsFilePath,
    JSON.stringify(comments, null, 2),
    'utf-8'
  );
}

module.exports = {
  readPostsFromFile,
  writePostsToFile,
  readCommentsFromFile,
  writeCommentsToFile,
};
