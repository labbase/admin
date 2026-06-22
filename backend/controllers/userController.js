const userService = require("../services/userService");
const bcrypt = require("bcrypt");

const isStrongPassword = (password) => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};

const getUsers = async (req, res) => {
  try {
    const users = await userService.getUsers();
    res.json(users);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: "DB error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(id);

    // ✅ 없으면 404
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "DB error" });
  }
};

const createUser = async (req, res) => {

  try {
    const { name, email, password } = req.body;

    // ✅ validation (중요)
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email and password required" });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error: "Weak password"
      });
    }

    // ✅ password hashing
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await userService.createUser(name, email, hashedPassword);
    const { password: _, ...safeUser } = user;
    res.status(201).json(safeUser);


  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "DB error" });
  }
};


const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    // ✅ 1. 필수 값 체크 (password 제외)
    if (!name || !email) {
      return res.status(400).json({
        error: "name and email required",
      });
    }

    // ✅ 2. password가 있을 때만 strength 검사
    if (password && !isStrongPassword(password)) {
      return res.status(400).json({
        error: "Weak password",
      });
    }

    let user;

    // ✅ 3. password 있는 경우
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await userService.updateUser(
        id,
        name,
        email,
        hashedPassword
      );
    } 
    // ✅ 4. password 없는 경우 (기존 유지)
    else {
      user = await userService.updateUser(
        id,
        name,
        email,
        null
      );
    }

    // ✅ 5. 유저 없는 경우
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // ✅ 6. password 제거 후 응답
    const { password: _, ...safeUser } = user;

    res.json(safeUser);

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({
      error: "DB error",
    });
  }
};


const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userService.deleteUser(id);

    // ✅ 없는 경우
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({
      message: "User deleted",
      user,
    });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "DB error" });
  }
};


module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};