const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Goal = require("../models/Goal");
const Task = require("../models/Task");
const { errorHandler, generateRes } = require("../utils/utils");

// Create a new goal
router.post("/", async (req, res) => {
  try {
    const { title, description, targetDate, isPublic, color } = req.body;
    if (!title) return res.status(422).json({ message: "Title is Required", code: "MISSING_FIELDS" });

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User Not Found", code: "USER_NOT_FOUND" });
    }

    const newGoal = new Goal({
      userId: user._id,
      title,
      description,
      targetDate,
      isPublic,
      color,
    });
    await newGoal.save();
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $push: {
          goals: { $each: [newGoal._id], $position: 0 },
        },
      },
      { new: true, runValidators: true }
    ).populate({ path: "goals", populate: { path: "tasks" } });
    const generatedRes = generateRes(updatedUser);
    res.status(201).json({ ...generatedRes, notification: "1 Goal Created" });
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
});

// Get all goals for the authenticated user
router.get("/", async (req, res) => {
  try {
    const { goalId } = req.query;
    if (!goalId) return res.status(422).json({ message: "Goal ID is Required", code: "MISSING_FIELDS" });

    const tasks = await Task.find({ goalId }).sort({ _id: -1 });
    const tasksId = tasks.map((task) => task._id);

    const goal = await Goal.findByIdAndUpdate(goalId, { tasks: tasksId }).populate("tasks");
    if (!goal) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
    if (req.user.id !== goal.userId.toString()) {
      return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });
    }

    res.status(200).json(goal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error", code: "SERVER_ERROR", details: err.message });
  }
});

// Edit goal for the authenticated user
router.put("/", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { goalId, color, title, description, targetDate, progress, status, isPublic } = req.body;
    if (!goalId) return res.status(422).json({ message: "Goal ID is Required", code: "MISSING_FIELDS" });

    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
    if (user._id !== goal.userId.toString()) {
      return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });
    }

    const updatedGoal = await Goal.findByIdAndUpdate(
      goal._id,
      {
        title,
        description,
        targetDate,
        progress,
        status,
        isPublic,
        color,
      },
      { new: true, runValidators: true }
    ).populate("tasks");

    res.status(200).json({ ...updatedGoal.toObject(), notification: "1 Goal Updated" });
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
});

// Soft Deleting a goal and all associated tasks
router.delete("/", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { goalId } = req.body;
    if (!goalId) return res.status(422).json({ message: "Goal ID is Required", code: "MISSING_FIELDS" });

    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
    if (user._id.toString() !== goal.userId.toString()) {
      return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });
    }

    if (goal.tasks && goal.tasks.length > 0) {
      const taskIds = goal.tasks.map((task) => task._id);
      await Task.updateMany({ _id: { $in: taskIds } }, { $set: { isRecycled: true, deleteAt: Date.now() + 24 * 60 * 60 * 1000 } });
    }
    await Goal.findByIdAndUpdate(goal._id, { isRecycled: true, deleteAt: Date.now() + 24 * 60 * 60 * 1000 });

    res.status(200).json({ _id: goal._id, notification: "1 Goal And All Tasks Inside Deleted" });
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
});

// Restore soft deleted goal
router.put("/restore", async (req, res) => {
  try {
    if (!req.body.goalId) return res.status(422).json({ message: "Goal ID is Required", code: "MISSING_FIELDS" });
    const goal = await Goal.findById(req.body.goalId);
    if (goal.userId.toString() !== res.user.id) return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });

    await Task.updateMany({ _id: { $in: goal.tasks } }, { isRecycled: false, deleteAt: null }, { runValidators: true });
    await Goal.findByIdAndUpdate(goal._id, { isRecycled: false, deleteAt: null }, { new: true, runValidators: true }).populate("tasks");

    const userPopulated = await User.findById(req.user.id).populate({ path: "goals", populate: { path: "tasks" } });
    const generatedRes = generateRes(userPopulated);
    res.status(200).json({ ...generatedRes, notification: "1 Goal Restored" });
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
});

module.exports = router;
