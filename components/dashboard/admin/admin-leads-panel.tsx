'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginationControls } from '@/components/dashboard/shared/pagination-controls';
import { HEARING_SERVICES, SPEECH_SERVICES } from '@/lib/service-catalog';

export type AdminLeadRecord = {
  _id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  interest?: string;
  source?: string;
  status?: string;
  notes?: string;
  lostReason?: string;
  nextFollowUpDate?: string;
  assignedTo?: {
    _id?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    specialization?: string;
  };
  convertedPatient?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
};

export type AdminLeadDraft = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  interest: string;
  source: string;
  status: string;
  assignedTo: string;
  nextFollowUpDate: string;
  notes: string;
  lostReason: string;
};

export type AdminLeadConversionDraft = {
  username: string;
  email: string;
  password: string;
  role: string;
  HearingServices: string;
  SpeechServices: string;
};

type StaffOption = {
  _id?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  specialization?: string;
};

interface AdminLeadsPanelProps {
  leads: AdminLeadRecord[];
  staff: StaffOption[];
  total: number;
  currentPage: number;
  totalPages: number;
  onCreate: (payload: AdminLeadDraft) => Promise<void>;
  onSave: (id: string, payload: AdminLeadDraft) => Promise<void>;
  onConvert: (id: string, payload: AdminLeadConversionDraft) => Promise<void>;
  onPageChange: (page: number) => void;
  creating?: boolean;
  savingId?: string | null;
  convertingId?: string | null;
}

const blankLead: AdminLeadDraft = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  interest: 'hearing',
  source: 'walk-in',
  status: 'new',
  assignedTo: '',
  nextFollowUpDate: '',
  notes: '',
  lostReason: '',
};

const blankConversion: AdminLeadConversionDraft = {
  username: '',
  email: '',
  password: '',
  role: 'hearing',
  HearingServices: 'Hearing Assessment',
  SpeechServices: 'None',
};

const toDateTimeInput = (value?: string) =>
  value ? new Date(value).toISOString().slice(0, 16) : '';

const staffName = (staff?: StaffOption) => {
  const name = `${staff?.firstName ?? ''} ${staff?.lastName ?? ''}`.trim();
  return name || staff?.role || 'Unassigned';
};

