export const RATING_LABELS: Record<number, string> = {
  1: "খুব খারাপ",
  2: "প্রত্যাশার নিচে",
  3: "মোটামুটি",
  4: "ভালো",
  5: "অসাধারণ",
};

export type RatingBreakdown = {
  sampleSize: number;
  verifiedCount: number;
  counts: Record<1 | 2 | 3 | 4 | 5, number>;
  percentages: Record<1 | 2 | 3 | 4 | 5, number>;
};

export function buildRatingBreakdown(
  reviews: Array<{ rating: number; verified?: boolean }>,
): RatingBreakdown {
  const counts: RatingBreakdown["counts"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let verifiedCount = 0;

  for (const review of reviews) {
    const rating = Math.round(review.rating);
    if (rating < 1 || rating > 5) continue;
    counts[rating as keyof typeof counts] += 1;
    if (review.verified === true) verifiedCount += 1;
  }

  const sampleSize = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const percentages: RatingBreakdown["percentages"] = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const rating of [1, 2, 3, 4, 5] as const) {
    percentages[rating] = sampleSize > 0 ? Math.round((counts[rating] / sampleSize) * 100) : 0;
  }

  return { sampleSize, verifiedCount, counts, percentages };
}
