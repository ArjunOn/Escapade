"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, ArrowRight, Github } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SignupPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate loading then redirect to onboarding
        setTimeout(() => {
            router.push('/onboarding');
        }, 1500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 relative">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md z-10"
            >
                <div className="flex justify-center mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Zap className="w-6 h-6 text-white" />
                    </div>
                </div>

                <Card className="glass border-white/5 shadow-2xl overflow-hidden">
                    <CardHeader className="space-y-1 text-center pb-8 border-b border-white/5">
                        <CardTitle className="text-3xl font-serif italic tracking-tight text-white">Join the Escapade</CardTitle>
                        <CardDescription className="text-white/40 font-medium">Create your credentials to begin the journey.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSignup}>
                        <CardContent className="space-y-4 pt-8">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Full Name</Label>
                                <Input id="name" placeholder="John Doe" type="text" required className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Email Address</Label>
                                <Input id="email" placeholder="name@example.com" type="email" required className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-white/60 font-bold uppercase tracking-widest text-[10px]">Security Pin</Label>
                                <Input id="password" type="password" required className="bg-white/5 border-white/10 text-white h-11" />
                            </div>
                            <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest text-xs mt-4" disabled={isLoading}>
                                {isLoading ? "Synchronizing..." : "Create Account"}
                                {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                            </Button>
                        </CardContent>
                    </form>
                    <CardFooter className="flex flex-col space-y-4 pb-8 border-t border-white/5 mt-4">
                        <div className="relative w-full text-center">
                            <span className="bg-transparent px-2 text-[10px] text-white/30 uppercase font-bold tracking-[0.3em]">Access Restricted</span>
                        </div>
                        <p className="text-xs text-center text-white/40">
                            Already a member?{' '}
                            <Link href="/login" className="text-primary hover:text-primary/80 font-bold underline underline-offset-4">
                                Log in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
