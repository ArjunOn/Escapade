/**
 * data.ts — legacy stub
 * MOCK_EVENTS have been replaced by real events from the ExternalEvent DB table.
 * This file exists only for backward-compatibility with any remaining imports.
 * Use /api/events to get real events.
 */
import type { Category } from "./types";

export interface DiscoveryEvent {
  id: string;
  title: string;
  category: Category;
  icon: string;
  cost: number;
  vibes: string[];
  tags: string[];
  location: string;
  time: string;
  date: string;
}

/** @deprecated — use /api/events instead */
export const MOCK_EVENTS: DiscoveryEvent[] = [];
