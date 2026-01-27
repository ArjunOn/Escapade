"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AppState, Activity, Expense, JournalEntry, UserProfile, Category } from './types';

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            activities: [],
            expenses: [],
            journalEntries: [],
            weeklySavingsGoal: 0,
            userProfile: null,

            addActivity: (activity: Activity) =>
                set((state) => ({
                    activities: [...state.activities, activity],
                })),

            removeActivity: (id: string) =>
                set((state) => ({
                    activities: state.activities.filter((a) => a.id !== id),
                })),

            toggleActivity: (id: string) =>
                set((state) => ({
                    activities: state.activities.map((a) =>
                        a.id === id ? { ...a, completed: !a.completed } : a
                    ),
                })),

            setWeeklySavingsGoal: (goal: number) =>
                set(() => ({ weeklySavingsGoal: goal })),

            updateUserProfile: (profile: Partial<UserProfile>) =>
                set((state) => ({
                    userProfile: state.userProfile
                        ? { ...state.userProfile, ...profile }
                        : (profile as UserProfile),
                })),

            addExpense: (expense: Omit<Expense, 'id'>) =>
                set((state) => ({
                    expenses: [
                        ...state.expenses,
                        { ...expense, id: crypto.randomUUID() },
                    ],
                })),

            removeExpense: (id: string) =>
                set((state) => ({
                    expenses: state.expenses.filter((e) => e.id !== id),
                })),

            editExpense: (id: string, updates: Partial<Expense>) =>
                set((state) => ({
                    expenses: state.expenses.map((e) =>
                        e.id === id ? { ...e, ...updates } : e
                    ),
                })),

            addJournalEntry: (entry: JournalEntry) =>
                set((state) => ({
                    journalEntries: [entry, ...state.journalEntries],
                })),

            resetStore: () =>
                set(() => ({
                    activities: [],
                    expenses: [],
                    journalEntries: [],
                    weeklySavingsGoal: 0,
                    userProfile: null,
                })),
        }),
        {
            name: 'escapade-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
