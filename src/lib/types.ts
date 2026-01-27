export type Category = 'Relaxation' | 'Social' | 'Outdoor' | 'Sports' | 'Events' | 'Traveling' | 'Other' | 'Budget';

export interface UserProfile {
  name: string;
  email: string;
  password?: string; // Stored locally for simulation
  preferences: string[];
  vibes: string[];
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

export interface UserData {
  activities: Activity[];
  expenses: Expense[];
  journalEntries: JournalEntry[];
  weeklySavingsGoal: number;
  userProfile: UserProfile;
}

export interface AppState {
  // Global Session State
  currentUserEmail: string | null;
  accounts: Record<string, UserData>; // Keyed by email

  // Computed/Active State (mirrors current user data for accessibility)
  activities: Activity[];
  expenses: Expense[];
  journalEntries: JournalEntry[];
  weeklySavingsGoal: number;
  userProfile: UserProfile | null;

  // Actions
  signup: (profile: UserProfile) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;

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
