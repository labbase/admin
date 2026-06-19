const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // ✅ header 없으면 차단
  if (!authHeader) {
    return res.status(401).json({ error: "No token" });
  }

  // ✅ "Bearer TOKEN" 분리
  const token = authHeader.split(" ")[1];

  try {
    // ✅ 검증
    const decoded = jwt.verify(token, "secretkey");

    // ✅ 요청에 유저 정보 추가 (나중에 쓴다)
    req.user = decoded;

    next(); // 통과 ✅
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;