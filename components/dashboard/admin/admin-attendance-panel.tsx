'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PaginationControls } from '@/components/dashboard/shared/pagination-controls';

type AttendanceEmployee = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  specialization?: string;
  isActive?: boolean;
};

export type AdminAttendanceRecord = {
  _id: string;
  employee?: AttendanceEmployee;
  date?: string;
  checkInTime?: string;
  checkOutTime?: string;
  status?: string;
  isOverriddenByAdmin?: boolean;
  overrideReason?: string;
};

export type AdminAttendanceTodayStatus = {
  employee: AttendanceEmployee;
  attendance?: AdminAttendanceRecord | null;
  status: string;
  checkInTime?: string;
  checkOutTime?: string;
};

export type AdminAttendanceSummary = {
  activeEmployees: number;
  presentToday: number;
  absentToday: number;
  notMarkedToday: number;
};

export type AttendanceCorrectionPayload = {
  status: string;
  checkInTime: string;
  checkOutTime: string;
  overrideReason: string;
  note: string;
};

interface AdminAttendancePanelProps {
  records: AdminAttendanceRecord[];
  todayStatus: AdminAttendanceTodayStatus[];
  summary: AdminAttendanceSummary | null;
  total: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onMarkAbsent: (employeeId: string, reason: string) => Promise<void>;
  onCorrect: (id: string, payload: AttendanceCorrectionPayload) => Promise<void>;
  savingId?: string | null;
}

const employeeName = (employee?: AttendanceEmployee) => {
  const name = `${employee?.firstName ?? ''} ${employee?.lastName ?? ''}`.trim();
  return name || employee?.email || 'Unknown employee';
};

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString('en-IN') : '-';

const formatTime = (value?: string) =>
  value
    ? new Date(value).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

const toDateTimeInput = (value?: string) =>
  value ? new Date(value).toISOString().slice(0, 16) : '';

export function AdminAttendancePanel({
  records,
  todayStatus,
  summary,
  total,
  currentPage,
  totalPages,
  onPageChange,
  onMarkAbsent,
  onCorrect,
  savingId,
}: AdminAttendancePanelProps) {
  const [absentReasons, setAbsentReasons] = useState<Record<string, string>>({});
  const [drafts, setDrafts] = useState<Record<string, AttendanceCorrectionPayload>>({});

  useEffect(() => {
    const nextDrafts = records.reduce<Record<string, AttendanceCorrectionPayload>>(
      (accumulator, record) => {
        accumulator[record._id] = {
          status: record.status ?? 'present',
          checkInTime: toDateTimeInput(record.checkInTime),
          checkOutTime: toDateTimeInput(record.checkOutTime),
          overrideReason: record.overrideReason ?? '',
          note: '',
        };
        return accumulator;
      },
      {},
    );
    setDrafts(nextDrafts);
  }, [records]);

  const updateDraft = (
    id: string,
    field: keyof AttendanceCorrectionPayload,
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
      id="attendance"
      className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.25)]"
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Attendance
          </p>
          <h2 className="text-2xl font-semibold text-slate-950">
            Employee attendance status
          </h2>
        </div>
        <p className="text-sm text-slate-600">
          Today: {summary?.presentToday ?? 0} present, {summary?.absentToday ?? 0}{' '}
          absent, {summary?.notMarkedToday ?? 0} not marked
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <AttendanceMetric label="Active staff" value={summary?.activeEmployees ?? 0} />
        <AttendanceMetric label="Present" value={summary?.presentToday ?? 0} />
        <AttendanceMetric label="Absent" value={summary?.absentToday ?? 0} />
        <AttendanceMetric label="Not marked" value={summary?.notMarkedToday ?? 0} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        {todayStatus.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 xl:col-span-2">
            No active employees found.
          </div>
        ) : (
          todayStatus.map((item) => (
            <div
              key={item.employee._id}
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-semibold text-slate-950">
                    {employeeName(item.employee)}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {item.employee.role ?? 'staff'} ·{' '}
                    {item.employee.specialization ?? 'No specialization'}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.status === 'present'
                      ? 'bg-emerald-100 text-emerald-700'
                      : item.status === 'absent'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <div className="mt-3 text-sm text-slate-600">
                In {formatTime(item.checkInTime)} · Out {formatTime(item.checkOutTime)}
              </div>
              {item.status !== 'absent' ? (
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Input
                    value={absentReasons[item.employee._id] ?? ''}
                    onChange={(event) =>
                      setAbsentReasons((current) => ({
                        ...current,
                        [item.employee._id]: event.target.value,
                      }))
                    }
                    placeholder="Reason for absent override"
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      onMarkAbsent(
                        item.employee._id,
                        absentReasons[item.employee._id] || 'marked absent by admin',
                      )
                    }
                    disabled={savingId === item.employee._id}
                  >
                    Mark Absent
                  </Button>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      <div className="mt-8">
        <h3 className="mb-4 text-lg font-semibold text-slate-950">Recent records</h3>
        <div className="space-y-4">
          {records.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
              No attendance records yet.
            </div>
          ) : (
            records.map((record) => {
              const draft = drafts[record._id];
              if (!draft) return null;

              return (
                <div
                  key={record._id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-950">
                        {employeeName(record.employee)}
                      </h4>
                      <p className="text-sm text-slate-500">
                        {formatDate(record.date)} · In {formatTime(record.checkInTime)} ·
                        Out {formatTime(record.checkOutTime)}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                      {record.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                    <select
                      className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
                      value={draft.status}
                      onChange={(event) =>
                        updateDraft(record._id, 'status', event.target.value)
                      }
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                    </select>
                    <Input
                      type="datetime-local"
                      value={draft.checkInTime}
                      onChange={(event) =>
                        updateDraft(record._id, 'checkInTime', event.target.value)
                      }
                    />
                    <Input
                      type="datetime-local"
                      value={draft.checkOutTime}
                      onChange={(event) =>
                        updateDraft(record._id, 'checkOutTime', event.target.value)
                      }
                    />
                    <Input
                      value={draft.overrideReason}
                      onChange={(event) =>
                        updateDraft(record._id, 'overrideReason', event.target.value)
                      }
                      placeholder="Override reason"
                    />
                    <Input
                      value={draft.note}
                      onChange={(event) =>
                        updateDraft(record._id, 'note', event.target.value)
                      }
                      placeholder="Correction note"
                    />
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={() => onCorrect(record._id, draft)}
                      disabled={savingId === record._id}
                    >
                      {savingId === record._id ? 'Saving...' : 'Save Correction'}
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
          itemLabel="attendance records"
          onPageChange={onPageChange}
        />
      </div>
    </section>
  );
}

function AttendanceMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="text-2xl font-semibold text-slate-950">{value}</div>
      <div className="mt-1 text-sm text-slate-600">{label}</div>
    </div>
  );
}
