import { Router } from "express";
import Joi from "joi";
import { register, login } from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).+$/)
  .required()
  .messages({
    "string.pattern.base":
      "Password must include uppercase, lowercase, number, and special character",
  });

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: passwordSchema,
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Confirm password must match password",
  }),
  role: Joi.string().valid("USER", "ADMIN").optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

export default router;
