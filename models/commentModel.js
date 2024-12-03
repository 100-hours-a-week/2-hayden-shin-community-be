const fs = require('fs');
const path = require('path');

const commentsFilePath = path.join(__dirname, '../data/comments.json');

// JSON 파일에서 댓글 데이터를 읽어오는 함수
function readCommentsFromFile() {
  const data = fs.readFileSync(commentsFilePath, 'utf-8');
  return JSON.parse(data);
}

// JSON 파일에 댓글 데이터를 저장하는 함수
function writeCommentsToFile(comments) {
  fs.writeFileSync(
    commentsFilePath,
    JSON.stringify(comments, null, 2),
    'utf-8'
  );
}

module.exports = {
  readCommentsFromFile,
  writeCommentsToFile,
};
