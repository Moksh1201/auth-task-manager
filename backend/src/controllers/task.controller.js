import mongoose from "mongoose";
import Task from "../models/task.model.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getTasks = async (req, res, next) => {
  try {
    const filter = req.user.role === "ADMIN" ? {} : { user: req.user.id };
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ data: tasks });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const task = await Task.create({
      title: req.body.title,
      description: req.body.description || "",
      completed: req.body.completed ?? false,
      user: req.user.id,
    });

    res.status(201).json({ message: "Task created", data: task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (req.user.role !== "ADMIN" && task.user.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed to update this task" });
    }

    task.title = req.body.title ?? task.title;
    task.description = req.body.description ?? task.description;
    if (typeof req.body.completed === "boolean") {
      task.completed = req.body.completed;
    }

    await task.save();

    res.status(200).json({ message: "Task updated", data: task });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid task id" });
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne();
    res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    next(error);
  }
};
