"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const router = useRouter();
    const login = useAppStore(state => state.login);
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        setTimeout(() => {
            const success = login(email, password);
            if (success) {
                onClose();
                router.push('/');
            } else {
                setError('Invalid credentials. Access denied.');
                setIsLoading(false);
            }
        }, 1000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md glass border-white/5 shadow-2xl overflow-hidden p-0 gap-0 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <div className="p-8 pb-4 flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-6">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <DialogHeader className="space-y-1 text-center">
                        <DialogTitle className="text-3xl font-serif italic tracking-tight text-white">Personnel Access</DialogTitle>
                        <DialogDescription className="text-white/40 font-medium">Verify credentials for Mission Control entry.</DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleLogin} className="p-8 pt-4">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="modal-email" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Email Address</Label>
                            <Input
                                id="modal-email"
                                placeholder="commander@escapade.net"
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="modal-password" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Access Pin</Label>
                            <Input
                                id="modal-password"
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="bg-white/5 border-white/10 text-white h-11"
                            />
                        </div>

                        {error && (
                            <p className="text-[10px] font-bold uppercase text-red-400 tracking-widest text-center">{error}</p>
                        )}

                        <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-xs mt-4" disabled={isLoading}>
                            {isLoading ? "Authenticating..." : "Establish Uplink"}
                            {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                        </Button>
                    </div>
                </form>

                <DialogFooter className="flex flex-col space-y-4 p-8 pt-4 border-t border-white/5 bg-white/5">
                    <div className="relative w-full text-center">
                        <span className="bg-transparent px-2 text-[10px] text-white/30 uppercase font-bold tracking-[0.3em]">Credentials Required</span>
                    </div>
                    <p className="text-xs text-center text-white/40">
                        New personnel?{' '}
                        <Link href="/signup" onClick={onClose} className="text-primary hover:text-primary/80 font-bold underline underline-offset-4">
                            Sign up
                        </Link>
                    </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
