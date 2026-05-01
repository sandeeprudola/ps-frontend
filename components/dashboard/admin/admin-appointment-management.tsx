'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginationControls } from '@/components/dashboard/shared/pagination-controls';

export type AdminAppointmentRecord = {
  _id: string;
  appointmentdate?: string;
  status?: string;
  appointmentType?: string;
  priority?: string;
  paymentStatus?: string;
  duration?: number;
  notes?: string;
  patient?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  staff?: {
    firstName?: string;
    lastName?: string;
    specialization?: string;
  };
};

type AppointmentDraft = {
  appointmentdate: string;
  status: string;
  appointmentType: string;
  priority: string;
  paymentStatus: string;
  duration: string;
  notes: string;
};

interface AdminAppointmentManagementProps {
  appointments: AdminAppointmentRecord[];
  total: number;
  currentPage: number;
  totalPages: number;
  onSave: (id: string, payload: AppointmentDraft) => Promise<void>;
  onPageChange: (page: number) => void;
  savingId?: string | null;
}

const getPersonName = (
  person?: { firstName?: string; lastName?: string; email?: string },
  fallback = 'Unknown',
) => {
  const name = `${person?.firstName ?? ''} ${person?.lastName ?? ''}`.trim();
  return name || person?.email || fallback;
};

const toDateTimeInput = (value?: string) =>
  value ? new Date(value).toISOString().slice(0, 16) : '';

export function AdminAppointmentManagement({
  appointments,
  total,
  currentPage,
  totalPages,
  onSave,
  onPageChange,
  savingId,
}: AdminAppointmentManagementProps) {
  const [drafts, setDrafts] = useState<Record<string, AppointmentDraft>>({});

  useEffect(() => {
    const nextDrafts = appointments.reduce<Record<string, AppointmentDraft>>(
      (accumulator, appointment) => {
        accumulator[appointment._id] = {
          appointmentdate: toDateTimeInput(appointment.appointmentdate),
          status: appointment.status ?? 'scheduled',
          appointmentType: appointment.appointmentType ?? 'consultation',
          priority: appointment.priority ?? 'normal',
          paymentStatus: appointment.paymentStatus ?? 'pending',
          duration: String(appointment.duration ?? 30),
          notes: appointment.notes ?? '',
        };
        return accumulator;
      },
      {},
    );

    setDrafts(nextDrafts);
  }, [appointments]);

  const updateDraft = (
    id: string,
    field: keyof AppointmentDraft,
    value: string,
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
      id="appointments"
      className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.25)]"
    >
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
          Appointments
        </p>
        <h2 className="text-2xl font-semibold text-slate-950">Schedule control</h2>
      </div>

      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No appointments found for the current filters.
          </div>
        ) : (
          appointments.map((appointment) => {
            const draft = drafts[appointment._id];
            if (!draft) return null;

            return (
              <div
                key={appointment._id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="mb-4 flex flex-col gap-1">
                  <h3 className="text-lg font-semibold text-slate-950">
                    {getPersonName(appointment.patient, 'Unknown patient')}
                  </h3>
                  <p className="text-sm text-slate-500">
                    Staff: {getPersonName(appointment.staff, 'Unassigned')} •{' '}
                    {appointment.staff?.specialization ?? 'No specialization'}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Input
                    type="datetime-local"
                    value={draft.appointmentdate}
                    onChange={(event) =>
                      updateDraft(appointment._id, 'appointmentdate', event.target.value)
                    }
                  />
                  <select
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
                    value={draft.status}
                    onChange={(event) =>
                      updateDraft(appointment._id, 'status', event.target.value)
                    }
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="canceled">Canceled</option>
                  </select>
                  <select
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
                    value={draft.appointmentType}
                    onChange={(event) =>
                      updateDraft(appointment._id, 'appointmentType', event.target.value)
                    }
                  >
                    <option value="consultation">Consultation</option>
                    <option value="speech-therapy">Speech Therapy</option>
                    <option value="hearing-test">Hearing Test</option>
                    <option value="followup">Follow-up</option>
                    <option value="emergency">Emergency</option>
                  </select>
                  <select
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
                    value={draft.priority}
                    onChange={(event) =>
                      updateDraft(appointment._id, 'priority', event.target.value)
                    }
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="emergency">Emergency</option>
                  </select>
                  <select
                    className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
                    value={draft.paymentStatus}
                    onChange={(event) =>
                      updateDraft(appointment._id, 'paymentStatus', event.target.value)
                    }
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                    <option value="waived">Waived</option>
                  </select>
                  <Input
                    value={draft.duration}
                    onChange={(event) =>
                      updateDraft(appointment._id, 'duration', event.target.value)
                    }
                    placeholder="Duration in minutes"
                  />
                </div>

                <textarea
                  className="mt-3 min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  value={draft.notes}
                  onChange={(event) =>
                    updateDraft(appointment._id, 'notes', event.target.value)
                  }
                  placeholder="Notes"
                />

                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={() => onSave(appointment._id, draft)}
                    disabled={savingId === appointment._id}
                  >
                    {savingId === appointment._id ? 'Saving...' : 'Save Appointment'}
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
        itemLabel="appointments"
        onPageChange={onPageChange}
      />
    </section>
  );
}
