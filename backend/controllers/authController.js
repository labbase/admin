const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
const bcrypt = require("bcrypt");

// ✅ LOGIN
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];
    // ✅ user 체크 먼저
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
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


// ✅ REGISTER (Create User)
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 중복 체크
    const existing = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING id, email",
      [name, email, hashed]
    );

    res.json({
      message: "User created",
      user: result.rows[0],
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ FORGOT PASSWORD (simple reset)
const forgotPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCheck = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE users SET password = $1 WHERE email = $2",
      [hashed, email]
    );

    res.json({ message: "Password updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


module.exports = { login, register, forgotPassword };
