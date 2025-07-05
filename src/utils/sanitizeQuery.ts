import { Document, isValidObjectId } from "mongoose";

export const traverseAndSanitize = (data: any): any => {
  if (data === null || typeof data !== "object") {
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

export const traverseCreateId = (data: any): any => {
  if (data === null || typeof data !== "object") {
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

export const sanitizeQuery = <T extends Document<any, any, any>>(queryData: T) => {
  const data = queryData.toObject();
  const sanitizedData = traverseCreateId(traverseAndSanitize(data));
  return sanitizedData;
};

export const sanitizeUserQuery = <T extends Document<any, any, any>>(queryData: T, email = false) => {
  const data = sanitizeQuery(queryData);
  delete data.password;
  delete data.googleId;
  if (email) delete data.email;
  return data;
};
