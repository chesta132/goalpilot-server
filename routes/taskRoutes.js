const express = require("express");
const router = express.Router();
const Goal = require("../models/Goal");
const Task = require("../models/Task");
const { errorHandler, generateReward } = require("../utils/utils");

// Create a new task
router.post("/", async (req, res) => {
  try {
    const { goalId, task, description, targetDate, difficulty } = req.body;
    if (!goalId || !task) return res.status(422).json({ message: "Task and Goal ID is Required", code: "MISSING_FIELDS" });

    const goal = await Goal.findById(goalId);
    if (!goal) {
      return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
    }
    if (req.user.id !== goal.userId.toString()) {
      return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });
    }

    const rewardPoints = generateReward(req.body);
    const newTask = new Task({
      goalId: goal._id,
      task,
      description,
      targetDate,
      difficulty,
      rewardPoints,
    });
    await newTask.save();

    await Goal.findByIdAndUpdate(goal._id, {
      $push: {
        tasks: { $each: [newTask._id], $position: 0 },
      },
    });
    res.status(201).json({ notification: `${newTask.task} Created` });
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
});

// Update an existing task
router.put("/", async (req, res) => {
  try {
    const { goalId, taskId, title, description, isCompleted, targetDate, difficulty } = req.body;
    if (!goalId || !taskId) return res.status(422).json({ message: "Goal ID and Task ID is Required", code: "MISSING_FIELDS" });

    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
    if (req.user.id !== goal.userId.toString()) {
      return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task Not Found", code: "TASK_NOT_FOUND" });
    if (task.goalId.toString() !== goal._id.toString()) {
      return res.status(401).json({ message: "Task Belongs To Another Goal", code: "INVALID_TASK" });
    }

    let completedAt = null;
    if (isCompleted === true) {
      completedAt = Date.now();
    } else completedAt = null;
    const rewardPoints = generateReward(req.body);

    await Task.findByIdAndUpdate(task._id, {
      task: title,
      description,
      isCompleted,
      targetDate,
      difficulty,
      rewardPoints,
      completedAt,
    });

    res.status(200).json({ notification: `${task.title} Updated` });
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
});

// Soft Deleting a task
router.delete("/", async (req, res) => {
  try {
    const { goalId, taskId } = req.body;
    if ((!goalId, !taskId)) return res.status(422).json({ message: "Goal ID and Task ID is Required", code: "MISSING_FIELDS" });

    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
    if (req.user.id !== goal.userId.toString()) {
      return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task Not Found", code: "TASK_NOT_FOUND" });
    if (task.goalId.toString() !== goal._id.toString()) {
      return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });
    }

    await Task.findByIdAndUpdate(task._id, { isRecycled: true, deleteAt: Date.now() + 24 * 60 * 60 * 1000 });

    res.status(200).json({ _id: task._id, notification: `${task.title} Deleted` });
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
});

// Restore soft deleted task
router.put("/restore", async (req, res) => {
  try {
    if (!req.body.taskId) return res.status(422).json({ message: "Task ID is Required", code: "MISSING_FIELDS" });
    const task = await Task.findById(req.body.taskId);
    const goal = await Goal.findById(task.goalId);
    if (goal.userId.toString() !== res.user.id) return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });

    await Task.findByIdAndUpdate(task._id, { isRecycled: false, deleteAt: null }, { new: true, runValidators: true });
    res.status(200).json({ notification: `${task.title} Restored` });
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
});

module.exports = router;
