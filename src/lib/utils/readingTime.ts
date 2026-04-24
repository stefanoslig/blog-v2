// Estimate reading time in minutes for a piece of markdown/text content.
// Returns an integer minute count (minimum 1).
const WORDS_PER_SECOND = 275 / 60;
const IMAGE_PENALTY_WORDS = 4;     // rough word-equivalent cost per image
const IMAGE_BASE_SECONDS = 12;

const readingTime = (content: string): number => {
  let images = 0;
  const wordRegex = /\w/;

  const words = content.split(/\s+/).filter((word) => {
    if (word.includes("<img")) images += 1;
    return wordRegex.test(word);
  }).length;

  // Subtract a rough word-cost for each image, add a diminishing time-cost for image perusal.
  const imageAdjust = images * IMAGE_PENALTY_WORDS;
  let imageSeconds = 0;
  let perImage = IMAGE_BASE_SECONDS;
  for (let i = 0; i < images; i += 1) {
    imageSeconds += perImage;
    if (perImage > 3) perImage -= 1;
  }

  const wordsForReading = Math.max(0, words - imageAdjust);
  const seconds = wordsForReading / WORDS_PER_SECOND + imageSeconds;
  const minutes = Math.ceil(seconds / 60);

  return Math.max(1, minutes);
};

export default readingTime;
