'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginationControls } from '@/components/dashboard/shared/pagination-controls';
import { HEARING_SERVICES, SPEECH_SERVICES } from '@/lib/service-catalog';

export type AdminUserRecord = {
  _id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  HearingServices?: string;
  SpeechServices?: string;
  createdAt?: string;
};

type UserDraft = {
  firstName: string;
  lastName: string;
  role: string;
  HearingServices: string;
  SpeechServices: string;
};

interface AdminUserManagementProps {
  users: AdminUserRecord[];
  total: number;
  currentPage: number;
  totalPages: number;
  onSave: (id: string, payload: UserDraft) => Promise<void>;
  onPageChange: (page: number) => void;
  savingId?: string | null;
}

export function AdminUserManagement({
  users,
  total,
  currentPage,
  totalPages,
  onSave,
  onPageChange,
  savingId,
}: AdminUserManagementProps) {
  const [drafts, setDrafts] = useState<Record<string, UserDraft>>({});

  useEffect(() => {
    const nextDrafts = users.reduce<Record<string, UserDraft>>((accumulator, user) => {
      accumulator[user._id] = {
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        role: user.role ?? 'both',
        HearingServices: user.HearingServices ?? 'None',
        SpeechServices: user.SpeechServices ?? 'None',
      };
      return accumulator;
    }, {});

    setDrafts(nextDrafts);
  }, [users]);

  const updateDraft = (id: string, field: keyof UserDraft, value: string) => {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value,
      },
    }));
  };

  return (
    <section
      id="users"
      className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.25)]"
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Users
          </p>
          <h2 className="text-2xl font-semibold text-slate-950">Patient management</h2>
        </div>
        <p className="text-sm text-slate-600">
          Editing support for the backend `/admin/users/:id` endpoint. Showing{' '}
          {users.length} of {total} users.
        </p>
      </div>

      <div className="space-y-4">
        {users.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No patient accounts found for the current filters.
          </div>
        ) : (
          users.map((user) => {
            const draft = drafts[user._id];
            if (!draft) return null;

            return (
              <div
                key={user._id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">
                      {user.firstName || user.username} {user.lastName}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {user.email} • @{user.username}
                    </p>
                  </div>
                  <div className="text-sm text-slate-500">
                    Joined{' '}
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : 'Unknown'}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                  <Input
                    value={draft.firstName}
                    onChange={(event) =>
                      updateDraft(user._id, 'firstName', event.target.value)
                    }
                    placeholder="First name"
                  />
                  <Input
                    value={draft.lastName}
                    onChange={(event) =>
                      updateDraft(user._id, 'lastName', event.target.value)
                    }
                    placeholder="Last name"
                  />
                  <select
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
                    value={draft.role}
                    onChange={(event) => updateDraft(user._id, 'role', event.target.value)}
                  >
                    <option value="speech">Speech</option>
                    <option value="hearing">Hearing</option>
                    <option value="both">Both</option>
                  </select>
                  <select
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
                    value={draft.HearingServices}
                    onChange={(event) =>
                      updateDraft(user._id, 'HearingServices', event.target.value)
                    }
                  >
                    {HEARING_SERVICES.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
                    value={draft.SpeechServices}
                    onChange={(event) =>
                      updateDraft(user._id, 'SpeechServices', event.target.value)
                    }
                  >
                    {SPEECH_SERVICES.map((service) => (
                      <option key={service} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={() => onSave(user._id, draft)}
                    disabled={savingId === user._id}
                  >
                    {savingId === user._id ? 'Saving...' : 'Save User'}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={total}
        itemLabel="users"
        onPageChange={onPageChange}
      />
    </section>
  );
}
