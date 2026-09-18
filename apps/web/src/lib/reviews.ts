export interface Review {
  id: string;
  rating: number; // 1 to 5
  title?: string;
  comment: string;
  author: string;
  date: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingCounts: Record<1 | 2 | 3 | 4 | 5, number>;
  ratingPercentages: Record<1 | 2 | 3 | 4 | 5, number>;
}

export function parseManualReviews(manualMarkdown: string, productSlug?: string): Review[] {
  if (!manualMarkdown) {
    return [];
  }

  // Find the ## Reviews section
  const reviewsHeaderMatch = manualMarkdown.match(/^##\s+Reviews\s*$/m);
  if (!reviewsHeaderMatch || reviewsHeaderMatch.index === undefined) {
    return [];
  }

  const startIndex = reviewsHeaderMatch.index + reviewsHeaderMatch[0].length;
  const remaining = manualMarkdown.slice(startIndex);
  const nextHeaderMatch = remaining.match(/\n##\s+/);
  const reviewsContent =
    nextHeaderMatch && nextHeaderMatch.index !== undefined
      ? remaining.slice(0, nextHeaderMatch.index)
      : remaining;

  const reviews: Review[] = [];
  const entryRegex = /(?:^|\n)\s*(?:\d+\)|\d+\.)\s*([\s\S]*?)(?=(?:\n\s*(?:\d+\)|\d+\.)|$))/g;

  let match: RegExpExecArray | null;
  while ((match = entryRegex.exec(reviewsContent)) !== null) {
    const entryText = match[1].trim();
    if (!entryText) continue;

    const ratingMatch = entryText.match(/\*?\*?Rating:?\*?\*?:?\s*(\d+(?:\.\d+)?)\*?/i);
    const reviewMatch = entryText.match(/\*?\*?Review:?\*?\*?:?\s*([\s\S]*)/i);

    if (ratingMatch && reviewMatch) {
      const rawRating = parseFloat(ratingMatch[1]);
      const rating = Math.min(5, Math.max(1, Math.round(rawRating)));
      const comment = reviewMatch[1].trim();

      reviews.push({
        id: `${productSlug || 'review'}-manual-${reviews.length + 1}`,
        rating,
        comment,
        author: 'Verified Buyer',
        date: '2024-01-01',
      });
    }
  }

  return reviews;
}

export function calculateReviewStats(reviews: Review[]): ReviewStats {
  const totalReviews = reviews.length;
  const ratingCounts: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  if (totalReviews === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingCounts,
      ratingPercentages: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  let ratingSum = 0;
  for (const review of reviews) {
    const clampedRating = Math.min(5, Math.max(1, Math.round(review.rating))) as 1 | 2 | 3 | 4 | 5;
    ratingCounts[clampedRating] = (ratingCounts[clampedRating] || 0) + 1;
    ratingSum += review.rating;
  }

  const averageRating = Math.round((ratingSum / totalReviews) * 10) / 10;

  const ratingPercentages: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: Math.round((ratingCounts[1] / totalReviews) * 100),
    2: Math.round((ratingCounts[2] / totalReviews) * 100),
    3: Math.round((ratingCounts[3] / totalReviews) * 100),
    4: Math.round((ratingCounts[4] / totalReviews) * 100),
    5: Math.round((ratingCounts[5] / totalReviews) * 100),
  };

  return {
    averageRating,
    totalReviews,
    ratingCounts,
    ratingPercentages,
  };
}

export type ReviewSortOption = "recent" | "highest" | "lowest";

export interface ReviewFilterOptions {
  searchQuery?: string;
  starRating?: number | null;
  verifiedOnly?: boolean;
  sortBy?: ReviewSortOption;
}

export function filterAndSortReviews(
  reviews: Review[],
  options: ReviewFilterOptions
): Review[] {
  const { searchQuery, starRating, verifiedOnly, sortBy = "recent" } = options;
  const trimmedQuery = searchQuery ? searchQuery.trim().toLowerCase() : "";

  const filtered = reviews.filter((review) => {
    if (trimmedQuery.length > 0) {
      const commentMatch = review.comment.toLowerCase().includes(trimmedQuery);
      const titleMatch = review.title
        ? review.title.toLowerCase().includes(trimmedQuery)
        : false;
      const authorMatch = review.author.toLowerCase().includes(trimmedQuery);
      if (!commentMatch && !titleMatch && !authorMatch) {
        return false;
      }
    }

    if (starRating !== null && starRating !== undefined) {
      if (review.rating !== starRating) {
        return false;
      }
    }

    if (verifiedOnly) {
      if (!review.author.toLowerCase().includes("verified")) {
        return false;
      }
    }

    return true;
  });

  const compareDateDesc = (a: Review, b: Review) =>
    new Date(b.date).getTime() - new Date(a.date).getTime();

  return filtered.slice().sort((a, b) => {
    if (sortBy === "highest") {
      if (b.rating !== a.rating) {
        return b.rating - a.rating;
      }
      return compareDateDesc(a, b);
    }
    if (sortBy === "lowest") {
      if (a.rating !== b.rating) {
        return a.rating - b.rating;
      }
      return compareDateDesc(a, b);
    }
    // "recent" or default
    return compareDateDesc(a, b);
  });
}
