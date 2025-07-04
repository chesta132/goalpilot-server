export default function sanitizeQuery(queryData: any, email = false) {
  let data = queryData.toObject();
  data._id = data._id!.toString();
  data.id = data.id!.toString();
  delete data.password;
  delete data.googleId;
  if (email) delete data.email;
  return data;
}
