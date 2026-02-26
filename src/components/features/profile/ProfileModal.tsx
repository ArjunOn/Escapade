"use client";

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { userProfile } = useAppStore();
    const { user } = useAuth();
    const [name, setName] = useState(userProfile?.name || '');
    const [bio, setBio] = useState(userProfile?.bio || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // In a real app, you would save to the backend
            // For now, just update local state
            setTimeout(() => {
                setIsSaving(false);
                onClose();
            }, 500);
        } catch (error) {
            console.error('Failed to save profile:', error);
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-full max-w-md glass border-slate-200 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900">My Profile</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        Update your personal information
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Email Display */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-900">Email (Read-only)</Label>
                        <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                            <p className="text-sm text-slate-600">{user?.email}</p>
                        </div>
                    </div>

                    {/* Name Input */}
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold text-slate-900">
                            Full Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Your name"
                            className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 h-10"
                        />
                    </div>

                    {/* Bio Input */}
                    <div className="space-y-2">
                        <Label htmlFor="bio" className="text-sm font-semibold text-slate-900">
                            Bio (Optional)
                        </Label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                            rows={4}
                        />
                    </div>

                    {/* Profile Stats */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                        <div className="text-center">
                            <p className="text-lg font-semibold text-primary">12</p>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Weekends Planned</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-primary">$450</p>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Spent</p>
                        </div>
                        <div className="text-center">
                            <p className="text-lg font-semibold text-primary">8</p>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Activities</p>
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
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
