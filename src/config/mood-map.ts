/**
 * src/config/mood-map.ts
 */

export interface Mood {
  id: string;
  label: string;
  emoji: string;
  description: string;
  genreIds: number[];
  color: string;
}

export const MOODS: Mood[] = [
  {
    id: "feel-good",
    label: "Feel Good",
    emoji: "😊",
    description: "Laughter and heartwarming stories",
    genreIds: [35, 10751], // Comedy, Family
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: "thrill-me",
    label: "Thrill Me",
    emoji: "🔥",
    description: "Adrenaline and high-stakes action",
    genreIds: [28, 53], // Action, Thriller
    color: "from-red-500 to-purple-600",
  },
  {
    id: "mind-bending",
    label: "Mind-Bending",
    emoji: "🧠",
    description: "Mystery and deep sci-fi concepts",
    genreIds: [9648, 878], // Mystery, Sci-Fi
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: "emotional",
    label: "Emotional",
    emoji: "😭",
    description: "Powerful dramas and romance",
    genreIds: [18, 10749], // Drama, Romance
    color: "from-pink-500 to-rose-600",
  },
  {
    id: "popcorn-night",
    label: "Popcorn Night",
    emoji: "🍿",
    description: "Box office hits and adventure",
    genreIds: [12, 14], // Adventure, Fantasy
    color: "from-green-400 to-teal-500",
  },
];
