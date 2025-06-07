const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Goal = require("../models/Goal");
const Task = require("../models/Task");
const { errorHandler, generateRes } = require("../utils/utils");

// Read user profile
router.patch("/", async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User Not Found", code: "USER_NOT_FOUND" });

    await User.findOneAndUpdate(user._id, { lastActive: new Date(), status: "online" }, { new: true, runValidators: true });
    const userPopulated = await User.findById(user._id).populate({ path: "goals", populate: { path: "tasks" } });

    const userResponse = generateRes(userPopulated);
    res.status(200).json(userResponse);
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
});

// Get user by username for public profile
router.get("/", async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(422).json({ message: "Username is Required", code: "MISSING_FIELDS" });

    const user = await User.findOne({ username: username }).populate({ path: "goals", populate: { path: "tasks" } });
    if (!user) return res.status(404).json({ message: "User Not Found", code: "USER_NOT_FOUND" });

    const userResponse = generateRes(user);
    if (user._id.toString() !== req.user.id) {
      delete userResponse.email;
      if (userResponse.goals && userResponse.goals.length > 0) userResponse.goals = userResponse.goals.filter((goal) => goal.isPublic === true);
    }

    res.status(200).json(userResponse);
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
});

// Delete user and all associated goals and tasks
router.delete("/", async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate({ path: "goals", populate: { path: "tasks" } });
    if (!user) return res.status(404).json({ message: "User Not Found", code: "USER_NOT_FOUND" });

    const goalsAndTasksId = user.goals.reduce(
      (acc, goal) => {
        acc.goalsId.push(goal._id);
        acc.tasksId.push(...goal.tasks.map((task) => task._id));
        return acc;
      },
      { goalsId: [], tasksId: [] }
    );

    await Task.deleteMany({ _id: { $in: goalsAndTasksId.tasksId } });
    await Goal.deleteMany({ _id: { $in: goalsAndTasksId.goalsId } });
    await User.findByIdAndDelete(user._id);

    res.status(204).send();
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
});

// Update user status to online
router.patch("/heartbeat", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { status: "online", lastActive: new Date() }, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ message: "User Not Found", code: "USER_NOT_FOUND" });

    res.status(204).send();
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
});

// Update user status to offline if last active time exceeds threshold
const OFFLINE_THRESHOLD = 60 * 1000; // 1 minute in milliseconds
setInterval(async () => {
  try {
    const now = new Date();
    const lastOnline = new Date(now.getTime() - OFFLINE_THRESHOLD);

    const usersToUpdate = await User.find({ lastActive: { $lt: lastOnline }, status: "online" });

    if (usersToUpdate.length > 0) {
      await User.updateMany({ _id: { $in: usersToUpdate.map((user) => user._id) } }, { status: "offline" });
    }
  } catch (err) {
    console.error("Error updating offline users:", err);
    errorHandler(err, res);
  }
}, OFFLINE_THRESHOLD);

module.exports = router;
