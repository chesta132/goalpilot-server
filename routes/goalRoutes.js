const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Goal = require("../models/Goal");
const Task = require("../models/Task");
const { errorHandler } = require("../utils/utils");

// Create a new goal
router.post("/", async (req, res) => {
  try {
    const { title, description, targetDate, isPublic } = req.body;
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
    });
    await newGoal.save();
    await User.findByIdAndUpdate(
      user._id,
      {
        $push: { goals: newGoal._id },
      },
      { new: true, runValidators: true }
    );
    res.status(201).json({ ...newGoal.toObject(), notification: "1 Goal Created" });
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
});

// Get all goals for the authenticated user
router.get("/", async (req, res) => {
  try {
    const { goalId } = req.body;
    if (!goalId) return res.status(422).json({ message: "Goal ID is Required", code: "MISSING_FIELDS" });

    const goal = await Goal.findById(goalId).populate("tasks").exec();
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

// Get all goals for the authenticated user
router.put("/", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { goalId, restore, title, description, targetDate, progress, status, isPublic } = req.body;
    if (!goalId) return res.status(422).json({ message: "Goal ID is Required", code: "MISSING_FIELDS" });

    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
    if (req.user.id !== goal.userId.toString()) {
      return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });
    }

    if (restore) {
      await Task.updateMany({ _id: { $in: goal.tasks } }, { $set: { isRecycled: false, deleteAt: null } }, { runValidators: true });
      const restoredGoal = await Goal.findByIdAndUpdate(goal._id, { isRecycled: false, deleteAt: null }, { new: true, runValidators: true })
        .populate("tasks")
        .exec();
      user.goals.push(restoredGoal._id);
      await user.save();
      return res.status(200).json({ ...restoredGoal.toObject(), notification: "1 Goal And All Tasks Inside Restored" });
    }

    await Goal.findByIdAndUpdate(
      goal._id,
      {
        title,
        description,
        targetDate,
        progress,
        status,
        isPublic,
      },
      { new: true, runValidators: true }
    );

    const goalPopulated = await Goal.findById(goal._id).populate("tasks").exec();
    if (!goalPopulated) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
    res.status(200).json({ ...goalPopulated.toObject(), notification: "1 Goal Updated" });
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
    user.goals = user.goals.filter((goalParam) => goalParam.toString() !== goal._id.toString());
    await user.save();
    res.status(200).json({ _id: goal._id, notification: "1 Goal And All Tasks Inside Deleted" });
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
});

module.exports = router;
