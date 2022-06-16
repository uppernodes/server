import "dotenv/config";
import express from "express";

const router = express.Router();

import jwt from "jsonwebtoken";

const JWT_SECRET = "f1naancial!";

import {
  apple,
  currentUser,
  getAccountStatus,
  getUserById,
  google,
  login,
  makeInstructor,
  me,
  refresh,
  register,
  sendEmailTest,
  sessions,
  update,
} from "../controller/auth";

function checkAuthMiddleware(request, response) {
  const { authorization } = request.headers;

  if (!authorization) {
    return response.status(401).json({
      error: true,
      code: "token.invalid",
      message: "Token not present.",
    });
  }

  const [, token] = authorization?.split(" ");

  if (!token) {
    return response.status(401).json({
      error: true,
      code: "token.invalid",
      message: "Token not present.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    request.user = decoded.email;

    return next();
  } catch (error) {
    const decoded = jwt.verify(token, JWT_SECRET);
    return response.status(401).json({
      error: decoded.email,
      code: "token.expired",
      message: "Token invalid.",
    });
  }
}

router.put("/update/:userId/:key/:value", update);

router.post("/sessions", sessions);

router.get("/me", checkAuthMiddleware, me);

router.get("/user/:userId", getUserById);

router.post("/register", register);

router.post("/google", register);

router.post("/apple", register);

router.post("/login", login);

router.get("/email-test", sendEmailTest);

router.post("/make-instructor", makeInstructor);
router.post("/get-account-status", getAccountStatus);
export default router;
