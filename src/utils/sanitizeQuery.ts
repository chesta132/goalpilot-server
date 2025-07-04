import { Document } from "mongoose";

export const sanitizeQuery = <T extends Document<any, any, any>>(queryData: T) => {
  const data = queryData.toObject();
  const refId: string[] = ["_id"];

  if (data?.userId) refId.push("userId");
  if (data?.goalId) refId.push("goalId");
  if (data?.taskId) refId.push("taskId");

  refId.map((id) => (data[id] = data[id].toString()));

  return { ...data, id: data._id };
};

export const sanitizeUserQuery = <T extends Document<any, any, any>>(queryData: T, email = false) => {
  let data = sanitizeQuery(queryData);
  delete data.password;
  delete data.googleId;
  if (email) delete data.email;
  return data;
};
