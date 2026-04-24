'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AdminCreatePayload = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'admin' | 'super-admin';
  caninvite: boolean;
};

interface AdminAccessPanelProps {
  currentRole?: string;
  canInvite?: boolean;
  onCreateAdmin: (payload: AdminCreatePayload) => Promise<void>;
  creating?: boolean;
}

export function AdminAccessPanel({
  currentRole,
  canInvite,
  onCreateAdmin,
  creating = false,
}: AdminAccessPanelProps) {
  const [form, setForm] = useState<AdminCreatePayload>({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'admin',
    caninvite: false,
  });

  const canManageAdmins = currentRole === 'super-admin' || canInvite;

  const updateField = (
    field: keyof AdminCreatePayload,
    value: string | boolean,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onCreateAdmin(form);
    setForm({
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'admin',
      caninvite: false,
    });
  };

  return (
    <section
      id="admin-access"
      className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.25)]"
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Admin Access
          </p>
          <h2 className="text-2xl font-semibold text-slate-950">
            Admin account control
          </h2>
        </div>
        <div className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white">
          Current role: {currentRole ?? 'admin'}
        </div>
      </div>

      {!canManageAdmins ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          This account does not currently have permission to create new admin users.
          Super-admin access is required.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Input
              value={form.username}
              onChange={(event) => updateField('username', event.target.value)}
              placeholder="Username"
              required
            />
            <Input
              value={form.firstName}
              onChange={(event) => updateField('firstName', event.target.value)}
              placeholder="First name"
              required
            />
            <Input
              value={form.lastName}
              onChange={(event) => updateField('lastName', event.target.value)}
              placeholder="Last name"
              required
            />
            <Input
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="Email"
              required
            />
            <Input
              type="password"
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              placeholder="Temporary password"
              required
            />
            <select
              className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
              value={form.role}
              onChange={(event) =>
                updateField('role', event.target.value as 'admin' | 'super-admin')
              }
            >
              <option value="admin">Admin</option>
              <option value="super-admin">Super Admin</option>
            </select>
          </div>

          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.caninvite}
              onChange={(event) => updateField('caninvite', event.target.checked)}
            />
            Allow this admin to invite or create more admins
          </label>

          <div className="flex justify-end">
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating admin...' : 'Create Admin'}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
