'use client';

import type { DashboardAppointment } from './recent-activity';

interface TodayScheduleTableProps {
  schedule: DashboardAppointment[];
}

const getName = (
  person: DashboardAppointment['patient'] | DashboardAppointment['staff'],
  fallback: string,
) => {
  const name = `${person?.firstName ?? ''} ${person?.lastName ?? ''}`.trim();
  return name || fallback;
};

export default function TodayScheduleTable({ schedule }: TodayScheduleTableProps) {
  return (
    <div className="border-border bg-card/40 overflow-hidden rounded-xl border p-4">
      <h2 className="mb-3 text-lg font-semibold">Today&apos;s Schedule</h2>
      {schedule.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
          No appointments scheduled for today.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Patient</th>
                <th>Staff</th>
                <th>Specialization</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((item) => (
                <tr key={item._id} className="border-b last:border-0 hover:bg-accent/40">
                  <td className="py-3">{getName(item.patient, 'Unknown patient')}</td>
                  <td>{getName(item.staff, 'Unassigned')}</td>
                  <td>{item.staff?.specialization ?? '-'}</td>
                  <td>
                    <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                      {item.status ?? 'scheduled'}
                    </span>
                  </td>
                  <td>
                    {item.appointmentdate
                      ? new Date(item.appointmentdate).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