export function AdminLeadsPanel({
  leads,
  staff,
  total,
  currentPage,
  totalPages,
  onCreate,
  onSave,
  onConvert,
  onPageChange,
  creating = false,
  savingId,
  convertingId,
}: AdminLeadsPanelProps) {
  const [createForm, setCreateForm] = useState<AdminLeadDraft>(blankLead);
  const [drafts, setDrafts] = useState<Record<string, AdminLeadDraft>>({});
  const [conversionDrafts, setConversionDrafts] = useState<
    Record<string, AdminLeadConversionDraft>
  >({});

  useEffect(() => {
    const nextDrafts = leads.reduce<Record<string, AdminLeadDraft>>((acc, lead) => {
      acc[lead._id] = {
        firstName: lead.firstName ?? '',
        lastName: lead.lastName ?? '',
        phone: lead.phone ?? '',
        email: lead.email ?? '',
        interest: lead.interest ?? 'hearing',
        source: lead.source ?? 'walk-in',
        status: lead.status ?? 'new',
        assignedTo: lead.assignedTo?._id ?? '',
        nextFollowUpDate: toDateTimeInput(lead.nextFollowUpDate),
        notes: lead.notes ?? '',
        lostReason: lead.lostReason ?? '',
      };
      return acc;
    }, {});

    const nextConversions = leads.reduce<Record<string, AdminLeadConversionDraft>>(
      (acc, lead) => {
        const username = `${lead.firstName ?? 'patient'}${lead.phone?.slice(-4) ?? ''}`
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '');
        const role = ['hearing', 'speech', 'both'].includes(lead.interest ?? '')
          ? lead.interest ?? 'hearing'
          : 'hearing';

        acc[lead._id] = {
          ...blankConversion,
          username,
          email: lead.email ?? '',
          role,
          HearingServices: role === 'speech' ? 'None' : 'Hearing Assessment',
          SpeechServices: role === 'hearing' ? 'None' : 'Speech Assessment',
        };
        return acc;
      },
      {},
    );

    setDrafts(nextDrafts);
    setConversionDrafts(nextConversions);
  }, [leads]);

  const updateDraft = (id: string, field: keyof AdminLeadDraft, value: string) => {
    setDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value,
      },
    }));
  };

  const updateConversion = (
    id: string,
    field: keyof AdminLeadConversionDraft,
    value: string,
  ) => {
    setConversionDrafts((current) => ({
      ...current,
      [id]: {
        ...current[id],
        [field]: value,
      },
    }));
  };

  const submitCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onCreate(createForm);
    setCreateForm(blankLead);
  };

  return (
    <section
      id="leads"
      className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.25)]"
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Leads
          </p>
          <h2 className="text-2xl font-semibold text-slate-950">
            Intake and conversion pipeline
          </h2>
        </div>
        <p className="text-sm text-slate-600">
          Create, assign, update, and convert leads from `/leads`.
        </p>
      </div>

      <form
        onSubmit={submitCreate}
        className="mb-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
      >
        <h3 className="mb-4 text-lg font-semibold text-slate-950">Create lead</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <Input
            value={createForm.firstName}
            onChange={(event) =>
              setCreateForm((current) => ({ ...current, firstName: event.target.value }))
            }
            placeholder="First name"
            required
          />
          <Input
            value={createForm.lastName}
            onChange={(event) =>
              setCreateForm((current) => ({ ...current, lastName: event.target.value }))
            }
            placeholder="Last name"
          />
          <Input
            value={createForm.phone}
            onChange={(event) =>
              setCreateForm((current) => ({ ...current, phone: event.target.value }))
            }
            placeholder="Phone"
            required
          />
          <Input
            value={createForm.email}
            onChange={(event) =>
              setCreateForm((current) => ({ ...current, email: event.target.value }))
            }
            placeholder="Email"
            type="email"
          />
          <select
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
            value={createForm.interest}
            onChange={(event) =>
              setCreateForm((current) => ({ ...current, interest: event.target.value }))
            }
          >
            <option value="hearing">Hearing</option>
            <option value="speech">Speech</option>
            <option value="both">Both</option>
            <option value="other">Other</option>
          </select>
          <select
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
            value={createForm.source}
            onChange={(event) =>
              setCreateForm((current) => ({ ...current, source: event.target.value }))
            }
          >
            <option value="walk-in">Walk-in</option>
            <option value="phone-call">Phone call</option>
            <option value="website">Website</option>
            <option value="referral">Referral</option>
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="camp">Camp</option>
            <option value="other">Other</option>
          </select>
          <select
            className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
            value={createForm.assignedTo}
            onChange={(event) =>
              setCreateForm((current) => ({ ...current, assignedTo: event.target.value }))
            }
          >
            <option value="">Assign staff</option>
            {staff.map((member) => (
              <option key={member._id} value={member._id}>
                {staffName(member)} · {member.role}
              </option>
            ))}
          </select>
          <Input
            type="datetime-local"
            value={createForm.nextFollowUpDate}
            onChange={(event) =>
              setCreateForm((current) => ({
                ...current,
                nextFollowUpDate: event.target.value,
              }))
            }
          />
        </div>
        <textarea
          className="mt-3 min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          value={createForm.notes}
          onChange={(event) =>
            setCreateForm((current) => ({ ...current, notes: event.target.value }))
          }
          placeholder="Lead notes"
        />
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={creating}>
            {creating ? 'Creating...' : 'Create Lead'}
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        {leads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No leads found for the current filters.
          </div>
        ) : (
          leads.map((lead) => {
            const draft = drafts[lead._id];
            const conversion = conversionDrafts[lead._id];
            if (!draft || !conversion) return null;

            return (
              <div
                key={lead._id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">
                      {lead.firstName} {lead.lastName}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {lead.phone} {lead.email ? `· ${lead.email}` : ''} · Assigned to{' '}
                      {staffName(lead.assignedTo)}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                    {lead.status ?? 'new'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <Input
                    value={draft.firstName}
                    onChange={(event) =>
                      updateDraft(lead._id, 'firstName', event.target.value)
                    }
                    placeholder="First name"
                  />
                  <Input
                    value={draft.lastName}
                    onChange={(event) =>
                      updateDraft(lead._id, 'lastName', event.target.value)
                    }
                    placeholder="Last name"
                  />
                  <Input
                    value={draft.phone}
                    onChange={(event) =>
                      updateDraft(lead._id, 'phone', event.target.value)
                    }
                    placeholder="Phone"
                  />
                  <Input
                    value={draft.email}
                    onChange={(event) =>
                      updateDraft(lead._id, 'email', event.target.value)
                    }
                    placeholder="Email"
                  />
                  <select
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
                    value={draft.status}
                    onChange={(event) =>
                      updateDraft(lead._id, 'status', event.target.value)
                    }
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="follow-up">Follow-up</option>
                    <option value="converted">Converted</option>
                    <option value="lost">Lost</option>
                  </select>
                  <select
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
                    value={draft.interest}
                    onChange={(event) =>
                      updateDraft(lead._id, 'interest', event.target.value)
                    }
                  >
                    <option value="hearing">Hearing</option>
                    <option value="speech">Speech</option>
                    <option value="both">Both</option>
                    <option value="other">Other</option>
                  </select>
                  <select
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
                    value={draft.assignedTo}
                    onChange={(event) =>
                      updateDraft(lead._id, 'assignedTo', event.target.value)
                    }
                  >
                    <option value="">Unassigned</option>
                    {staff.map((member) => (
                      <option key={member._id} value={member._id}>
                        {staffName(member)} · {member.role}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="datetime-local"
                    value={draft.nextFollowUpDate}
                    onChange={(event) =>
                      updateDraft(lead._id, 'nextFollowUpDate', event.target.value)
                    }
                  />
                </div>

                <textarea
                  className="mt-3 min-h-20 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  value={draft.notes}
                  onChange={(event) => updateDraft(lead._id, 'notes', event.target.value)}
                  placeholder="Notes"
                />
                <Input
                  className="mt-3"
                  value={draft.lostReason}
                  onChange={(event) =>
                    updateDraft(lead._id, 'lostReason', event.target.value)
                  }
                  placeholder="Lost reason"
                />

                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 text-sm font-semibold text-slate-950">
                    Convert to patient
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Input
                      value={conversion.username}
                      onChange={(event) =>
                        updateConversion(lead._id, 'username', event.target.value)
                      }
                      placeholder="Username"
                    />
                    <Input
                      value={conversion.email}
                      onChange={(event) =>
                        updateConversion(lead._id, 'email', event.target.value)
                      }
                      placeholder="Email"
                    />
                    <Input
                      value={conversion.password}
                      onChange={(event) =>
                        updateConversion(lead._id, 'password', event.target.value)
                      }
                      placeholder="Temporary password"
                    />
                    <select
                      className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
                      value={conversion.role}
                      onChange={(event) =>
                        updateConversion(lead._id, 'role', event.target.value)
                      }
                    >
                      <option value="hearing">Hearing</option>
                      <option value="speech">Speech</option>
                      <option value="both">Both</option>
                    </select>
                    <select
                      className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
                      value={conversion.HearingServices}
                      onChange={(event) =>
                        updateConversion(lead._id, 'HearingServices', event.target.value)
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
                      value={conversion.SpeechServices}
                      onChange={(event) =>
                        updateConversion(lead._id, 'SpeechServices', event.target.value)
                      }
                    >
                      {SPEECH_SERVICES.map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => onSave(lead._id, draft)}
                    disabled={savingId === lead._id}
                  >
                    {savingId === lead._id ? 'Saving...' : 'Save Lead'}
                  </Button>
                  <Button
                    onClick={() => onConvert(lead._id, conversion)}
                    disabled={convertingId === lead._id || lead.status === 'converted'}
                  >
                    {convertingId === lead._id ? 'Converting...' : 'Convert'}
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
        itemLabel="leads"
        onPageChange={onPageChange}
      />
    </section>
  );
}
