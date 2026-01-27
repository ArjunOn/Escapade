"use client";

import { BudgetTracker } from '@/components/features/budget/BudgetTracker';
import { motion } from 'framer-motion';

export default function BudgetPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <BudgetTracker />
        </motion.div>
    );
}
