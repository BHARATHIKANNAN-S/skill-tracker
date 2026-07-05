"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Cert {
  id: string; name: string; organization: string; issueDate: string;
  skillCategory?: string; approved: boolean; verificationUrl?: string;
}

export default function CertificationsPage() {
  const [certs, setCerts] = useState<Cert[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", organization: "", issueDate: "", skillCategory: "", certificateId: "", verificationUrl: "" });

  function load() {
    fetch("/api/student/certifications").then((r) => r.json()).then((d) => setCerts(d.certifications || []));
  }
  useEffect(() => { load(); }, []);

  async function add() {
    await fetch("/api/student/certifications", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    setShowForm(false);
    load();
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Certifications</h1>
          <Button onClick={() => setShowForm(!showForm)}><Plus className="h-4 w-4" /> Add Certificate</Button>
        </div>

        {showForm && (
          <Card>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Certificate Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input label="Organization" value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
              <Input label="Issue Date" type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} />
              <Input label="Skill Category" value={form.skillCategory} onChange={(e) => setForm({ ...form, skillCategory: e.target.value })} />
              <Input label="Certificate ID" value={form.certificateId} onChange={(e) => setForm({ ...form, certificateId: e.target.value })} />
              <Input label="Verification URL" value={form.verificationUrl} onChange={(e) => setForm({ ...form, verificationUrl: e.target.value })} />
              <div className="sm:col-span-2"><Button onClick={add} className="w-full">Submit Certificate</Button></div>
            </div>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {certs.map((c) => (
            <Card key={c.id} hover>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{c.name}</h3>
                  <p className="text-sm text-slate-500">{c.organization}</p>
                  <p className="text-xs text-slate-400 mt-1">Issued: {formatDate(c.issueDate)}</p>
                </div>
                <Badge variant={c.approved ? "success" : "warning"}>{c.approved ? "Approved" : "Pending"}</Badge>
              </div>
              {c.skillCategory && <Badge variant="info" className="mt-3">{c.skillCategory}</Badge>}
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
