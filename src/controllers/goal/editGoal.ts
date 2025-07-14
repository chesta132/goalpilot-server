import Goal, { IGoal, IGoalDocument } from "../../models/Goal";
import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { sanitizeQuery } from "../../utils/sanitizeQuery";
import { resGoalNotFound, resInvalidAuth, resMissingFields } from "../../utils/resUtils";
import { updateByIdAndSanitize } from "../../utils/mongooseUtils";

export const editGoal = async (req: Request, res: Response) => {
  try {
    const user = req.user as Express.User;
    const { goalId, color, title, description, targetDate, progress, status, isPublic }: IGoal & { goalId: string } = req.body;
    if (!goalId) {
      resMissingFields(res, "Goal id");
      return;
    }

    const rawGoal = await Goal.findById(goalId);
    if (!rawGoal) {
      resGoalNotFound(res);
      return;
    }
    const goal = sanitizeQuery(rawGoal) as IGoalDocument;

    if (user.id !== goal.userId) {
      resInvalidAuth(res);
      return;
    }

    let completedAt;
    if (status === "completed" && goal.completedAt === null) {
      completedAt = new Date(Date.now());
    }

    const updatedGoal = await updateByIdAndSanitize(
      Goal,
      goal.id,
      {
        title,
        description,
        targetDate,
        progress,
        status,
        isPublic,
        color,
        completedAt,
      },
      { options: { new: true, runValidators: true }, populate: { path: "tasks" } }
    );
    if (!updatedGoal) {
      resGoalNotFound(res);
      return;
    }

    res.status(200).json({ ...updatedGoal, notification: `${updatedGoal!.title} updated` });
  } catch (err) {
    handleError(err, res);
  }
};
