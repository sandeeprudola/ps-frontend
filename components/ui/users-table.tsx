'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Calendar,
  Mail,
  MoreHorizontal,
  Phone,
} from 'lucide-react';

export type DashboardUser = {
  _id: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  createdAt?: string;
};

interface UsersTableProps {
  users?: DashboardUser[];
  total?: number;
  loading?: boolean;
  onAddUser: () => void;
}

const getInitials = (user: DashboardUser) => {
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  const source = name || user.username || user.email || 'User';

  return source
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
};

const getName = (user: DashboardUser) => {
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  return name || user.username || 'Unnamed patient';
};

const roleClasses: Record<string, string> = {
  hearing: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  speech: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  both: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
};

export const UsersTable = memo(
  ({ users = [], total = 0, loading = false, onAddUser }: UsersTableProps) => {
  return (
    <div className="border-border bg-card/40 rounded-xl border p-3 sm:p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-lg font-semibold sm:text-xl">Recent Patients</h3>
          <p className="text-muted-foreground text-sm">
            Showing {users.length} of {total} registered patient accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onAddUser}>
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Add User</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {loading &&
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-muted/60 h-20 animate-pulse rounded-lg"
            />
          ))}

        {!loading && users.length === 0 && (
          <div className="border-border text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
            No patient accounts found.
          </div>
        )}

        {!loading && users.map((user, index) => (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group hover:bg-accent/50 flex flex-col items-start gap-4 rounded-lg p-4 transition-colors sm:flex-row sm:items-center"
          >
            <div className="flex w-full items-center gap-4 sm:w-auto">
              <div className="relative">
                <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold">
                  {getInitials(user) || 'U'}
                </div>
                <div className="border-background absolute -right-1 -bottom-1 h-3 w-3 rounded-full border-2 bg-green-500" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="truncate text-sm font-medium">{getName(user)}</h4>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${roleClasses[user.role ?? ''] ?? 'bg-slate-500/10 text-slate-500'}`}
                  >
                    {user.role ?? 'patient'}
                  </span>
                </div>
                <div className="text-muted-foreground mt-1 flex flex-col gap-2 text-xs sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{user.email ?? 'No email'}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <div className="text-muted-foreground flex items-center gap-1 text-xs">
                <Calendar className="h-3 w-3" />
                <span>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : 'No date'}
                </span>
              </div>

              <Button variant="ghost" size="sm" className="ml-auto">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
  },
);

UsersTable.displayName = 'UsersTable';
