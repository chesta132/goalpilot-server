// const express = require("express");
// const router = express.Router();
// const User = require("../models/User");
// const Goal = require("../models/Goal");
// const Task = require("../models/Task");
// const { authenticateJWT } = require("../middlewares/authen");
// const { errorHandler, generateRes, generateReward } = require("../utils/utils");

// const aiRouter = require("./aiRoutes");

// router.patch("/", authenticateJWT, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) return res.status(404).json({ message: "User Not Found", code: "USER_NOT_FOUND" });

//     await User.findOneAndUpdate(user._id, { lastActive: new Date() }, { new: true, runValidators: true });
//     const userPopulated = await User.findById(user._id).populate({ path: "goals", populate: { path: "tasks" } });

//     const userResponse = generateRes(userPopulated);
//     res.status(200).json(userResponse);
//   } catch (err) {
//     console.error(err);
//     errorHandler(err, res);
//   }
// });

// router.get("/:username", authenticateJWT, async (req, res) => {
//   try {
//     const user = await User.findOne({ username: req.params.username }).populate({ path: "goals", populate: { path: "tasks" } });
//     if (!user) return res.status(404).json({ message: "User Not Found", code: "USER_NOT_FOUND" });
//     const userResponse = generateRes(user);
//     if (user._id.toString() !== req.user.id) {
//       delete userResponse.email;
//       if (userResponse.goals && userResponse.goals.length > 0) userResponse.goals = userResponse.goals.filter((goal) => goal.isPublic === true);
//     }
//     res.status(200).json(userResponse);
//   } catch (err) {
//     console.error(err);
//     errorHandler(err, res);
//   }
// });

// router.delete("/:userId", authenticateJWT, async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const user = await User.findById(userId).populate({ path: "goals", populate: { path: "tasks" } });
//     if (!user) return res.status(404).json({ message: "User Not Found", code: "USER_NOT_FOUND" });
//     if (req.user.id !== user._id.toString()) {
//       return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });
//     }

//     const goalsAndTasksId = user.goals.reduce(
//       (acc, goal) => {
//         acc.goalsId.push(goal._id);
//         acc.tasksId.push(...goal.tasks.map((task) => task._id));
//         return acc;
//       },
//       { goalsId: [], tasksId: [] }
//     );

//     await Task.deleteMany({ _id: { $in: goalsAndTasksId.tasksId } });
//     await Goal.deleteMany({ _id: { $in: goalsAndTasksId.goalsId } });
//     await User.findByIdAndDelete(user._id);

//     res.status(204).send();
//   } catch (err) {
//     console.error(err);
//     errorHandler(err, res);
//   }
// });

// router.post("/goal", authenticateJWT, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({ message: "User Not Found", code: "USER_NOT_FOUND" });
//     }
//     const newGoal = new Goal({
//       userId: user._id,
//       title: req.body.title,
//       description: req.body?.description,
//       targetDate: req.body?.targetDate,
//       isPublic: req.body?.isPublic,
//     });
//     await newGoal.save();
//     await User.findByIdAndUpdate(
//       user._id,
//       {
//         $push: { goals: newGoal._id },
//       },
//       { new: true, runValidators: true }
//     );
//     res.status(201).json({ ...newGoal.toObject(), notification: "1 Goal Created" });
//   } catch (err) {
//     console.error(err);
//     errorHandler(err, res);
//   }
// });

// router.get("/goal/:goalId", authenticateJWT, async (req, res) => {
//   try {
//     const goalId = req.params.goalId;
//     const goal = await Goal.findById(goalId);
//     if (req.user.id !== goal.userId.toString()) {
//       return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });
//     }

//     const goalPopulated = await Goal.findById(goal._id).populate("tasks").exec();
//     if (!goalPopulated) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
//     res.status(200).json(goalPopulated);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Internal Server Error", code: "SERVER_ERROR", details: err.message });
//   }
// });

// router.put("/goal/:goalId", authenticateJWT, async (req, res) => {
//   try {
//     const goalId = req.params.goalId;
//     const goal = await Goal.findById(goalId);
//     if (!goal) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
//     if (req.user.id !== goal.userId.toString()) {
//       return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });
//     }

//     const body = req.body;

//     if (body.restore) {
//       await Task.updateMany({ _id: { $in: goal.tasks } }, { $set: { isRecycled: false, deleteAt: null } }, { runValidators: true });
//       const restoredGoal = await Goal.findByIdAndUpdate(goal._id, { isRecycled: false, deleteAt: null }, { new: true, runValidators: true })
//         .populate("tasks")
//         .exec();
//       return res.status(200).json({ ...restoredGoal.toObject(), notification: "1 Goal And All Tasks Inside Restored" });
//     }

//     await Goal.findByIdAndUpdate(
//       goal._id,
//       {
//         title: body?.title,
//         description: body?.description,
//         targetDate: body?.targetDate,
//         progress: body?.progress,
//         status: body?.status,
//         isPublic: body?.isPublic,
//       },
//       { new: true, runValidators: true }
//     );

