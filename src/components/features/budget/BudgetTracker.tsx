"use client";

import { useState, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    Tooltip, Legend
} from 'recharts';
import {
    Trash2, Edit2, Plus, Wallet,
    TrendingUp, ArrowDownRight, Tag,
    Save, X, Check, Rocket, Target
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Category, Expense } from '@/lib/types';

export function BudgetTracker({ compact = false }: { compact?: boolean }) {
    const { expenses, weeklySavingsGoal, addExpense, removeExpense, editExpense, setWeeklySavingsGoal, history } = useAppStore();

    // Form state
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [category, setCategory] = useState<Category>('Social');

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editAmount, setEditAmount] = useState('');
    const [editDesc, setEditDesc] = useState('');

    // Goal edit state
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [goalInput, setGoalInput] = useState(weeklySavingsGoal.toString());

    const totalSpent = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
    const remainingFund = Math.max(weeklySavingsGoal - totalSpent, 0);

    const chartData = [
        { name: 'Spent', value: totalSpent, color: '#f87171' }, // Red-ish
        { name: 'Escapade Fund', value: remainingFund, color: '#60a5fa' }, // Blue
    ];

    const categoryDataBase = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
    }, {} as Record<string, number>);

    const categoryData = Object.entries(categoryDataBase).map(([name, value]) => ({ name, value }));

    const handleAdd = () => {
        const val = parseFloat(amount);
        if (!isNaN(val) && val > 0) {
            addExpense({
                amount: val,
                description: desc,
                category,
                date: new Date().toISOString()
            });
            setAmount('');
            setDesc('');
        }
    };

    const startEditing = (exp: Expense) => {
        setEditingId(exp.id);
        setEditAmount(exp.amount.toString());
        setEditDesc(exp.description || '');
    };

    const saveEdit = (id: string) => {
        const val = parseFloat(editAmount);
        if (!isNaN(val)) {
            editExpense(id, { amount: val, description: editDesc });
            setEditingId(null);
        }
    };

    const saveGoal = () => {
        const val = parseFloat(goalInput);
        if (!isNaN(val)) {
            setWeeklySavingsGoal(val);
            setIsEditingGoal(false);
        }
    };

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-serif italic text-white tracking-tight">Logistics Overview</h2>
                    <p className="text-white/40 text-sm font-medium">Tracking intelligence on all financial outbound packages.</p>
                </div>
                <div className="flex bg-white/5 border border-white/5 rounded-2xl p-4 gap-6 items-center">
                    <div className="text-center group relative cursor-pointer" onClick={() => !isEditingGoal && setIsEditingGoal(true)}>
                        <div className="text-[10px] uppercase font-bold text-white/40 mb-1 flex items-center gap-1 justify-center">
                            Weekly Goal
                            {!isEditingGoal && <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </div>
                        {isEditingGoal ? (
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={goalInput}
                                    onChange={(e) => setGoalInput(e.target.value)}
                                    className="h-8 w-24 bg-white/10 border-white/20 text-white text-lg font-bold p-1 text-center"
                                    autoFocus
                                    onBlur={saveGoal}
                                    onKeyDown={(e) => e.key === 'Enter' && saveGoal()}
                                />
                                <Button size="icon" variant="ghost" className="h-6 w-6 text-emerald-400" onClick={saveGoal}>
                                    <Check className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="text-xl font-bold text-white">${weeklySavingsGoal}</div>
                        )}
                    </div>
                    <div className="w-px bg-white/10 h-10" />
                    <div className="text-center">
                        <div className="text-[10px] uppercase font-bold text-white/40 mb-1">Spent</div>
                        <div className="text-xl font-bold text-white">${totalSpent.toFixed(0)}</div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Analytics */}
                <Card className="glass border-white/5 flex flex-col items-center justify-center min-h-[400px]">
                    <CardHeader className="w-full text-center pb-0">
                        <CardTitle className="text-lg font-serif italic text-white/60">Fund Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="w-full h-full p-8 pt-0">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-8">
                            {chartData.map((item) => (
                                <div key={item.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Logistics Input */}
                <Card className="glass border-white/5">
                    <CardHeader>
                        <CardTitle className="text-xl font-serif italic text-white">Log New Expense</CardTitle>
                        <CardDescription className="text-white/40">Enter outbound logistics details for synchronization.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Amount ($)</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="bg-white/5 border-white/10 text-white"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Classification</Label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value as any)}
                                    className="w-full h-10 rounded-md bg-white/5 border border-white/10 text-white text-xs px-3 outline-none"
                                >
                                    {['Social', 'Relaxation', 'Outdoor', 'Sports', 'Events', 'Traveling', 'Other'].map(c => (
                                        <option key={c} value={c} className="bg-slate-900">{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold tracking-widest text-white/40">Description</Label>
                            <Input
                                placeholder="Package details..."
                                value={desc}
                                onChange={e => setDesc(e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <Button onClick={handleAdd} className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl uppercase tracking-widest font-bold text-xs mt-4">
                            <Plus className="w-4 h-4 mr-2" /> Sync Expense
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Logistics Ledger */}
            <Card className="glass border-white/5 overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/5 px-8 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-serif italic text-white">Internal Ledger</CardTitle>
                        <CardDescription className="text-white/40">Historical log of all validated financial operations.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-white/5">
                        <AnimatePresence>
                            {expenses.length > 0 ? expenses.map((exp) => (
                                <motion.div
                                    key={exp.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="p-6 flex items-center justify-between group hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center",
                                            exp.category === 'Relaxation' ? 'bg-[#60a5fa]/20 text-[#60a5fa]' :
                                                exp.category === 'Social' ? 'bg-[#34d399]/20 text-[#34d399]' :
                                                    exp.category === 'Outdoor' ? 'bg-[#facc15]/20 text-[#facc15]' :
                                                        exp.category === 'Sports' ? 'bg-[#f87171]/20 text-[#f87171]' :
                                                            'bg-[#fb923c]/20 text-[#fb923c]'
                                        )}>
                                            <Tag className="w-5 h-5" />
                                        </div>
                                        {editingId === exp.id ? (
                                            <div className="flex flex-col gap-2">
                                                <Input
                                                    value={editDesc}
                                                    onChange={e => setEditDesc(e.target.value)}
                                                    className="bg-white/5 border-white/10 text-white h-8 text-sm"
                                                />
                                                <Input
                                                    type="number"
                                                    value={editAmount}
                                                    onChange={e => setEditAmount(e.target.value)}
                                                    className="bg-white/5 border-white/10 text-white h-8 text-sm w-32"
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <div className="font-bold text-white group-hover:text-primary transition-colors">{exp.description || 'Logistics Package'}</div>
                                                <div className="text-xs text-white/30 uppercase font-bold tracking-widest">{exp.category} • {new Date(exp.date).toLocaleDateString()}</div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-xl font-bold text-white">${exp.amount}</div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {editingId === exp.id ? (
                                                <>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10" onClick={() => saveEdit(exp.id)}>
                                                        <Save className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10" onClick={() => setEditingId(null)}>
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10" onClick={() => startEditing(exp)}>
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400/60 hover:text-red-400 hover:bg-red-400/10" onClick={() => removeExpense(exp.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="p-12 text-center text-white/20 italic">No historical ledger found. Synchronize logistics to populate records.</div>
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>
            </Card>
            {/* Mission History */}
            {history && history.length > 0 && (
                <div className="space-y-6 pt-12 border-t border-white/5">
                    <div className="space-y-1">
                        <h3 className="text-2xl font-serif italic text-white tracking-tight">Mission Archive</h3>
                        <p className="text-white/40 text-sm font-medium">Post-operation analysis of previous deployment windows.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {history.map((mission) => (
                            <Card key={mission.id} className="glass border-white/5 hover:border-primary/20 transition-all group">
                                <CardHeader className="p-6 pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg font-serif italic text-white group-hover:text-primary transition-colors">
                                            {mission.weekLabel}
                                        </CardTitle>
                                        <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
                                            {new Date(mission.date).getFullYear()}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-6 pt-0 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-[8px] uppercase font-bold tracking-widest text-white/40 mb-1">Total Spent</div>
                                            <div className="text-xl font-bold text-white">${mission.totalSpent}</div>
                                        </div>
                                        <div>
                                            <div className="text-[8px] uppercase font-bold tracking-widest text-white/40 mb-1">Savings Goal</div>
                                            <div className="text-xl font-bold text-white">${mission.savingsGoal}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                            <Rocket className="w-3 h-3 text-primary" /> {mission.activitiesCount} Missions
                                        </div>
                                        <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${mission.totalSpent <= mission.savingsGoal ? 'text-emerald-400' : 'text-red-400'
                                            }`}>
                                            <Target className="w-3 h-3" />
                                            {mission.totalSpent <= mission.savingsGoal ? 'Clearance' : 'Overrun'}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
