"use client";

import React, { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, Info, AlertTriangle, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/notifications")
      .then((r) => r.json())
      .then((d) => {
        setNotifications(d.notifications || []);
        setLoading(false);
      });
  }, []);

  async function markAsRead(id: string) {
    await fetch(`/api/student/notifications?id=${id}`, { method: "PUT" });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  async function markAllRead() {
    await fetch("/api/student/notifications", { method: "PUT" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  if (loading) return <DashboardLayout><div className="flex justify-center p-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div></DashboardLayout>;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const typeIcon: Record<string, React.ReactNode> = {
    info: <Info className="h-5 w-5 text-blue-500" />,
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    ai: <Sparkles className="h-5 w-5 text-indigo-500" />,
  };

  const typeBadge: Record<string, "info" | "success" | "warning" | "purple"> = {
    info: "info",
    success: "success",
    warning: "warning",
    ai: "purple",
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Bell className="h-7 w-7 text-indigo-500" /> Notifications</h1>
            <p className="text-slate-500 text-sm mt-1">{unreadCount} unread notifications</p>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-sm text-indigo-600 hover:underline">Mark all as read</button>
          )}
        </div>

        <div className="space-y-3">
          {notifications.length === 0 && (
            <Card className="text-center py-12">
              <Bell className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No notifications yet</p>
            </Card>
          )}
          {notifications.map((n) => (
            <Card key={n.id} className={n.read ? "opacity-70" : "border-l-4 border-l-indigo-500"}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{typeIcon[n.type] || typeIcon.info}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900">{n.title}</p>
                    <Badge variant={typeBadge[n.type] || "default"}>{n.type}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{n.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-400">{formatDate(n.createdAt)}</span>
                    {!n.read && (
                      <button onClick={() => markAsRead(n.id)} className="text-xs text-indigo-600 hover:underline">Mark as read</button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
