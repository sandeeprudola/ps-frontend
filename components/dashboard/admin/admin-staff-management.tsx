'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginationControls } from '@/components/dashboard/shared/pagination-controls';

export type AdminStaffRecord = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  specialization?: string;
  isActive?: boolean;
};

type StaffDraft = {
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  specialization: string;
  isActive: boolean;
};

interface AdminStaffManagementProps {
  staff: AdminStaffRecord[];
  total: number;
  currentPage: number;
  totalPages: number;
  onSave: (id: string, payload: StaffDraft) => Promise<void>;
  onPageChange: (page: number) => void;
  savingId?: string | null;
}

export function AdminStaffManagement({
  staff,
  total,
  currentPage,
  totalPages,
  onSave,
  onPageChange,
  savingId,
}: AdminStaffManagementProps) {
  const [drafts, setDrafts] = useState<Record<string, StaffDraft>>({});

  useEffect(() => {
    const nextDrafts = staff.reduce<Record<string, StaffDraft>>((accumulator, member) => {
      accumulator[member._id] = {
        firstName: member.firstName ?? '',
        lastName: member.lastName ?? '',
        phone: member.phone ?? '',
        role: member.role ?? 'therapist',
        specialization: member.specialization ?? '',
        isActive: member.isActive ?? true,
      };
      return accumulator;
    }, {});

    setDrafts(nextDrafts);
  }, [staff]);

  const updateDraft = (
    id: string,
    field: keyof StaffDraft,
    value: string | boolean,
  ) => {
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
      id="staff"
      className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.25)]"
    >
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Staff
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">Team operations</h2>
      </div>

      <div className="space-y-4">
        {staff.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No staff records found for the current filters.
          </div>
        ) : (
          staff.map((member) => {
            const draft = drafts[member._id];
            if (!draft) return null;

            return (
              <div
                key={member._id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">
                      {member.firstName} {member.lastName}
                    </h3>
                    <p className="text-sm text-slate-500">{member.email}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      draft.isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {draft.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Input
                    value={draft.firstName}
                    onChange={(event) =>
                      updateDraft(member._id, 'firstName', event.target.value)
                    }
                    placeholder="First name"
                  />
                  <Input
                    value={draft.lastName}
                    onChange={(event) =>
                      updateDraft(member._id, 'lastName', event.target.value)
                    }
                    placeholder="Last name"
                  />
                  <Input
                    value={draft.phone}
                    onChange={(event) =>
                      updateDraft(member._id, 'phone', event.target.value)
                    }
                    placeholder="Phone"
                  />
                  <select
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
                    value={draft.role}
                    onChange={(event) => updateDraft(member._id, 'role', event.target.value)}
                  >
                    <option value="therapist">Therapist</option>
                    <option value="audiologist">Audiologist</option>
                    <option value="receptionist">Receptionist</option>
                  </select>
                  <Input
                    value={draft.specialization}
                    onChange={(event) =>
                      updateDraft(member._id, 'specialization', event.target.value)
                    }
                    placeholder="Specialization"
                  />
                  <label className="flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={draft.isActive}
                      onChange={(event) =>
                        updateDraft(member._id, 'isActive', event.target.checked)
                      }
                    />
                    Active
                  </label>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={() => onSave(member._id, draft)}
                    disabled={savingId === member._id}
                  >
                    {savingId === member._id ? 'Saving...' : 'Save Staff'}
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
        itemLabel="staff records"
        onPageChange={onPageChange}
      />
    </section>
  );
}
