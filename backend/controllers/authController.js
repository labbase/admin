const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
const bcrypt = require("bcrypt");

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!user || !match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ JWT 생성
    const token = jwt.sign(
      { id: user.id, email: user.email },
      "secretkey",
      { expiresIn: "8h" } 
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { login };
