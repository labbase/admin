const jwt = require("jsonwebtoken");
const pool = require("../db/pool");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const BASE_URL = process.env.BASE_URL;

// ✅ LOGIN
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // ✅ access token (짧게)
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      "secretkey",
      { expiresIn: "15m" }
    );

    // ✅ refresh token (길게)
    const refreshToken = jwt.sign(
      { id: user.id },
      "refresh_secret",
      { expiresIn: "7d" }
    );

    // ✅ cookie 저장
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });

    res.json({ message: "Login successful" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ ✅ ✅ NEW: REFRESH TOKEN API
const refresh = (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ error: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(token, "refresh_secret");

    const newAccessToken = jwt.sign(
      { id: decoded.id },
      "secretkey",
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    res.json({ message: "Token refreshed" });

  } catch {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
};

// ✅ LOGOUT
const logout = (req, res) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });

  res.json({ message: "Logged out" });
};

// ✅ REGISTER
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
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

// ✅ FORGOT
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 1000 * 60 * 15);

    await pool.query(
      "UPDATE users SET reset_token=$1, reset_token_expiry=$2 WHERE email=$3",
      [token, expiry, email]
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `${BASE_URL}/reset?token=${token}`;

    await transporter.sendMail({
      to: email,
      subject: "Password Reset",
      html: `<p>Click below to reset password:</p>
             <a href="${resetLink}">${resetLink}</a>`,
    });

    res.json({ message: "Reset email sent" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ✅ RESET
const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE reset_token=$1 AND reset_token_expiry > NOW()",
      [token]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      "UPDATE users SET password=$1, reset_token=NULL, reset_token_expiry=NULL WHERE id=$2",
      [hashed, user.id]
    );

    res.json({ message: "Password updated" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  login,
  refresh,   // ✅ 중요
  logout,
  register,
  forgotPassword,
  resetPassword,
};
