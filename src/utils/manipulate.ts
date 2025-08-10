/**
 * Capitalizes the first letter of a word in a string.
 *
 * @param inputString - The original string.
 * @param [scissors] - The scissors to split words. If not provided, the first word after spaces will be capitalized.
 * @returns The string with the specified word capitalized.
 */
export const capitalEachWords = (inputString: string, scissors?: string) => {
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
export const capitalWord = (inputString: string, scissors?: string | number) => {
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

/**
 * Only pick some fields in object, other properties will deleted.
 *
 * @param data - Object to initiate.
 * @param picks - Keys of data to pick.
 * @returns The object with only picked properties.
 */
export const pick = <T extends Record<string, any>, Z extends (keyof T)[]>(data: T, picks?: Z): Pick<T, Z[number]> => {
  let pickedData = data.toObject ? { ...data.toObject() } : { ...data };
  if (picks)
    for (const pick of Object.keys(data)) {
      if (!picks.includes(pick as keyof Object)) {
        delete pickedData[pick as keyof Object];
      }
    }
  return pickedData;
};

/**
 * Only omit some fields in object, other properties will remain.
 *
 * @param data - Object to initiate.
 * @param omits - Keys of data to omit.
 * @returns The object with omitted properties.
 */
export const omit = <T extends Record<string, any>, Z extends (keyof T)[]>(data: T, omits?: Z): Omit<T, Z[number]> => {
  let omittedData = data.toObject ? { ...data.toObject() } : { ...data };
  if (omits)
    for (const omit of omits) {
      delete omittedData[omit];
    }
  return omittedData;
};
