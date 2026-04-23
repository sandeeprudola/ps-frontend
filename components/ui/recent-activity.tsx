'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { CalendarClock, Clock, UserRound } from 'lucide-react';

type Person = {
  firstName?: string;
  lastName?: string;
  email?: string;
  specialization?: string;
};

export type DashboardAppointment = {
  _id: string;
  patient?: Person;
  staff?: Person;
  appointmentdate?: string;
  status?: string;
  appointmentType?: string;
  priority?: string;
  paymentStatus?: string;
};

interface RecentActivityProps {
  appointments?: DashboardAppointment[];
}

const getName = (person?: Person, fallback = 'Unassigned') => {
  const name = `${person?.firstName ?? ''} ${person?.lastName ?? ''}`.trim();
  return name || person?.email || fallback;
};

export const RecentActivity = memo(({ appointments = [] }: RecentActivityProps) => {
  return (
    <div className="border-border bg-card/40 rounded-xl border p-6">
      <h3 className="mb-4 text-xl font-semibold">Latest Appointments</h3>
      <div className="space-y-3">
        {appointments.length === 0 && (
          <div className="border-border text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
            No appointments found.
          </div>
        )}

        {appointments.map((appointment, index) => {
          return (
            <motion.div
              key={appointment._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="hover:bg-accent/50 flex items-center gap-3 rounded-lg p-2 transition-colors"
            >
              <div className="bg-accent/50 rounded-lg p-2">
                <CalendarClock className="h-4 w-4 text-blue-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {getName(appointment.patient, 'Unknown patient')}
                </div>
                <div className="text-muted-foreground flex items-center gap-1 truncate text-xs">
                  <UserRound className="h-3 w-3" />
                  {getName(appointment.staff)}
                </div>
              </div>
              <div className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs">
                <Clock className="h-3 w-3" />
                {appointment.appointmentdate
                  ? new Date(appointment.appointmentdate).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'No time'}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
});

RecentActivity.displayName = 'RecentActivity';
