import { Request, Response } from "express";
import handleError from "../../utils/handleError";
import { resMissingFields, resUserNotFound } from "../../utils/resUtils";
import { findAndSanitize, findByIdAndSanitize } from "../../utils/mongooseUtils";
import User, { IUserDocGoalsAndTasks, TUser } from "../../models/User";
import { omit } from "../../utils/manipulate";
import { ErrorResponse, SanitizedData, SearchType } from "../../types/types";

export const buildPagination = (data: any[], limit = 31, offset = 0) => {
  const isNext = data.length >= limit - 1;
  const nextOffset = isNext ? offset + limit : null;
  return { isNext, nextOffset };
};

export const search = async (req: Request, res: Response) => {
  try {
    const { id: userId } = req.user!;
    const { query, offset, type } = req.query;
    if (!query || !type) {
      resMissingFields(res, "Query, Type");
      return;
    }
    const limit = 2;
    const skip = parseInt(offset?.toString() || "0");
    const userProject = {
      gmail: 0,
      email: 0,
      verified: 0,
      createdAt: 0,
      timeToAllowSendEmail: 0,
      goalsCompleted: 0,
      tasksCompleted: 0,
      password: 0,
      googleId: 0,
      role: 0,
    } as Record<Partial<keyof TUser>, 0>;

    const user = (await findByIdAndSanitize(User, userId, {
      populate: { path: "goals", populate: "tasks" },
      project: userProject,
    })) as SanitizedData<IUserDocGoalsAndTasks>;
    if (!user) {
      resUserNotFound(res);
      return;
    }

    const goals = user.goals;
    const tasks = goals.flatMap((goal) => goal.tasks);
    goals.map((goal) => (goal.tasks = []));

    const regexQuery = new RegExp(query.toString());
    const filteredGoals = goals.filter((goal) => regexQuery.test(goal.title));
    const filteredTasks = tasks.filter((task) => regexQuery.test(task.task));

    const getProfiles = async () => {
      const profileFound = (await findAndSanitize(
        User,
        { $or: [{ username: { $regex: query, $options: "i" } }, { fullName: { $regex: query, $options: "i" } }] },
        {
          returnArray: true,
          options: { limit, skip },
          project: userProject,
          populate: { path: "goals", populate: "tasks" },
        }
      )) as IUserDocGoalsAndTasks[];
      const sanitizedProfile = profileFound?.map((profil) => omit(profil, ["goals"]));
      return { profileFound, sanitizedProfile };
    };

    const formattedType = type.toString().toUpperCase() as SearchType;

    type ProfileTemplate = {
      profile: Omit<IUserDocGoalsAndTasks, "goals">[];
      isNext: boolean;
      nextOffset: number | null;
    };
    const resHandler = {
      ALL: async (profileTemplate: ProfileTemplate) => res.json({ ...profileTemplate, goals: filteredGoals, tasks: filteredTasks }),
      PROFILES: async (profileTemplate: ProfileTemplate) => res.json(profileTemplate),
      PROFILES_GOALS: async (profileTemplate: ProfileTemplate) => res.json({ ...profileTemplate, goals: filteredGoals }),
      PROFILES_TASKS: async (profileTemplate: ProfileTemplate) => res.json({ ...profileTemplate, tasks: filteredTasks }),
      GOALS_TASKS: () => res.json({ goals: filteredGoals, tasks: filteredTasks }),
      GOALS: () => res.json({ goals: filteredGoals }),
      TASKS: () => res.json({ tasks: filteredTasks }),
    };

    if (resHandler[formattedType]) {
      if (formattedType.includes("PROFILES") || formattedType === "ALL") {
        const { profileFound, sanitizedProfile } = await getProfiles();
        const buildedProfilePage = buildPagination(profileFound, limit, skip);
        const profileTemplate = { ...buildedProfilePage, profile: sanitizedProfile };
        resHandler[formattedType](profileTemplate);
      } else {
        resHandler[formattedType as "GOALS" | "GOALS_TASKS" | "TASKS"]();
      }
    } else {
      res.status(406).json({ message: "Invalid type please send a valid type", code: "INVALID_SEARCH_TYPE" } as ErrorResponse);
    }
  } catch (err) {
    handleError(err, res);
  }
};
