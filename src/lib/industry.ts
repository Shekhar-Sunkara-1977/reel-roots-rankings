export const INDUSTRIES = [
  "Bollywood",
  "Tollywood",
  "Kollywood",
  "Mollywood",
  "Sandalwood",
  "Bengali",
  "Other",
] as const;

export type Industry = (typeof INDUSTRIES)[number];

export const INDUSTRY_SCRIPT: Record<Industry, string> = {
  Bollywood: "हिन्दी",
  Tollywood: "తెలుగు",
  Kollywood: "தமிழ்",
  Mollywood: "മലയാളം",
  Sandalwood: "ಕನ್ನಡ",
  Bengali: "বাংলা",
  Other: "भारत",
};

export const DECADES = [2020, 2010, 2000, 1990, 1980, 1970, 1960, 1950];

export const GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Romance",
  "Sport",
  "Thriller",
];

export function scoreLabel(score: number): string {
  if (score >= 9) return "All-timer";
  if (score >= 8) return "Blockbuster";
  if (score >= 7) return "Solid watch";
  if (score >= 5) return "Timepass";
  if (score >= 3) return "Weak";
  return "Disaster";
}
