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
    const { query, offset, type, recycled } = req.query;
    if (!query || !type || !recycled) {
      resMissingFields(res, "Query, Type, Recycled");
      return;
    }
    const limit = 30;
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
    const userPopulate = {
      path: "goals",
      match: { isRecycled: JSON.parse(recycled.toString()) },
      options: { sort: { _id: -1 } },
      populate: { path: "tasks", match: { isRecycled: JSON.parse(recycled.toString()) }, options: { sort: { _id: -1 } } },
    };

    const user = (await findByIdAndSanitize(User, userId, {
      populate: userPopulate,
      project: userProject,
    })) as SanitizedData<IUserDocGoalsAndTasks>;
    if (!user) {
      resUserNotFound(res);
      return;
    }

    const goals = user.goals;
    const tasks = goals.flatMap((goal) => goal.tasks);
    goals.map((goal) => (goal.tasks = []));

    const regexQuery = new RegExp(query.toString(), "i");
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
          populate: userPopulate,
        }
      )) as IUserDocGoalsAndTasks[];
      const sanitizedProfile = profileFound?.map((profil) => omit(profil, ["goals"]));
      return { profileFound, sanitizedProfile };
    };

    const formattedType = type.toString().toUpperCase() as SearchType;

    type ProfileTemplate = {
      profiles: Omit<IUserDocGoalsAndTasks, "goals">[];
      isNext: boolean;
      nextOffset: number | null;
    };

    let dataToReturn = {} as Record<string, any>;
    const termsHandler = {
      ALL: (profileTemplate: ProfileTemplate) => (dataToReturn = { ...profileTemplate, goals: filteredGoals, tasks: filteredTasks }),
      PROFILES: (profileTemplate: ProfileTemplate) => (dataToReturn = profileTemplate),
      GOALS: () => (dataToReturn.goals = filteredGoals),
      TASKS: () => (dataToReturn.tasks = filteredTasks),
    };

    if (formattedType.split("_").some((type) => !Object.keys(termsHandler).includes(type))) {
      res.status(406).json({
        message: "Invalid filter please send a valid type of filter",
        code: "INVALID_SEARCH_TYPE",
        details: `${type} is not a valid type`,
        title: "Invalid filter",
      } as ErrorResponse);
      return;
    }

    for (const [key, value] of Object.entries(termsHandler)) {
      if (formattedType.split("_").includes(key)) {
        const { profileFound, sanitizedProfile } = await getProfiles();
        const buildedProfilePage = buildPagination(profileFound, limit, skip);
        const profileTemplate = { ...buildedProfilePage, profiles: sanitizedProfile };
        value(profileTemplate);
        if (key === "ALL") break;
      }
    }
    res.json(dataToReturn);
    return;
  } catch (err) {
    handleError(err, res);
  }
};
