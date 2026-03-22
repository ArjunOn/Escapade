export type Category = 'Relaxation' | 'Social' | 'Outdoor' | 'Sports' | 'Events' | 'Traveling' | 'Other' | 'Budget';

export interface AvailabilityWindow {
  id: string;
  dayOfWeek: number;   // 0=Sun … 6=Sat
  startHour: number;   // 0–23
  endHour: number;     // 0–23
  label?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  password?: string; // Stored locally for simulation
  preferences: string[];
  vibes: string[];
  budgetTier: 'frugal' | 'moderate' | 'luxury';
  location: string;
  bio?: string; // Optional user bio
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
  originalEventId?: string; // ID of the source discovery event
  expenseId?: string; // ID of the associated expense
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

export interface MissionHistory {
  id: string;
  weekLabel: string; // e.g., "Week of May 20"
  totalSpent: number;
  savingsGoal: number;
  activitiesCount: number;
  date: string; // ISO Date for sorting
}

export interface UserData {
  activities: Activity[];
  expenses: Expense[];
  journalEntries: JournalEntry[];
  weeklySavingsGoal: number;
  userProfile: UserProfile;
  history: MissionHistory[];
  initializedEventIds: string[];
  availabilityWindows: AvailabilityWindow[];
}

export interface AppState {
  // Global Session State
  currentUserEmail: string | null;
  accounts: Record<string, UserData>;

  // Computed/Active State
  activities: Activity[];
  expenses: Expense[];
  journalEntries: JournalEntry[];
  weeklySavingsGoal: number;
  userProfile: UserProfile | null;
  history: MissionHistory[];
  initializedEventIds: string[];
  availabilityWindows: AvailabilityWindow[];

  // Actions
  signup: (profile: UserProfile) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  setAuthUser: (email: string, username?: string | null) => void;

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

  initializeEvent: (event: { title: string, category: Category, cost: number, date: string, time: string, location: string, id: string }) => void;
  completeMission: () => void;
  syncStore: () => void;

  // Availability
  setAvailabilityWindows: (windows: AvailabilityWindow[]) => void;
  addAvailabilityWindow: (window: AvailabilityWindow) => void;
  removeAvailabilityWindow: (id: string) => void;
}
