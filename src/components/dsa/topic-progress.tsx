"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";

interface Problem {
  topic: string;
  difficulty: string;
}

interface TopicProgressProps {
  problems: Problem[];
}

interface TopicGoal {
  name: string;
  aliases: string[];
  target: number;
  colorClass: string;
  bgGradient: string;
}

const TOPIC_GOALS: TopicGoal[] = [
  { name: "Arrays", aliases: ["arrays", "array"], target: 30, colorClass: "bg-blue-500", bgGradient: "from-blue-500 to-indigo-500" },
  { name: "Strings", aliases: ["strings", "string"], target: 25, colorClass: "bg-cyan-500", bgGradient: "from-cyan-500 to-blue-500" },
  { name: "HashMap", aliases: ["hashmap", "hash map", "hashing", "hash-table", "hashtable"], target: 20, colorClass: "bg-emerald-500", bgGradient: "from-emerald-500 to-teal-500" },
  { name: "Linked List", aliases: ["linked list", "linkedlist", "lists"], target: 20, colorClass: "bg-teal-500", bgGradient: "from-teal-500 to-emerald-500" },
  { name: "Stack", aliases: ["stack", "stacks"], target: 15, colorClass: "bg-indigo-500", bgGradient: "from-indigo-500 to-violet-500" },
  { name: "Queue", aliases: ["queue", "queues", "deque"], target: 15, colorClass: "bg-violet-500", bgGradient: "from-violet-500 to-purple-500" },
  { name: "Tree", aliases: ["tree", "trees", "binary tree", "binary-tree"], target: 25, colorClass: "bg-purple-500", bgGradient: "from-purple-500 to-fuchsia-500" },
  { name: "BST", aliases: ["bst", "binary search tree"], target: 15, colorClass: "bg-fuchsia-500", bgGradient: "from-fuchsia-500 to-pink-500" },
  { name: "Heap", aliases: ["heap", "heaps", "priority queue", "priorityqueue"], target: 15, colorClass: "bg-pink-500", bgGradient: "from-pink-500 to-rose-500" },
  { name: "Graph", aliases: ["graph", "graphs", "matrix"], target: 25, colorClass: "bg-rose-500", bgGradient: "from-rose-500 to-red-500" },
  { name: "Trie", aliases: ["trie", "tries"], target: 10, colorClass: "bg-red-500", bgGradient: "from-red-500 to-orange-500" },
  { name: "Dynamic Programming", aliases: ["dynamic programming", "dp", "dynamicprogramming"], target: 35, colorClass: "bg-orange-500", bgGradient: "from-orange-500 to-amber-500" },
  { name: "Greedy", aliases: ["greedy"], target: 20, colorClass: "bg-amber-500", bgGradient: "from-amber-500 to-yellow-500" },
  { name: "Backtracking", aliases: ["backtracking"], target: 15, colorClass: "bg-lime-500", bgGradient: "from-lime-500 to-emerald-500" },
  { name: "Binary Search", aliases: ["binary search", "binarysearch"], target: 20, colorClass: "bg-emerald-600", bgGradient: "from-emerald-600 to-sky-600" },
  { name: "Sliding Window", aliases: ["sliding window", "slidingwindow"], target: 15, colorClass: "bg-sky-500", bgGradient: "from-sky-500 to-cyan-500" },
  { name: "Two Pointer", aliases: ["two pointer", "twopointer", "two pointers", "twopointers"], target: 15, colorClass: "bg-indigo-600", bgGradient: "from-indigo-600 to-blue-500" },
];

export default function TopicProgress({ problems }: TopicProgressProps) {
  // Helper to count solved problems for a topic
  const getSolvedCount = (goal: TopicGoal) => {
    return problems.filter((p) => {
      const topicLower = p.topic.toLowerCase().trim();
      return goal.aliases.some((alias) => topicLower === alias || topicLower.includes(alias));
    }).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Topic Completion</h3>
          <p className="text-xs text-slate-500">Track your progress against recommended placement goals.</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Completed</span>
          <span className="flex items-center gap-1"><Circle className="h-4 w-4 text-indigo-500" /> In Progress</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TOPIC_GOALS.map((goal) => {
          const solved = getSolvedCount(goal);
          const percent = Math.min(Math.round((solved / goal.target) * 100), 100);
          const remaining = Math.max(goal.target - solved, 0);
          const isDone = solved >= goal.target;

          return (
            <motion.div
              key={goal.name}
              whileHover={{ scale: 1.015 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`p-4 bg-white dark:bg-slate-900 border rounded-2xl relative overflow-hidden transition-all duration-200 ${isDone ? "border-emerald-200 dark:border-emerald-950/30 bg-emerald-50/10 dark:bg-emerald-950/5 shadow-md shadow-emerald-500/5" : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-lg"}`}
            >
              <div className="flex justify-between items-start mb-2.5">
                <div>
                  <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    {goal.name}
                    {isDone && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {solved} solved / {goal.target} goal
                  </span>
                </div>
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-lg border ${isDone ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30 border-emerald-200" : "text-indigo-700 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/30 border-indigo-200"}`}>
                  {percent}%
                </span>
              </div>

              {/* Progress bar container */}
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${goal.bgGradient}`}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {isDone ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Goal Achieved!</span>
                ) : (
                  <span>{remaining} remaining</span>
                )}
                <span>Target: {goal.target}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
