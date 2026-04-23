'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CalendarPlus, Download, RefreshCw, UserPlus } from 'lucide-react';

interface QuickActionsProps {
  onAddUser: () => void;
  onViewAppointments?: () => void;
  onRefresh?: () => void;
  onExport: () => void;
  isRefreshing?: boolean;
}

const actions = [
  {
    icon: UserPlus,
    label: 'Add Patient',
    className: 'text-blue-500 hover:border-blue-500/50 hover:bg-blue-500/10',
    action: 'addUser',
  },
  {
    icon: CalendarPlus,
    label: 'View Appointments',
    className: 'text-emerald-500 hover:border-emerald-500/50 hover:bg-emerald-500/10',
    action: 'appointments',
  },
  {
    icon: Download,
    label: 'Export Dashboard',
    className: 'text-violet-500 hover:border-violet-500/50 hover:bg-violet-500/10',
    action: 'export',
  },
  {
    icon: RefreshCw,
    label: 'Refresh Data',
    className: 'text-orange-500 hover:border-orange-500/50 hover:bg-orange-500/10',
    action: 'refresh',
  },
];

export const QuickActions = memo(
  ({
    onAddUser,
    onViewAppointments,
    onRefresh,
    onExport,
    isRefreshing = false,
  }: QuickActionsProps) => {
    const handleAction = (action: string) => {
      switch (action) {
        case 'addUser':
          onAddUser();
          break;
        case 'appointments':
          onViewAppointments?.();
          break;
        case 'export':
          onExport();
          break;
        case 'refresh':
          onRefresh?.();
          break;
      }
    };

    return (
      <div className="border-border bg-card/40 rounded-xl border p-6">
        <h3 className="mb-4 text-xl font-semibold">Quick Actions</h3>
        <div className="space-y-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="h-12 w-full justify-start transition-all duration-200"
                  onClick={() => handleAction(action.action)}
                  disabled={action.action === 'refresh' && isRefreshing}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${action.className.split(' ')[0]} ${action.action === 'refresh' && isRefreshing ? 'animate-spin' : ''}`}
                  />
                  <span className="font-medium">{action.label}</span>
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  },
);

QuickActions.displayName = 'QuickActions';
