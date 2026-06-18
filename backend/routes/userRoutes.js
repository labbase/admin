const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

// ✅ 전체 조회
router.get("/", userController.getUsers);

// ✅ 특정 조회 (이건 반드시 아래!)
router.get("/:id", userController.getUserById);

// ✅ 생성
router.post("/", userController.createUser);

// ✅ 수정
router.put("/:id", userController.updateUser);

// ✅ 삭제
router.delete("/:id", userController.deleteUser);


module.exports = router;