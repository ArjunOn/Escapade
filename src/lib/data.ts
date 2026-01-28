import { Category } from './types';

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

export const MOCK_EVENTS: DiscoveryEvent[] = [
    { id: '1', title: 'Jazz in the Park', category: 'Events', icon: '🎷', cost: 20, vibes: ['Culture', 'Relaxation'], tags: ['Jazz', 'Live Music', 'Concerts'], location: 'Central Park', time: '19:00', date: '2024-05-24' },
    { id: '2', title: 'Morning Yoga', category: 'Relaxation', icon: '🧘', cost: 0, vibes: ['Relaxation', 'Wellness'], tags: ['Yoga', 'Wellness', 'Morning'], location: 'Studio B', time: '08:00', date: '2024-05-25' },
    { id: '3', title: 'Beach Volleyball', category: 'Sports', icon: '🏐', cost: 0, vibes: ['Sports', 'Social'], tags: ['Sports', 'Social', 'Beach'], location: 'North Beach', time: '10:00', date: '2024-05-25' },
    { id: '4', title: 'Arcade Night', category: 'Social', icon: '🕹️', cost: 15, vibes: ['Social'], tags: ['Gaming', 'Fun', 'Nightlife'], location: 'Retro Games', time: '20:00', date: '2024-05-24' },
    { id: '5', title: 'Gourmet Food Tour', category: 'Social', icon: 'Social', cost: 45, vibes: ['Social'], tags: ['Fine Dining', 'Cooking', 'Nightlife'], location: 'Downtown', time: '12:00', date: '2024-05-25' },
    { id: '6', title: 'Mountain Hike', category: 'Outdoor', icon: '🥾', cost: 0, vibes: ['Outdoor'], tags: ['Hiking', 'Nature', 'Photography'], location: 'Eagle Peak', time: '07:00', date: '2024-05-26' },
];
