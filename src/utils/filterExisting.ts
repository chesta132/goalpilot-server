import { IGoalDocTasks, IGoalDocument } from "../models/Goal";
import { ITaskDocument } from "../models/Task";

export const existingGoals = (goals: IGoalDocument[]): IGoalDocument[] => {
  return goals.filter((goal) => !goal.isRecycled);
};

export const existingTasks = (tasks: ITaskDocument[]): ITaskDocument[] => {
  return tasks.filter((task) => !task.isRecycled);
};

export const existingGoalsAndTasks = (goals: IGoalDocTasks[]): IGoalDocument[] => {
  return existingGoals(goals).map((goal) => ({ ...goal, tasks: existingTasks(goal.tasks as ITaskDocument[]) } as IGoalDocument));
};
