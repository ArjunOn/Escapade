"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';

export default function LoginPage() {
    const router = useRouter();
    const { login, currentUserEmail } = useAppStore();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (currentUserEmail) {
            router.push('/');
        }
    }, [currentUserEmail, router]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        setTimeout(() => {
            const success = login(email, password);
            if (success) {
                router.push('/');
            } else {
                setError('Invalid credentials. Access denied.');
                setIsLoading(false);
            }
        }, 1000);
    };

    if (currentUserEmail) return null;

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 relative">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10"
            >
                <div className="flex justify-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                </div>

                <Card className="glass border-white/5 shadow-2xl overflow-hidden">
                    <CardHeader className="space-y-1 text-center pb-8 border-b border-white/5">
                        <CardTitle className="text-3xl font-serif italic tracking-tight text-white">Personnel Access</CardTitle>
                        <CardDescription className="text-white/40 font-medium">Verify credentials for Mission Control entry.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleLogin}>
                        <CardContent className="space-y-4 pt-8">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Email Address</Label>
                                <Input
                                    id="email"
                                    placeholder="commander@escapade.net"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Access Pin</Label>
                                <Input
                                    id="password"
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
                        </CardContent>
                    </form>
                    <CardFooter className="flex flex-col space-y-4 pb-8 border-t border-white/5 mt-4">
                        <div className="relative w-full text-center">
                            <span className="bg-transparent px-2 text-[10px] text-white/30 uppercase font-bold tracking-[0.3em]">Credentials Required</span>
                        </div>
                        <p className="text-xs text-center text-white/40">
                            New personnel?{' '}
                            <Link href="/signup" className="text-primary hover:text-primary/80 font-bold underline underline-offset-4">
                                Sign up
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
