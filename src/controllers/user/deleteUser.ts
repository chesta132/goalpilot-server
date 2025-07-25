import Goal, { IGoalDocTasks } from "../../models/Goal";
import Task from "../../models/Task";
import User, { IUserDocGoalsAndTasks } from "../../models/User";
import { Response, Request } from "express";
import handleError from "../../utils/handleError";
import { resInvalidOTP, resMissingFields, resUserNotFound } from "../../utils/resUtils";
import { findByIdAndSanitize, findOneAndSanitize } from "../../utils/mongooseUtils";
import Verification from "../../models/Verification";

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const { token } = req.body;

    const user = (await findByIdAndSanitize(User, userId, {
      populate: { path: "goals", populate: { path: "tasks" } },
    })) as IUserDocGoalsAndTasks | null;
    if (!user) {
      resUserNotFound(res);
      return;
    }
    if (token) {
      const otp = await findOneAndSanitize(Verification, { key: token, type: "DELETE_ACCOUNT_OTP", userId: user.id });
      if (!otp && user.verified) {
        resInvalidOTP(res);
        return;
      }
    }

    const goalsAndTasksId = user.goals.reduce(
      (acc: { goalsId: string[]; tasksId: string[] }, goal) => {
        acc.goalsId.push(goal.id);
        acc.tasksId.push(...goal.tasks.map((task) => task.id));
        return acc;
      },
      { goalsId: [], tasksId: [] }
    );

    await Task.deleteMany({ _id: { $in: goalsAndTasksId.tasksId } });
    await Goal.deleteMany({ _id: { $in: goalsAndTasksId.goalsId } });
    await User.findByIdAndDelete(user._id);

    res.redirect(`${process.env.CLIENT_URL_DEV}/signin`);
  } catch (err) {
    handleError(err, res);
  }
};
