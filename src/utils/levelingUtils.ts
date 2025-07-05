export const generateReward = (data: any) => {
  switch (data.difficulty) {
    case "easy":
      return 200;
    case "medium":
      return 350;
    case "hard":
      return 500;
    case "very hard":
      return 800;
    default:
      return 200;
  }
};