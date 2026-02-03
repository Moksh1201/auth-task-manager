import { Router } from "express";
import Joi from "joi";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import roleMiddleware from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

const createTaskSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  description: Joi.string().allow("").max(1000).optional(),
  completed: Joi.boolean().optional(),
});

const updateTaskSchema = Joi.object({
  title: Joi.string().min(2).max(200).optional(),
  description: Joi.string().allow("").max(1000).optional(),
  completed: Joi.boolean().optional(),
}).min(1);

router.use(authMiddleware);

router.get("/", getTasks);
router.post("/", validate(createTaskSchema), createTask);
router.put("/:id", validate(updateTaskSchema), updateTask);
router.delete("/:id", roleMiddleware("ADMIN"), deleteTask);

export default router;
