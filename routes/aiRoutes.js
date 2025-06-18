const express = require("express");
const router = express.Router();
const Goal = require("../models/Goal");
const Task = require("../models/Task");
const AiCache = require("../models/Ai_cache");
const { generateCrypto } = require("../utils/aiUtils");
const { errorHandler, generateReward } = require("../utils/utils");
const { GoogleGenAI, Type } = require("@google/genai");
require("dotenv").config();

router.post("/", async (req, res) => {
  try {
    const { goalId, query } = req.body;
    if (!goalId) return res.status(422).json({ message: "Goal ID is Required", code: "MISSING_FIELDS" });

    const goal = await Goal.findById(goalId);
    if (!goal) return res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
    if (req.user.id !== goal.userId.toString()) {
      return res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });
    }

    if (!query) return res.status(400).json({ message: "Query are required", code: "MISSING_FIELDS" });
    const queryHashed = generateCrypto(query);

    const aiCache = await AiCache.findOne({ queryHash: queryHashed });
    if (aiCache) {
      const newTaskData = aiCache.aiResponse.map((resp) => {
        const rewardPoints = generateReward(req.body);
        return {
          task: resp.task,
          description: resp.description,
          difficulty: resp.difficulty,
          goalId: goal._id,
          rewardPoints: rewardPoints,
        };
      });
      const newTask = await Task.insertMany(newTaskData);
      goal.tasks.push(...newTask.map((task) => task._id));
      await goal.save();
      const goalPopulated = await Goal.findById(goal._id).populate("tasks");
      return res.status(200).json({ ...goalPopulated.toObject(), notification: `${newTask.length} Tasks Created` });
    }

    const prevTasks = await Task.find({ goalId: goal._id }, "task description difficulty");
    const fPrevTasks = prevTasks.filter((task) => !task.isRecycled);
    const stringifyedPrevTasks = prevTasks.length > 0 && JSON.stringify(fPrevTasks);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `${req.body.query}. Please match the language of my query.${
        stringifyedPrevTasks ? `\nHere is my previous tasks\n${stringifyedPrevTasks}` : ""
      }`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              task: {
                type: Type.STRING,
                description: "A concise description of the task step, max 5-7 words.",
                maxLength: 30,
              },
              description: {
                type: Type.STRING,
                description: "A more detailed explanation of what needs to be done for this task step, max 30 words.",
                maxLength: 150,
              },
              difficulty: {
                type: Type.STRING,
                description: "Difficulty of the task.",
                enum: ["easy", "medium", "hard", "very hard"],
              },
            },
            required: ["task", "description", "difficulty"],
          },
        },
      },
    });

    const responseData = JSON.parse(response.text);
    const newTaskData = responseData.map((resp) => {
      const rewardPoints = generateReward(resp);
      return {
        task: resp.task,
        description: resp.description,
        difficulty: resp.difficulty,
        goalId: goal._id,
        rewardPoints: rewardPoints,
        targetDate: goal.targetDate,
      };
    });
    const newTask = await Task.insertMany(newTaskData);
    goal.tasks.push(...newTask.map((task) => task._id));
    await goal.save();
    const goalPopulated = await Goal.findById(goal._id).populate("tasks");
    const newAiCache = new AiCache({
      query: query,
      queryHash: queryHashed,
      aiResponse: responseData,
    });
    await newAiCache.save();

    res.status(200).json({ ...goalPopulated.toObject(), notification: `${newTask.length} Tasks Created` });
  } catch (err) {
    console.error(err);
    errorHandler(err, res);
  }
});

module.exports = router;
