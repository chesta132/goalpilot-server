import { Document, isValidObjectId } from "mongoose";
import { IUserDocGoalsAndTasks } from "../models/User";

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
      const data = queryDT.toObject();
      return traverseCreateId(traverseAndSanitize(data));
    });
    return sanitizedData;
  }

  const data = queryData.toObject();
  const sanitizedData = traverseCreateId(traverseAndSanitize(data));
  return sanitizedData;
};

export const sanitizeUserQuery = <T extends Document<any, any, any>, Z extends Partial<IUserDocGoalsAndTasks>>(queryData: T, isGuest = false) => {
  const data: Z = sanitizeQuery(queryData);
  delete data.password;
  delete data.googleId;
  if (isGuest) {
    delete data.email;
    if (data.goals && data.goals.length > 0) data.goals = data.goals.filter((goal) => goal.isPublic);
  }
  return data;
};
