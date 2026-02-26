"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { validateSigninForm } from '@/lib/validation';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const router = useRouter();
    const { signIn, loading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setErrors({});

        // Validate form
        const validation = validateSigninForm(email, password);
        if (!validation.valid) {
            setErrors(validation.errors);
            return;
        }

        try {
            await signIn(email, password);
            onClose();
            // Wait for session to be established
            await new Promise(resolve => setTimeout(resolve, 500));
            // Use window.location for hard redirect
            window.location.href = '/dashboard';
        } catch (err: any) {
            setError(err.message || 'Failed to sign in');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-gray-200 shadow-xl overflow-hidden p-0 gap-0">
                <div className="p-8 pb-4 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-sm">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <DialogHeader className="space-y-2 text-center">
                        <DialogTitle className="text-3xl font-bold text-gray-900">Welcome Back</DialogTitle>
                        <DialogDescription className="text-gray-600">
                            Sign in to continue planning your weekends
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleLogin} className="p-8 pt-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="modal-email" className="text-sm font-semibold text-gray-700">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    id="modal-email"
                                    placeholder="you@example.com"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => {
                                        setEmail(e.target.value)
                                        setErrors({ ...errors, email: undefined })
                                    }}
                                    className={`pl-10 h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 ${errors.email ? 'border-red-300 bg-red-50' : ''}`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="modal-password" className="text-sm font-semibold text-gray-700">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    id="modal-password"
                                    type="password"
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={e => {
                                        setPassword(e.target.value)
                                        setErrors({ ...errors, password: undefined })
                                    }}
                                    className={`pl-10 h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 ${errors.password ? 'border-red-300 bg-red-50' : ''}`}
                                />
                            </div>
                            {errors.password && (
                                <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                            )}
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <Button 
                            type="submit"
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold text-base mt-4" 
                            disabled={loading}
                        >
                            {loading ? "Signing in..." : "Sign In"}
                        </Button>
                    </div>
                </form>

                <DialogFooter className="flex flex-col space-y-4 p-8 pt-4 border-t border-gray-200 bg-gray-50">
                    <p className="text-sm text-center text-gray-600">
                        New user?{' '}
                        <Link href="/signup" onClick={onClose} className="text-primary font-semibold hover:underline">
                            Sign up
                        </Link>
                    </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
