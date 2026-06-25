const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

 // ✅ cookie OR header 둘 다 지원
  const token =
    req.cookies?.token ||
    req.headers.authorization?.split(" ")[1];

  // ✅ 토큰 없으면 차단
  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    // ✅ JWT 검증
    const decoded = jwt.verify(token, "secretkey");

    // ✅ 사용자 정보 저장
    req.user = decoded;

    // ✅ 다음으로 진행
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;
