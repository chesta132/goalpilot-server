import mongoose, { Document, isValidObjectId } from "mongoose";
import { IUserDocGoalsAndTasks, IUserDocument } from "../models/User";
import { IFriendDocument, IFriendRes } from "../models/Friend";

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
      let data = queryDT;
      try {
        data = queryDT.toObject();
      } catch {
        console.log(`Type of queryData ${queryDT.id} is ${typeof queryData}`);
      }
      return traverseCreateId(traverseAndSanitize(data));
    });
    return sanitizedData;
  }

  let data = queryData as Document<any, any, any>;
  try {
    data = queryData.toObject();
  } catch {
    console.log(`Type of queryData ${queryData.id} is ${typeof queryData}`);
  }
  const sanitizedData = traverseCreateId(traverseAndSanitize(data));
  return sanitizedData;
};

export const sanitizeUserQuery = <T extends Document<any, any, any>, Z extends Partial<IUserDocGoalsAndTasks>>(queryData: T | Z, isGuest = false) => {
  let data = queryData as Z;
  if (queryData._id instanceof mongoose.Types.ObjectId) {
    data = sanitizeQuery(queryData as T);
  }
  delete data.password;
  delete data.googleId;
  if (isGuest) {
    delete data.gmail;
    delete data.email;
    delete data.verified;
    delete data.createdAt;
    if (data.goals && data.goals.length > 0) data.goals = data.goals.filter((goal) => goal.isPublic);
  }
  return data;
};

export const sanitizeFriendQuery = <T extends Partial<IFriendDocument>>(queryData: T, ownerId: string): IFriendRes => {
  let data = queryData as T & IFriendRes;
  if (queryData._id instanceof mongoose.Types.ObjectId) data = sanitizeQuery(queryData as Document<any, any, any>);
  if ((data.userId1 as string) === ownerId) {
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
  return data as IFriendRes;
};

export const sanitizeFriendPopulatedUser = (data: Partial<IFriendDocument>[]) =>
  data?.map((friend) => {
    let data = friend;
    const extractData = (user: Partial<IUserDocument>) => ({
      id: user.id,
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      status: user.status,
      lastActive: user.lastActive,
    });
    for (const key in friend) {
      const value = friend[key as keyof IFriendDocument];
      if (!["userId1", "userId2"].includes(key)) {
        data[key as keyof IFriendDocument] = value;
        continue;
      }
      data[key as keyof IFriendDocument] = extractData(value);
    }
    return data;
  });
