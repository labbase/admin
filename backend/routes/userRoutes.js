const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ 전체 조회
router.get("/", authMiddleware,userController.getUsers);

// ✅ 특정 조회 (이건 반드시 아래!)
router.get("/:id", authMiddleware, userController.getUserById);

// ✅ 생성
router.post("/", authMiddleware, userController.createUser);

// ✅ 수정
router.put("/:id", authMiddleware, userController.updateUser);

// ✅ 삭제
router.delete("/:id", authMiddleware, userController.deleteUser);


module.exports = router;