const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');

// 데이터 파일 경로
const usersFilePath = path.join(__dirname, '../data/users.json');

// JSON 파일 읽기
function readUsersFromFile() {
  const data = fs.readFileSync(usersFilePath, 'utf-8');
  return JSON.parse(data);
}

// JSON 파일 저장
function writeUsersToFile(users) {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
}

// 회원가입
exports.signup = async (req, res) => {
  const { email, password, nickname, profile_url } = req.body;

  if (!email || !password || !nickname) {
    return res.status(400).json({ message: 'invalid_request', data: null });
  }

  try {
    const users = readUsersFromFile();
    if (users.some((user) => user.email === email)) {
      return res
        .status(400)
        .json({ message: 'email_already_exists', data: null });
    }

    // const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 암호화
    const newUser = {
      id: users.length + 1,
      profile_url: profile_url || '/assets/default-profile.jpg',
      email,
      password,
      nickname,
      created_at: new Date().toISOString(),
    };

    users.push(newUser);
    writeUsersToFile(users);

    res.status(201).json({
      message: 'register_success',
      data: { user_id: newUser.id },
    });
  } catch (error) {
    console.error('회원가입 실패:', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};

// 로그인
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'invalid_request', data: null });
  }

  try {
    const users = readUsersFromFile();
    const user = users.find((user) => user.email === email);
    if (!user) {
      return res.status(400).json({ message: 'login_fail', data: null });
    }

    // const isPasswordMatch = await compare(password, user.password);

    if (password !== user.password) {
      return res.status(400).json({ message: 'login_fail', data: null });
    }

    // 세션 생성
    req.session.user = { id: user.id, nickname: user.nickname };
    res.cookie('user_session', req.sessionID, { httpOnly: true });

    res.status(200).json({
      message: 'login_success',
      data: { nickname: user.nickname },
    });
  } catch (error) {
    console.error('로그인 실패:', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};

// 로그아웃
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .json({ message: 'internal_server_error', data: null });
    }
    res.clearCookie('user_session');
    res.status(204).send();
  });
};

// 사용자 정보 수정
exports.updateProfile = (req, res) => {
  const userId = parseInt(req.params.userId);
  const { new_email, new_nickname, new_profile_image } = req.body;

  try {
    const users = readUsersFromFile();
    const user = users.find((user) => user.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'not_found', data: null });
    }

    if (new_email) user.email = new_email;
    if (new_nickname) user.nickname = new_nickname;
    if (new_profile_image) user.profile_url = new_profile_image;

    writeUsersToFile(users);
    res.status(200).json({ message: 'profile_updated', data: null });
  } catch (error) {
    console.error('사용자 정보 수정 실패:', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};

// 사용자 정보 수정
exports.updatePassword = (req, res) => {
  const userId = parseInt(req.params.userId);
  const { new_password } = req.body;

  try {
    const users = readUsersFromFile();
    const user = users.find((user) => user.id === userId);
    if (!user) {
      return res.status(404).json({ message: 'not_found', data: null });
    }

    if (new_password) user.password = new_password;

    writeUsersToFile(users);
    res.status(200).json({ message: 'password_updated', data: null });
  } catch (error) {
    console.error('사용자 정보 수정 실패:', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};

// 회원 탈퇴
exports.deleteAccount = (req, res) => {
  const { password } = req.body;
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'unauthorized', data: null });
  }

  try {
    const users = readUsersFromFile();
    const userIndex = users.findIndex((user) => user.id === userId);

    if (
      userIndex === -1 ||
      !bcrypt.compareSync(password, users[userIndex].password)
    ) {
      return res.status(401).json({ message: 'unauthorized', data: null });
    }

    users.splice(userIndex, 1);
    writeUsersToFile(users);

    req.session.destroy();
    res.clearCookie('user_session');
    res.status(204).send();
  } catch (error) {
    console.error('회원 탈퇴 실패:', error);
    res.status(500).json({ message: 'internal_server_error', data: null });
  }
};
