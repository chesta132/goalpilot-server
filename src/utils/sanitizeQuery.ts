export default function sanitizeQuery(queryData: any, email = false) {
  let data = queryData.toObject();
  if (data._id) data._id = data._id!.toString();
  if (data.id) data.id = data.id!.toString();
  delete data.password;
  delete data.googleId;
  if (email) delete data.email;
  return data;
}