//     const goalPopulated = await Goal.findById(goal._id).populate("tasks").exec();
//     if (!goalPopulated) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
//     res.status(200).json({ ...goalPopulated.toObject(), notification: "1 Goal Updated" });
//   } catch (err) {
//     console.error(err);
//     errorHandler(err, res);
//   }
// });

// router.delete("/goal/:goalId", authenticateJWT, async (req, res) => {
//   try {
//     const goalId = req.params.goalId;
//     const goal = await Goal.findById(goalId);
//     if (!goal) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
//     if (req.user.id !== goal.userId.toString()) {
//       return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });
//     }

//     if (goal.tasks && goal.tasks.length > 0) {
//       const taskIds = goal.tasks.map((task) => task._id);
//       await Task.updateMany({ _id: { $in: taskIds } }, { $set: { isRecycled: true, deleteAt: Date.now() + 24 * 60 * 60 * 1000 } });
//     }
//     await Goal.findByIdAndUpdate(goal._id, { isRecycled: true, deleteAt: Date.now() + 24 * 60 * 60 * 1000 });
//     res.status(200).json({ _id: goal._id, notification: "1 Goal And All Tasks Inside Deleted" });
//   } catch (err) {
//     console.error(err);
//     errorHandler(err, res);
//   }
// });

// router.post("/goal/:goalId/task", authenticateJWT, async (req, res) => {
//   try {
//     const goalId = req.params.goalId;
//     const goal = await Goal.findById(goalId);
//     if (!goal) {
//       return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
//     }
//     if (req.user.id !== goal.userId.toString()) {
//       return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });
//     }

//     const rewardPoints = generateReward(req.body);
//     const newTask = new Task({
//       goalId: goal._id,
//       task: req.body.task,
//       description: req.body.description,
//       targetDate: req?.body?.targetDate,
//       difficulty: req.body.difficulty,
//       rewardPoints: rewardPoints,
//     });
//     await newTask.save();

//     await Goal.findByIdAndUpdate(goal._id, {
//       $push: {
//         tasks: newTask._id,
//       },
//     });
//     const goalPopulated = await Goal.findById(goalId).populate("tasks").exec();

//     if (!goalPopulated) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
//     res.status(201).json({ ...goalPopulated.toObject(), notification: "1 Task Created" });
//   } catch (err) {
//     console.error(err);
//     errorHandler(err, res);
//   }
// });

// router.put("/goal/:goalId/task/:taskId", authenticateJWT, async (req, res) => {
//   try {
//     const goalId = req.params.goalId;
//     const goal = await Goal.findById(goalId);
//     if (!goal) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
//     if (req.user.id !== goal.userId.toString()) {
//       return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });
//     }

//     const taskId = req.params.taskId;
//     const task = await Task.findById(taskId);
//     if (!task) return res.status(404).json({ message: "Task Not Found", code: "TASK_NOT_FOUND" });
//     if (task.goalId.toString() !== goal._id.toString()) {
//       return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });
//     }
//     const body = req.body;

//     if (body.restore) {
//       await Task.findByIdAndUpdate(task._id, { isRecycled: false, deleteAt: null }, { new: true, runValidators: true });

//       const goalPopulated = await Goal.findById(goal._id).populate("tasks").exec();
//       if (!goalPopulated) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
//       return res.status(200).json({ ...goalPopulated.toObject(), notification: "1 Task Restored" });
//     }

//     let completedAt = null;
//     if (body?.isCompleted === true) {
//       completedAt = Date.now();
//     } else completedAt = null;
//     const rewardPoints = generateReward(req.body);
//     await Task.findByIdAndUpdate(task._id, {
//       task: body?.task,
//       description: body?.description,
//       isCompleted: body?.isCompleted,
//       targetDate: body?.targetDate,
//       difficulty: body?.difficulty,
//       completedAt: completedAt,
//       rewardPoints: rewardPoints,
//     });

//     const goalPopulated = await Goal.findById(goal._id).populate("tasks").exec();
//     if (!goalPopulated) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
//     res.status(200).json({ ...goalPopulated.toObject(), notification: "1 Task Updated" });
//   } catch (err) {
//     console.error(err);
//     errorHandler(err, res);
//   }
// });

// router.delete("/goal/:goalId/task/:taskId", authenticateJWT, async (req, res) => {
//   try {
//     const goalId = req.params.goalId;
//     const goal = await Goal.findById(goalId);
//     if (!goal) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
//     if (req.user.id !== goal.userId.toString()) {
//       return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });
//     }

//     const taskId = req.params.taskId;
//     const task = await Task.findById(taskId);
//     if (!task) return res.status(404).json({ message: "Task Not Found", code: "TASK_NOT_FOUND" });
//     if (task.goalId.toString() !== goal._id.toString()) {
//       return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });
//     }

//     await Task.findByIdAndUpdate(task._id, { isRecycled: true, deleteAt: Date.now() + 24 * 60 * 60 * 1000 });

//     const goalPopulated = await Goal.findById(goal._id).populate("tasks").exec();
//     if (!goalPopulated) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
//     res.status(200).json({ ...goalPopulated.toObject(), _id: task._id, notification: "1 Task Deleted" });
//   } catch (err) {
//     console.error(err);
//     errorHandler(err, res);
//   }
// });

// router.use("/ai", aiRouter);

// module.exports = router;
