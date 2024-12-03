const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/users.json');

// JSON 파일에서 사용자 데이터를 읽어오는 함수
function readUsersFromFile() {
  const data = fs.readFileSync(usersFilePath, 'utf-8');
  return JSON.parse(data);
}

// JSON 파일에 사용자 데이터를 저장하는 함수
function writeUsersToFile(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
}

module.exports = {
  readUsersFromFile,
  writeUsersToFile,
};
