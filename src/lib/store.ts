"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState, UserData, UserProfile, Activity, Expense, JournalEntry } from './types';

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

            // Authentication Actions
            signup: (profile: UserProfile) => {
                const accounts = { ...get().accounts };
                if (accounts[profile.email]) return; // Account exists

                const newUserContent: UserData = {
                    activities: [],
                    expenses: [],
                    journalEntries: [],
                    weeklySavingsGoal: 0,
                    userProfile: profile
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
                        activities: user.activities,
                        expenses: user.expenses,
                        journalEntries: user.journalEntries,
                        weeklySavingsGoal: user.weeklySavingsGoal,
                        userProfile: user.userProfile
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
                    userProfile: null
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
                    const nextActivities = state.activities.filter((a) => a.id !== id);
                    return {
                        activities: nextActivities,
                        accounts: {
                            ...state.accounts,
                            [email]: { ...state.accounts[email], activities: nextActivities }
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
                })),
        }),
        {
            name: 'escapade-v2-auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
