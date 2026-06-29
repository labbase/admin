
const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

  // ✅ accessToken으로 변경
  const token =
    req.cookies?.accessToken ||  // ✅ 핵심 수정
    req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    req.user = decoded;
    next();

  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = authMiddleware;
