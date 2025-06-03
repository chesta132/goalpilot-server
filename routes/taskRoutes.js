const express = require("express");
const router = express.Router();
const Goal = require("../models/Goal");
const Task = require("../models/Task");
const { errorHandler, generateReward } = require("../utils/utils");

// Create a new task
router.post("/", async (req, res) => {
  try {
    const { goalId, title, description, targetDate, difficulty } = req.body;
    if (!goalId || !title) return res.status(422).json({ message: "Goal ID and Title is Required", code: "MISSING_FIELDS" });

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
      task: title,
      description,
      targetDate,
      difficulty,
      rewardPoints,
    });
    await newTask.save();

    await Goal.findByIdAndUpdate(goal._id, {
      $push: {
        tasks: newTask._id,
      },
    });
    const goalPopulated = await Goal.findById(goalId).populate("tasks").exec();

    if (!goalPopulated) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
    res.status(201).json({ ...goalPopulated.toObject(), notification: "1 Task Created" });
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
});

// Update an existing task and restore it if needed
router.put("/", async (req, res) => {
  try {
    const { goalId, taskId, restore, title, description, isCompleted, targetDate, difficulty } = req.body;
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

    if (restore) {
      await Task.findByIdAndUpdate(task._id, { isRecycled: false, deleteAt: null }, { new: true, runValidators: true });

      const goalPopulated = await Goal.findById(goal._id).populate("tasks").exec();
      if (!goalPopulated) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
      return res.status(200).json({ ...goalPopulated.toObject(), notification: "1 Task Restored" });
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

    const goalPopulated = await Goal.findById(goal._id).populate("tasks").exec();
    if (!goalPopulated) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
    res.status(200).json({ ...goalPopulated.toObject(), notification: "1 Task Updated" });
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

    const goalPopulated = await Goal.findById(goal._id).populate("tasks").exec();
    if (!goalPopulated) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
    res.status(200).json({ ...goalPopulated.toObject(), _id: task._id, notification: "1 Task Deleted" });
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
});

module.exports = router;
