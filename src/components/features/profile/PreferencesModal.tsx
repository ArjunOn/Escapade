"use client";

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface PreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const VIBES = ['Relaxing', 'Social', 'Adventurous', 'Creative', 'Wellness', 'Spontaneous'];
const INTERESTS = ['Sports', 'Arts', 'Outdoors', 'Food', 'Music', 'Travel', 'Gaming', 'Learning'];
const BUDGET_LEVELS = ['Under $50', '$50-$100', '$100-$200', '$200+'];

export function PreferencesModal({ isOpen, onClose }: PreferencesModalProps) {
    const { userProfile } = useAppStore();
    const [selectedVibes, setSelectedVibes] = useState(userProfile?.vibes || []);
    const [selectedInterests, setSelectedInterests] = useState(userProfile?.preferences || []);
    const [budgetLevel, setBudgetLevel] = useState('$100-$200');
    const [isSaving, setIsSaving] = useState(false);

    const toggleVibe = (vibe: string) => {
        setSelectedVibes(prev =>
            prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]
        );
    };

    const toggleInterest = (interest: string) => {
        setSelectedInterests(prev =>
            prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // In a real app, you would save to the backend
            setTimeout(() => {
                setIsSaving(false);
                onClose();
            }, 500);
        } catch (error) {
            console.error('Failed to save preferences:', error);
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-md glass border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900">Preferences</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Customize your weekend experience
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Vibes Section */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-900">Preferred Vibes</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {VIBES.map((vibe) => (
                                <button
                                    key={vibe}
                                    onClick={() => toggleVibe(vibe)}
                                    className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                                        selectedVibes.includes(vibe)
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    {vibe}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Interests Section */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-900">Interests</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {INTERESTS.map((interest) => (
                                <button
                                    key={interest}
                                    onClick={() => toggleInterest(interest)}
                                    className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all text-left ${
                                        selectedInterests.includes(interest)
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Budget Level */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-900">Typical Budget</Label>
                        <div className="grid grid-cols-2 gap-3">
                            {BUDGET_LEVELS.map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setBudgetLevel(level)}
                                    className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                                        budgetLevel === level
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="space-y-3 pt-4 border-t border-slate-200">
                        <Label className="text-sm font-semibold text-slate-900">Notifications</Label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-primary" />
                                <span className="text-sm text-slate-600">Weekly activity suggestions</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-primary" />
                                <span className="text-sm text-slate-600">Weekend reminders</span>
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" className="w-4 h-4 rounded accent-primary" />
                                <span className="text-sm text-slate-600">Budget alerts</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 bg-primary hover:bg-primary/90 text-white"
                    >
                        {isSaving ? 'Saving...' : 'Save Preferences'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
