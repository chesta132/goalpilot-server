export const isJSON = (item: any) => {
  try {
    JSON.parse(item);
    return true;
  } catch {
    return false;
  }
};

JSON.isJSON = isJSON;
