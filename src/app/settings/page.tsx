"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save, Bell, Shield, Globe, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: true,
    profileVisible: true,
    darkMode: false,
    language: "en",
    timezone: "Asia/Kolkata",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user);
        setLoading(false);
      });
  }, []);

  async function saveSettings() {
    setSaving(true);
    setMessage("");
    await new Promise((resolve) => setTimeout(resolve, 500));
    setMessage("Settings saved successfully!");
    setSaving(false);
  }

  function update(key: keyof typeof settings, value: any) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user?.studentProfile}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <Button onClick={saveSettings} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        {message && (
          <p className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg">
            {message}
          </p>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-500" /> Notifications
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Switch
              label="Email Notifications"
              description="Receive updates about your progress and new features"
              checked={settings.emailNotifications}
              onChange={() => update("emailNotifications", !settings.emailNotifications)}
            />
            <Switch
              label="Push Notifications"
              description="Get real-time alerts on your device"
              checked={settings.pushNotifications}
              onChange={() => update("pushNotifications", !settings.pushNotifications)}
            />
            <Switch
              label="Weekly Digest"
              description="Summary of your weekly progress and AI suggestions"
              checked={settings.weeklyDigest}
              onChange={() => update("weeklyDigest", !settings.weeklyDigest)}
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" /> Privacy & Security
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <Switch
              label="Profile Visibility"
              description="Make your profile visible on the leaderboard"
              checked={settings.profileVisible}
              onChange={() => update("profileVisible", !settings.profileVisible)}
            />
            <div className="pt-4 border-t border-slate-100">
              <Button variant="outline" size="sm">
                <Shield className="h-4 w-4" /> Change Password
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyan-500" /> Preferences
            </CardTitle>
          </CardHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Language"
              value={settings.language}
              onChange={(e) => update("language", e.target.value)}
              options={[
                { value: "en", label: "English" },
                { value: "hi", label: "Hindi" },
                { value: "ta", label: "Tamil" },
              ]}
            />
            <Select
              label="Timezone"
              value={settings.timezone}
              onChange={(e) => update("timezone", e.target.value)}
              options={[
                { value: "Asia/Kolkata", label: "IST (Asia/Kolkata)" },
                { value: "UTC", label: "UTC" },
              ]}
            />
            <div className="sm:col-span-2">
              <Switch
                label="Dark Mode"
                description="Switch to dark theme"
                checked={settings.darkMode}
                onChange={() => update("darkMode", !settings.darkMode)}
              />
            </div>
          </div>
        </Card>

        <Card className="border-red-200 bg-red-50/30">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> Danger Zone
            </CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Once you delete your account, there is no going back. All your data will be permanently removed.
            </p>
            <Button variant="danger" size="sm">
              Delete Account
            </Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
