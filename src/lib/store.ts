"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState, UserData, UserProfile, Activity, Expense, JournalEntry, AvailabilityWindow } from './types';

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Global Session State
            currentUserEmail: null,
            accounts: {},

            // Computed/Active State
            activities: [],
            expenses: [],
            journalEntries: [],
            weeklySavingsGoal: 0,
            userProfile: null,
            history: [],
            initializedEventIds: [],
            availabilityWindows: [],
            savedEventIds: [],

            // Authentication Actions
            signup: (profile: UserProfile) => {
                const accounts = { ...get().accounts };
                if (accounts[profile.email]) return; // Account exists

                const newUserContent: UserData = {
                    activities: [],
                    expenses: [],
                    journalEntries: [],
                    weeklySavingsGoal: 0,
                    userProfile: profile,
                    history: [],
                    initializedEventIds: [],
                    availabilityWindows: [],
                    savedEventIds: [],
                };

                set((state) => ({
                    accounts: { ...state.accounts, [profile.email]: newUserContent },
                    currentUserEmail: profile.email,
                    ...newUserContent // Set active state to new user
                }));
            },

            login: (email: string, password: string) => {
                const accounts = get().accounts;
                const user = accounts[email];

                if (user && user.userProfile.password === password) {
                    set({
                        currentUserEmail: email,
                        activities: user.activities || [],
                        expenses: user.expenses || [],
                        journalEntries: user.journalEntries || [],
                        weeklySavingsGoal: user.weeklySavingsGoal || 0,
                        userProfile: user.userProfile,
                        history: user.history || [],
                        initializedEventIds: user.initializedEventIds || [],
                        availabilityWindows: user.availabilityWindows || [],
                        savedEventIds: user.savedEventIds || [],
                    });
                    return true;
                }
                return false;
            },

            logout: () => {
                set({
                    currentUserEmail: null,
                    activities: [],
                    expenses: [],
                    journalEntries: [],
                    weeklySavingsGoal: 0,
                    userProfile: null,
                    history: [],
                    initializedEventIds: [],
                    availabilityWindows: [],
                    savedEventIds: [],
                });
            },

            setAuthUser: (email: string, username?: string | null) => {
                if (!email) return;

                const accounts = get().accounts;
                const existing = accounts[email];

                if (!existing) {
                    const safeName = username?.trim() || email.split('@')[0] || 'Explorer';
                    const newProfile: UserProfile = {
                        name: safeName,
                        email,
                        password: undefined,
                        preferences: [],
                        vibes: [],
                        budgetTier: 'moderate',
                        location: '',
                        onboardingCompleted: false
                    };

                    const newUserContent: UserData = {
                        activities: [],
                        expenses: [],
                        journalEntries: [],
                        weeklySavingsGoal: 0,
                        userProfile: newProfile,
                        history: [],
                        initializedEventIds: [],
                        availabilityWindows: [],
                        savedEventIds: [],
                    };

                    set((state) => ({
                        accounts: { ...state.accounts, [email]: newUserContent },
                        currentUserEmail: email,
                        ...newUserContent
                    }));
                    return;
                }

                set({
                    currentUserEmail: email,
                    activities: existing.activities || [],
                    expenses: existing.expenses || [],
                    journalEntries: existing.journalEntries || [],
                    weeklySavingsGoal: existing.weeklySavingsGoal || 0,
                    userProfile: existing.userProfile,
                    history: existing.history || [],
                    initializedEventIds: existing.initializedEventIds || [],
                    availabilityWindows: existing.availabilityWindows || [],
                    savedEventIds: existing.savedEventIds || [],
                });
            },

            // Data Actions (These update both active state AND the account record)
            addActivity: (activity: Activity) => {
                const email = get().currentUserEmail;
                if (!email) return;

                set((state) => {
                    const nextActivities = [...state.activities, activity];
                    return {
                        activities: nextActivities,
                        accounts: {
                            ...state.accounts,
                            [email]: { ...state.accounts[email], activities: nextActivities }
                        }
                    };
                });
            },

            removeActivity: (id: string) => {
                const email = get().currentUserEmail;
                if (!email) return;

                set((state) => {
                    const activityToRemove = state.activities.find(a => a.id === id);
                    if (!activityToRemove) return state;

                    const nextActivities = state.activities.filter((a) => a.id !== id);

                    // Revert Discovery Status
                    const nextIds = activityToRemove.originalEventId
                        ? state.initializedEventIds.filter(eid => eid !== activityToRemove.originalEventId)
                        : state.initializedEventIds;

                    // Revert Budget
                    const nextExpenses = activityToRemove.expenseId
                        ? state.expenses.filter(exp => exp.id !== activityToRemove.expenseId)
                        : state.expenses;

                    return {
                        activities: nextActivities,
                        expenses: nextExpenses,
                        initializedEventIds: nextIds,
                        accounts: {
                            ...state.accounts,
                            [email]: {
                                ...state.accounts[email],
                                activities: nextActivities,
                                expenses: nextExpenses,
                                initializedEventIds: nextIds
                            }
                        }
                    };
                });
            },

            toggleActivity: (id: string) => {
                const email = get().currentUserEmail;
                if (!email) return;

                set((state) => {
                    const nextActivities = state.activities.map((a) =>
                        a.id === id ? { ...a, completed: !a.completed } : a
                    );
                    return {
                        activities: nextActivities,
                        accounts: {
                            ...state.accounts,
                            [email]: { ...state.accounts[email], activities: nextActivities }
                        }
                    };
                });
            },

            setWeeklySavingsGoal: (goal: number) => {
                const email = get().currentUserEmail;
                if (!email) return;

                set((state) => ({
                    weeklySavingsGoal: goal,
                    accounts: {
                        ...state.accounts,
                        [email]: { ...state.accounts[email], weeklySavingsGoal: goal }
                    }
                }));
            },

            updateUserProfile: (profile: Partial<UserProfile>) => {
                const email = get().currentUserEmail;
                if (!email) return;

                set((state) => {
                    const nextProfile = { ...state.userProfile!, ...profile };
                    return {
                        userProfile: nextProfile,
                        accounts: {
                            ...state.accounts,
                            [email]: { ...state.accounts[email], userProfile: nextProfile }
                        }
                    };
                });
            },

            addExpense: (expense: Omit<Expense, 'id'>) => {
                const email = get().currentUserEmail;
                if (!email) return;

                set((state) => {
                    const nextExpenses = [...state.expenses, { ...expense, id: crypto.randomUUID() }];
                    return {
                        expenses: nextExpenses,
                        accounts: {
                            ...state.accounts,
                            [email]: { ...state.accounts[email], expenses: nextExpenses }
                        }
                    };
                });
            },

            removeExpense: (id: string) => {
                const email = get().currentUserEmail;
                if (!email) return;

                set((state) => {
                    const nextExpenses = state.expenses.filter((e) => e.id !== id);
                    return {
                        expenses: nextExpenses,
                        accounts: {
                            ...state.accounts,
                            [email]: { ...state.accounts[email], expenses: nextExpenses }
                        }
                    };
                });
            },

            editExpense: (id: string, updates: Partial<Expense>) => {
                const email = get().currentUserEmail;
                if (!email) return;

                set((state) => {
                    const nextExpenses = state.expenses.map((e) =>
                        e.id === id ? { ...e, ...updates } : e
                    );
                    return {
                        expenses: nextExpenses,
                        accounts: {
                            ...state.accounts,
                            [email]: { ...state.accounts[email], expenses: nextExpenses }
                        }
                    };
                });
            },

            addJournalEntry: (entry: JournalEntry) => {
                const email = get().currentUserEmail;
                if (!email) return;

                set((state) => {
                    const nextEntries = [entry, ...state.journalEntries];
                    return {
                        journalEntries: nextEntries,
                        accounts: {
                            ...state.accounts,
                            [email]: { ...state.accounts[email], journalEntries: nextEntries }
                        }
                    };
                });
            },

            resetStore: () =>
                set(() => ({
                    currentUserEmail: null,
                    accounts: {},
                    activities: [],
                    expenses: [],
                    journalEntries: [],
                    weeklySavingsGoal: 0,
                    userProfile: null,
                    history: [],
                    initializedEventIds: [],
                    availabilityWindows: [],
                    savedEventIds: [],
                })),

            initializeEvent: (event) => {
                const email = get().currentUserEmail;
                if (!email) return;

                const expenseId = event.cost > 0 ? crypto.randomUUID() : undefined;
                const activity: Activity = {
                    id: crypto.randomUUID(),
                    title: event.title,
                    category: event.category,
                    date: event.date,
                    startTime: event.time,
                    cost: event.cost,
                    completed: false,
                    location: event.location,
                    matched: true,
                    originalEventId: event.id,
                    expenseId
                };

                get().addActivity(activity);

                if (expenseId) {
                    const expense: Expense = {
                        id: expenseId,
                        amount: event.cost,
                        description: `Mission: ${event.title}`,
                        category: event.category,
                        date: new Date().toISOString()
                    };

                    set((state) => {
                        const nextExpenses = [...state.expenses, expense];
                        return {
                            expenses: nextExpenses,
                            accounts: {
                                ...state.accounts,
                                [email]: { ...state.accounts[email], expenses: nextExpenses }
                            }
                        };
                    });
                }

                set((state) => {
                    const nextIds = [...(state.initializedEventIds || []), event.id];
                    return {
                        initializedEventIds: nextIds,
                        accounts: {
                            ...state.accounts,
                            [email]: { ...state.accounts[email], initializedEventIds: nextIds }
                        }
                    };
                });
            },

            completeMission: () => {
                const email = get().currentUserEmail;
                if (!email) return;

                const state = get();
                const totalSpent = state.expenses.reduce((s, e) => s + e.amount, 0);
                const mission = {
                    id: crypto.randomUUID(),
                    weekLabel: `Week of ${new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`,
                    totalSpent,
                    savingsGoal: state.weeklySavingsGoal,
                    activitiesCount: state.activities.length,
                    date: new Date().toISOString()
                };

                const nextHistory = [mission, ...(state.history || [])];

                set((state) => ({
                    history: nextHistory,
                    activities: [],
                    expenses: [],
                    journalEntries: [],
                    initializedEventIds: [],
                    accounts: {
                        ...state.accounts,
                        [email]: {
                            ...state.accounts[email],
                            history: nextHistory,
                            activities: [],
                            expenses: [],
                            journalEntries: [],
                            initializedEventIds: []
                        }
                    }
                }));
            },

            syncStore: () => {
                const email = get().currentUserEmail;
                if (!email) return;

                set((state) => {
                    const activeOriginalIds = state.activities.map(a => a.originalEventId).filter(Boolean) as string[];
                    const nextIds = state.initializedEventIds.filter(id => activeOriginalIds.includes(id));
                    const activeMissionTitles = state.activities.map(a => a.title);
                    const nextExpenses = state.expenses.filter(exp => {
                        if (exp.description?.startsWith('Mission: ')) {
                            const missionTitle = exp.description.replace('Mission: ', '');
                            return activeMissionTitles.includes(missionTitle);
                        }
                        return true;
                    });

                    return {
                        initializedEventIds: nextIds,
                        expenses: nextExpenses,
                        accounts: {
                            ...state.accounts,
                            [email]: {
                                ...state.accounts[email],
                                initializedEventIds: nextIds,
                                expenses: nextExpenses
                            }
                        }
                    };
                });
            },

            setAvailabilityWindows: (windows: AvailabilityWindow[]) => {
                const email = get().currentUserEmail;
                if (!email) return;
                set((state) => ({
                    availabilityWindows: windows,
                    accounts: {
                        ...state.accounts,
                        [email]: { ...state.accounts[email], availabilityWindows: windows }
                    }
                }));
            },

            addAvailabilityWindow: (window: AvailabilityWindow) => {
                const email = get().currentUserEmail;
                if (!email) return;
                set((state) => {
                    const next = [...state.availabilityWindows, window];
                    return {
                        availabilityWindows: next,
                        accounts: {
                            ...state.accounts,
                            [email]: { ...state.accounts[email], availabilityWindows: next }
                        }
                    };
                });
            },

            removeAvailabilityWindow: (id: string) => {
                const email = get().currentUserEmail;
                if (!email) return;
                set((state) => {
                    const next = state.availabilityWindows.filter(w => w.id !== id);
                    return {
                        availabilityWindows: next,
                        accounts: {
                            ...state.accounts,
                            [email]: { ...state.accounts[email], availabilityWindows: next }
                        }
                    };
                });
            },

            toggleSavedEvent: (eventId: string) => {
                const email = get().currentUserEmail;
                if (!email) return;
                set((state) => {
                    const current = state.savedEventIds || [];
                    const next = current.includes(eventId)
                        ? current.filter(id => id !== eventId)
                        : [...current, eventId];
                    return {
                        savedEventIds: next,
                        accounts: {
                            ...state.accounts,
                            [email]: { ...state.accounts[email], savedEventIds: next }
                        }
                    };
                });
            },
        }),
        {
            name: 'escapade-v2-auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
