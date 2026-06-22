const pool = require("../db/pool");
const bcrypt = require("bcrypt");

// ✅ DB 관련 로직은 서비스로 분리 (controller는 최대한 깔끔하게)
const getUsers = async () => {
  const result = await pool.query("SELECT id, name, email FROM users");
  return result.rows;
};

const createUser = async (name, email, password) => {
  const result = await pool.query(
    "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
    [name, email, password]
  );

  return result.rows[0];
};

const getUserById = async (id) => {
  const result = await pool.query(
    "SELECT id, name, email FROM users WHERE id = $1",
    [id]
  );

  return result.rows[0]; // 한 명
};


const updateUser = async (id, name, email, password) => {
  let result;

  // ✅ password 있는 경우 (변경)
  if (password) {
    result = await pool.query(
      "UPDATE users SET name=$1, email=$2, password=$3 WHERE id=$4 RETURNING id, name, email",
      [name, email, password, id]
    );
  } 
  // ✅ password 없는 경우 (기존 유지)
  else {
    result = await pool.query(
      "UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING id, name, email",
      [name, email, id]
    );
  }

  return result.rows[0];
};


const deleteUser = async (id) => {
  const result = await pool.query(
    "DELETE FROM users WHERE id = $1 RETURNING *",
    [id]
  );

  return result.rows[0];
};


module.exports = {
  getUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};