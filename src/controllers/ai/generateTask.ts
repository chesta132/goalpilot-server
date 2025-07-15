import { Response, Request } from "express";
import { createAndSanitize, findAndSanitize, findOneAndSanitize, insertManyAndSanitize } from "../../utils/mongooseUtils";
import Goal from "../../models/Goal";
import crypto from "crypto";
import AiCache from "../../models/AiCache";
import { generateReward } from "../../utils/levelingUtils";
import Task, { ITaskDocument } from "../../models/Task";
import { GoogleGenAI, Type } from "@google/genai";
import handleError from "../../utils/handleError";
import { sanitizeQuery } from "../../utils/sanitizeQuery";

export const generateTask = async (req: Request, res: Response) => {
  try {
    const { goalId, query } = req.body;
    if (!goalId) {
      res.status(422).json({ message: "Goal ID is Required", code: "MISSING_FIELDS" });
      return;
    }

    const goal = await Goal.findById(goalId).populate("tasks");
    if (!goal) {
      res.status(404).json({ message: "Goal Not Found", code: "GOAL_NOT_FOUND" });
      return;
    }
    if (req.user!.id !== goal.userId.toString()) {
      res.status(401).json({ message: "Authentication Needed", code: "INVALID_AUTH" });
      return;
    }

    if (!query) {
      res.status(400).json({ message: "Query are required", code: "MISSING_FIELDS" });
      return;
    }
    const queryHashed = crypto.createHash("sha256").update(query.toLowerCase().trim()).digest("hex");

    const aiCache = await findOneAndSanitize(AiCache, { queryHash: queryHashed });
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
      const newTask = await insertManyAndSanitize(Task, newTaskData);
      goal.tasks.push(...newTask.map((task) => task.id));
      await goal.save();
      const goalPopulated = { ...sanitizeQuery(goal), tasks: sanitizeQuery([...newTask, ...goal.tasks] as ITaskDocument[]) };
      res.status(200).json({ ...goalPopulated, notification: `${newTask.length} tasks created` });
      return;
    }

    const prevTasks = await findAndSanitize(Task, { goalId: goal.id }, { project: { task: 1, description: 1, difficulty: 1, _id: 0 } });
    const fPrevTasks = prevTasks && prevTasks.filter((task) => !task.isRecycled);
    const stringifyedPrevTasks = prevTasks && prevTasks.length > 0 && JSON.stringify(fPrevTasks);

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Please match the language of my query.\nQuery: ${req.body.query}.${
        stringifyedPrevTasks ? `\nPrevious tasks: \n${stringifyedPrevTasks}` : ""
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
                description: "A concise description of the task step, max 50 characters.",
                maxLength: 50,
              },
              description: {
                type: Type.STRING,
                description: "A more detailed explanation of what needs to be done for this task step, max 1000 characters.",
                maxLength: 1000,
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

    const responseData = JSON.parse(response.text || "[]");
    const newTaskData = responseData.map((resp: any) => {
      const rewardPoints = generateReward(resp);
      return {
        task: resp.task,
        description: resp.description,
        difficulty: resp.difficulty,
        goalId: goal.id,
        rewardPoints,
        targetDate: goal.targetDate,
      };
    });
    const newTask = await insertManyAndSanitize(Task, newTaskData);
    goal.tasks.push(...newTask.map((task) => task.id));
    await goal.save();
    await createAndSanitize(AiCache, {
      query,
      queryHash: queryHashed,
      aiResponse: responseData,
    });

    const goalPopulated = { ...sanitizeQuery(goal), tasks: sanitizeQuery([...newTask, ...goal.tasks] as ITaskDocument[]) };
    res.status(200).json({ ...goalPopulated, notification: `${newTask.length} tasks created` });
  } catch (err) {
    handleError(err, res);
  }
};
