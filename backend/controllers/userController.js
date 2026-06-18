const userService = require("../services/userService");

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
    const { name, email } = req.body;

    // ✅ validation (중요)
    if (!name || !email) {
      return res.status(400).json({ error: "name and email required" });
    }

    console.log("CREATE USER:", name, email);

    const user = await userService.createUser(name, email);

    res.status(201).json(user);
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "DB error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    // ✅ validation
    if (!name || !email) {
      return res.status(400).json({ error: "name and email required" });
    }
    console.log("UPDATE USER:", id, name, email);
    const user = await userService.updateUser(id, name, email);

    // ✅ 없는 경우
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "DB error" });
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
    
    console.log("DELETE USER:", user);
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