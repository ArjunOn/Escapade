export type Category = 'Relaxation' | 'Social' | 'Outdoor' | 'Sports' | 'Events' | 'Traveling' | 'Other' | 'Budget';

export interface UserProfile {
  name: string;
  email?: string;
  preferences: string[]; // "Concerts", "Hiking", etc.
  vibes: string[]; // "High Energy", "Relaxation", etc.
  budgetTier: 'frugal' | 'moderate' | 'luxury';
  location: string;
  onboardingCompleted: boolean;
}

export interface Activity {
  id: string;
  title: string;
  description?: string;
  category: Category;
  startTime: string; // HH:mm
  date: string; // ISO Date String (YYYY-MM-DD)
  cost: number;
  completed: boolean;
  location?: string;
  matched?: boolean; // New: Matched for You badge
}

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string;
  description?: string;
}

export interface Budget {
  total: number;
  spent: number;
  allocations: Record<Category, number>;
}

export interface JournalEntry {
  id: string;
  date: string;
  mood: 'Happy' | 'Neutral' | 'Sad' | 'Excited' | 'Tired';
  text: string;
  tags: string[];
}

export interface AppState {
  activities: Activity[];
  expenses: Expense[];
  journalEntries: JournalEntry[];
  weeklySavingsGoal: number;
  userProfile: UserProfile | null;

  // Actions
  addActivity: (activity: Activity) => void;
  removeActivity: (id: string) => void;
  toggleActivity: (id: string) => void;

  setWeeklySavingsGoal: (goal: number) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;

  addExpense: (expense: Omit<Expense, 'id'>) => void;
  removeExpense: (id: string) => void;
  editExpense: (id: string, updates: Partial<Expense>) => void;

  addJournalEntry: (entry: JournalEntry) => void;
  resetStore: () => void;
}
