export interface WellbeingQuote {
  id: number;
  quote: string;
  author: string;
  category: 'Mindfulness' | 'Inner Peace' | 'Resilience' | 'Self-Care' | 'Emotional Balance';
  tagline: string;
  bgImage: string;
}

export const WELLBEING_QUOTES: WellbeingQuote[] = [
  {
    id: 1,
    quote: "You don't have to control your thoughts. You just have to stop letting them control you.",
    author: "Dan Millman",
    category: "Mindfulness",
    tagline: "Breathe in clarity, release anxiety",
    bgImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1600&q=80"
  },
  {
    id: 2,
    quote: "Peace comes from within. Do not seek it without.",
    author: "Buddha",
    category: "Inner Peace",
    tagline: "Find your calm sanctuary inside",
    bgImage: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1600&q=80"
  },
  {
    id: 3,
    quote: "Out of your vulnerabilities will come your strength.",
    author: "Sigmund Freud",
    category: "Resilience",
    tagline: "Every quiet step forward matters",
    bgImage: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1600&q=80"
  },
  {
    id: 4,
    quote: "Nurturing yourself is not a luxury. It is a necessity for your soul.",
    author: "Mindmitra Wellness",
    category: "Self-Care",
    tagline: "Honor your mind and give yourself grace",
    bgImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1600&q=80"
  },
  {
    id: 5,
    quote: "Feelings are just visitors, let them come and go.",
    author: "Thich Nhat Hanh",
    category: "Emotional Balance",
    tagline: "Observe without judgment",
    bgImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80"
  }
];

export const DAILY_AFFIRMATIONS = [
  "I am worthy of peace, joy, and emotional equilibrium.",
  "My feelings are valid, and I choose to respond with kindness to myself.",
  "I take things one moment at a time. I am doing the best I can.",
  "Rest is productive. My mental health is my highest priority."
];
