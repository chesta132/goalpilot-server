import mongoose, { Document, isValidObjectId } from "mongoose";
import { IUserDocGoals, IUserDocGoalsAndTasks, IUserDocument } from "../models/User";
import { IFriendDocument, IFriendRes } from "../models/Friend";
import { omit } from "./manipulate";
import { SanitizedData } from "../types/types";
import { IGoalDocTasks } from "../models/Goal";

export const traverseAndSanitize = (data: any, mongo = true): any => {
  if (mongo && !data?._id && !Array.isArray(data)) {
    return data;
  }

  if (!mongo && (data === null || typeof data !== "object" || data instanceof Date)) {
    return data;
  }

  if (isValidObjectId(data)) {
    return data.toString();
  }

  if (Array.isArray(data)) {
    return data.map((item) => traverseAndSanitize(item));
  }

  const sanitizedObject: { [key: string]: any } = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      sanitizedObject[key] = traverseAndSanitize(data[key]);
    }
  }

  return sanitizedObject;
};

export const traverseCreateId = (data: any, mongo = true): any => {
  if (mongo && !data?._id && !Array.isArray(data)) {
    return data;
  }

  if (!mongo && (data === null || typeof data !== "object" || data instanceof Date)) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => traverseCreateId(item));
  }

  for (const key in data) {
    data[key] = traverseCreateId(data[key]);
  }

  if (data?._id) return { id: data._id, ...data };
};

export const sanitizeQuery = <T extends Document<any, any, any> | Document<any, any, any>[]>(queryData: T) => {
  if (Array.isArray(queryData)) {
    const sanitizedData = queryData.map((queryDT) => {
      let data = omit(queryDT, ["__v"]);
      if (queryDT.toObject) {
        data = queryDT.toObject();
      }
      return traverseCreateId(traverseAndSanitize(data));
    });
    return sanitizedData as SanitizedData<T>[];
  }

  let data = omit(queryData as Document<any, any, any>, ["__v"]);
  if (queryData.toObject) {
    data = queryData.toObject();
  }
  const sanitizedData = traverseCreateId(traverseAndSanitize(data));
  return sanitizedData as SanitizedData<T>;
};

export const sanitizeUserQuery = <T extends Partial<IUserDocGoalsAndTasks> | Partial<IUserDocument> | Partial<IUserDocGoals>>(
  queryData: T,
  options?: { isGuest?: boolean }
) => {
  let data = omit(queryData, ["__v", "password", "googleId"]);
  if (queryData._id instanceof mongoose.Types.ObjectId) {
    data = sanitizeQuery(data as Document<any, any, any>) as Omit<T, "__v" | "password" | "googleId">;
  }
  if (options?.isGuest) {
    delete data.gmail;
    delete data.email;
    delete data.verified;
    delete data.createdAt;
    if (data.goals && data.goals.length > 0 && !isValidObjectId(data.goals[0]))
      data.goals = (data.goals as IGoalDocTasks[]).filter((goal) => goal.isPublic);
  }
  return data as SanitizedData<T>;
};

export const sanitizeFriendQuery = <T extends Partial<IFriendDocument>>(queryData: T, ownerId: string): IFriendRes => {
  let data = omit(queryData, ["__v"]) as T & IFriendRes;
  if (queryData._id instanceof mongoose.Types.ObjectId) data = sanitizeQuery(queryData as Document<any, any, any>) as T & IFriendRes;
  if (((data.userId1 as Partial<IUserDocument>)?.id || data.userId1) === ownerId) {
    data.user = data.userId1 as string;
    data.friend = data.userId2 as string;
    delete data.userId1;
    delete data.userId2;
  } else {
    data.user = data.userId2 as string;
    data.friend = data.userId1 as string;
    delete data.userId1;
    delete data.userId2;
  }
  return data as SanitizedData<IFriendRes>;
};
