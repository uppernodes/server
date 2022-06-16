import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario";
const JWT_SECRET = "f1naancial!";

export const checkAuthMiddleware = async (request, response, next) => {
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
    request.userId = decoded._id;

    return next();
  } catch (error) {
    return response.status(401).json({
      error: true,
      code: "token.invalid",
      message: "Token invalid.",
    });
  }
};

export const isInstructor = async (request, response, next) => {
  try {
    const user = await Usuario.findOne({ email: request.user });

    if (!user.role.includes("Instructor")) {
      response.sendStatus(403);
    } else {
      next();
    }
  } catch (err) {
    return response.status(401).json({
      error: true,
      code: "token.invalid",
      message: "Token invalid.",
    });
  }
};
