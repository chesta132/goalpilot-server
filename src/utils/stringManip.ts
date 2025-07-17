/**
 * Capitalizes the first letter of a word in a string.
 *
 * @param inputString - The original string.
 * @param [scissors] - The scissors to split words. If not provided, the first word after spaces will be capitalized.
 * @returns The string with the specified word capitalized.
 */
const capitalEachWords = (inputString: string, scissors?: string) => {
  const lowerCaseString = inputString.toLowerCase().replaceAll(scissors ?? " ", " ");

  const words = lowerCaseString.split(" ");

  const capitalizedWords = words.map((word: string) => {
    if (word.length === 0) {
      return "";
    }
    const firstLetter = word.charAt(0).toUpperCase();
    const restOfWord = word.slice(1);
    return firstLetter + restOfWord;
  });

  const resultString = capitalizedWords.join(" ");

  return resultString;
};

/**
 * Capitalizes the first letter of a word in a string.
 *
 * @param inputString - The original string.
 * @param [scissors] - The word or index to capitalize. If not provided, the first word of the string will be capitalized.
 * @returns The string with the specified word capitalized.
 */
const capitalWord = (inputString: string, scissors?: string | number) => {
  let scissorsIndex: number | undefined;
  if (typeof scissors === "string") {
    const indexof = inputString.indexOf(scissors);
    if (indexof !== -1) scissorsIndex = indexof;
  } else if (typeof scissors === "number") scissorsIndex = scissors;

  const sliceString = inputString.slice(scissorsIndex);
  const sliceStringEarly = inputString.slice(0, scissorsIndex);

  const firstLetter = sliceString.charAt(0).toUpperCase();
  const restOfWord = inputString.slice(scissorsIndex ? scissorsIndex + 1 : 1);

  const resultString = scissorsIndex ? sliceStringEarly + firstLetter + restOfWord : firstLetter + restOfWord;

  return resultString;
};

export { capitalEachWords, capitalWord };
