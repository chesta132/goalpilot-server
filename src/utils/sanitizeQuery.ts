export default function sanitizeQuery(queryData: any, email = false) {
  let data = queryData.toObject();
  delete data.password;
  delete data.googleId;
  if (email) delete data.email;
  return data;
}
