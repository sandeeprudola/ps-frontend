'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity,
  CalendarCheck,
  CreditCard,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react';

import { ActiveStaffCard } from '@/components/dashboard/admin/active-staff-card';
import { AdminAccessPanel } from '@/components/dashboard/admin/admin-access-panel';
import {
  AdminAnalyticsPanel,
} from '@/components/dashboard/admin/admin-analytics-panel';
import {
  AdminAppointmentManagement,
  type AdminAppointmentRecord,
} from '@/components/dashboard/admin/admin-appointment-management';
import {
  AdminStaffManagement,
  type AdminStaffRecord,
} from '@/components/dashboard/admin/admin-staff-management';
import {
  AdminUserManagement,
  type AdminUserRecord,
} from '@/components/dashboard/admin/admin-user-management';
import { AdminSidebar } from '@/components/ui/admin-sidebar';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { DashboardHeader } from '@/components/ui/dashboard-header';
import {
  RecentActivity,
  type DashboardAppointment,
} from '@/components/ui/recent-activity';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import TodayScheduleTable from '@/components/ui/TodayScheduleTable';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { api, getApiErrorMessage } from '@/lib/api';
import { clearStoredTokens, createAuthHeaders } from '@/lib/auth';

type DashboardSummary = {
  totalUsers: number;
  totalEmp: number;
  totalAdmins: number;
  totalAppointments: number;
  todayAppointments: number;
  pendingPayments: number;
};

type AdminProfile = {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  caninvite?: boolean;
};

type StatsResponse = {
  status?: { status: string; count: number }[];
  types?: { type: string; count: number }[];
  daily?: { date: string; count: number }[];
  topStaff?: {
    staffId: string;
    name: string;
    role?: string;
    specialization?: string;
    count: number;
  }[];
  payments?: { paymentStatus: string; count: number }[];
};

const getStaffName = (staff: AdminStaffRecord) => {
  const name = `${staff.firstName ?? ''} ${staff.lastName ?? ''}`.trim();
  return name || staff.email || 'Unnamed staff';
};

const isUnauthorizedError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'response' in error &&
  (error as { response?: { status?: number } }).response?.status === 401;

export default function AdminDashboard() {
  const router = useRouter();
  const { token, isCheckingAuth } = useAuthGuard({
    role: 'admin',
    redirectTo: '/Admin/AdminLogin',
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<DashboardAppointment[]>([]);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [staff, setStaff] = useState<AdminStaffRecord[]>([]);
  const [appointments, setAppointments] = useState<AdminAppointmentRecord[]>([]);
  const [statsData, setStatsData] = useState<StatsResponse | null>(null);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [savingStaffId, setSavingStaffId] = useState<string | null>(null);
  const [savingAppointmentId, setSavingAppointmentId] = useState<string | null>(null);
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const headers = createAuthHeaders('admin');
      const [dashboardRes, adminRes, usersRes, staffRes, appointmentsRes, statsRes] =
        await Promise.all([
          api.get('/admin/dashboard', { headers }),
          api.get('/admin/me', { headers }),
          api.get('/admin/users', {
            headers,
            params: { limit: 20, q: searchQuery || undefined },
          }),
          api.get('/admin/staff', {
            headers,
            params: { limit: 20, q: searchQuery || undefined },
          }),
          api.get('/admin/appointments', {
            headers,
            params: { limit: 20 },
          }),
          api.get('/admin/stats', { headers }),
        ]);

      setSummary(dashboardRes.data.summary);
      setTodaySchedule(dashboardRes.data.todaySchedule ?? []);
      setAdmin(adminRes.data.admin ?? null);
      setUsers(usersRes.data.items ?? []);
      setUsersTotal(usersRes.data.total ?? 0);
      setStaff(staffRes.data.items ?? []);
      setAppointments(appointmentsRes.data.items ?? []);
      setStatsData(statsRes.data ?? null);
    } catch (requestError: unknown) {
      if (isUnauthorizedError(requestError)) {
        clearStoredTokens();
        router.replace('/Admin/AdminLogin');
      }
      setError(getApiErrorMessage(requestError, 'Failed to load admin dashboard'));
    } finally {
      setLoading(false);
    }
  }, [router, searchQuery, token]);

  useEffect(() => {
    if (!token) return;
    fetchDashboardData();
  }, [fetchDashboardData, token]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
  };

  const handleExport = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Users', summary?.totalUsers ?? 0],
      ['Total Staff', summary?.totalEmp ?? 0],
      ['Total Admins', summary?.totalAdmins ?? 0],
      ['Total Appointments', summary?.totalAppointments ?? 0],
      ['Today Appointments', summary?.todayAppointments ?? 0],
      ['Pending Payments', summary?.pendingPayments ?? 0],
    ];

    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-dashboard-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    clearStoredTokens();
    router.replace('/Admin/AdminLogin');
  };

  const updateUser = async (
    id: string,
    payload: {
      firstName: string;
      lastName: string;
      role: string;
      HearingServices: string;
      SpeechServices: string;
    },
  ) => {
    try {
      setSavingUserId(id);
      setActionMessage(null);

      const response = await api.put(`/admin/users/${id}`, payload, {
        headers: createAuthHeaders('admin'),
      });

      setUsers((current) =>
        current.map((item) => (item._id === id ? response.data.user ?? item : item)),
      );
      setActionMessage('User updated successfully.');
    } catch (requestError: unknown) {
      if (isUnauthorizedError(requestError)) {
        handleLogout();
        return;
      }
      setActionMessage(getApiErrorMessage(requestError, 'Failed to update user.'));
    } finally {
      setSavingUserId(null);
    }
  };

  const updateStaff = async (
    id: string,
    payload: {
      firstName: string;
      lastName: string;
      phone: string;
      role: string;
      specialization: string;
      isActive: boolean;
    },
  ) => {
    try {
      setSavingStaffId(id);
      setActionMessage(null);

      const response = await api.put(`/admin/staff/${id}`, payload, {
        headers: createAuthHeaders('admin'),
      });

      setStaff((current) =>
        current.map((item) => (item._id === id ? response.data.staff ?? item : item)),
      );
      setActionMessage('Staff updated successfully.');
    } catch (requestError: unknown) {
      if (isUnauthorizedError(requestError)) {
        handleLogout();
        return;
      }
      setActionMessage(getApiErrorMessage(requestError, 'Failed to update staff.'));
    } finally {
      setSavingStaffId(null);
    }
  };

  const updateAppointment = async (
    id: string,
    payload: {
      appointmentdate: string;
      status: string;
      appointmentType: string;
      priority: string;
      paymentStatus: string;
      duration: string;
      notes: string;
    },
  ) => {
    try {
      setSavingAppointmentId(id);
      setActionMessage(null);

      const response = await api.put(
        `/admin/appointments/${id}`,
        {
          ...payload,
          duration: Number(payload.duration),
          appointmentdate: payload.appointmentdate
            ? new Date(payload.appointmentdate).toISOString()
            : undefined,
        },
        {
          headers: createAuthHeaders('admin'),
        },
      );

      setAppointments((current) =>
        current.map((item) =>
          item._id === id ? response.data.appointment ?? item : item,
        ),
      );
      setActionMessage('Appointment updated successfully.');
    } catch (requestError: unknown) {
      if (isUnauthorizedError(requestError)) {
        handleLogout();
        return;
      }
      setActionMessage(
        getApiErrorMessage(requestError, 'Failed to update appointment.'),
      );
    } finally {
      setSavingAppointmentId(null);
    }
  };

  const createAdmin = async (payload: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'admin' | 'super-admin';
    caninvite: boolean;
  }) => {
    try {
      setCreatingAdmin(true);
      setActionMessage(null);
      await api.post('/admin/signup', payload, {
        headers: createAuthHeaders('admin'),
      });
      setActionMessage('Admin account created successfully.');
      await fetchDashboardData();
    } catch (requestError: unknown) {
      if (isUnauthorizedError(requestError)) {
        handleLogout();
        return;
      }
      setActionMessage(getApiErrorMessage(requestError, 'Failed to create admin.'));
    } finally {
      setCreatingAdmin(false);
    }
  };

  const filteredAppointments = useMemo(() => {
    if (!searchQuery) return appointments;
    const normalized = searchQuery.toLowerCase();
    return appointments.filter((appointment) => {
      const patientName = `${appointment.patient?.firstName ?? ''} ${appointment.patient?.lastName ?? ''}`.toLowerCase();
      const staffName = `${appointment.staff?.firstName ?? ''} ${appointment.staff?.lastName ?? ''}`.toLowerCase();
      return (
        patientName.includes(normalized) ||
        staffName.includes(normalized) ||
        String(appointment.status ?? '').toLowerCase().includes(normalized) ||
        String(appointment.appointmentType ?? '').toLowerCase().includes(normalized) ||
        String(appointment.paymentStatus ?? '').toLowerCase().includes(normalized)
      );
    });
  }, [appointments, searchQuery]);

  if (isCheckingAuth || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  const adminName =
    admin?.firstName || admin?.username || admin?.email || 'Admin';

  const completedAppointments =
    statsData?.status?.find((item) => item.status === 'completed')?.count ?? 0;

  const stats = [
    {
      title: 'Total Users',
      value: String(summary?.totalUsers ?? 0),
      change: `${usersTotal} loaded`,
      changeType: 'positive' as const,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Staff',
      value: String(summary?.totalEmp ?? 0),
      change: `${staff.length} in panel`,
      changeType: 'positive' as const,
      icon: Stethoscope,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Today Appointments',
      value: String(summary?.todayAppointments ?? 0),
      change: `${todaySchedule.length} shown`,
      changeType: 'positive' as const,
      icon: Activity,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Pending Payments',
      value: String(summary?.pendingPayments ?? 0),
      change: 'needs follow-up',
      changeType: 'negative' as const,
      icon: CreditCard,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Total Appointments',
      value: String(summary?.totalAppointments ?? 0),
      change: `${completedAppointments} completed`,
      changeType: 'positive' as const,
      icon: CalendarCheck,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Admins',
      value: String(summary?.totalAdmins ?? 0),
      change: admin?.role ?? 'active',
      changeType: 'positive' as const,
      icon: ShieldCheck,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  return (
    <SidebarProvider>
      <AdminSidebar
        adminName={adminName}
        adminRole={admin?.role}
        onLogout={handleLogout}
      />
      <SidebarInset className="bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_28%),linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)]">
        <DashboardHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={handleRefresh}
          onExport={handleExport}
          isRefreshing={isRefreshing}
        />

        <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <section
            id="overview"
            className="rounded-[1.9rem] border border-slate-200 bg-white/85 p-6 shadow-[0_25px_70px_-35px_rgba(15,23,42,0.35)] backdrop-blur"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Command Center
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Welcome back, {adminName}
                </h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                  This panel now covers dashboard analytics, patient updates, staff
                  management, appointment editing, and admin access controls from the
                  backend admin routes.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white shadow-lg shadow-slate-300">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-300">
                  Search scope
                </div>
                <div className="mt-1 text-sm font-medium">
                  Users, staff, and appointments
                </div>
              </div>
            </div>

            {actionMessage ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {actionMessage}
              </div>
            ) : null}

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
              {stats.map((stat, index) => (
                <DashboardCard key={stat.title} stat={stat} index={index} />
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <TodayScheduleTable schedule={todaySchedule} />
            <div className="space-y-6">
              <RecentActivity appointments={appointments as DashboardAppointment[]} />
              <ActiveStaffCard staff={staff} getStaffName={getStaffName} />
            </div>
          </div>

          <AdminAnalyticsPanel
            status={statsData?.status ?? []}
            types={statsData?.types ?? []}
            payments={statsData?.payments ?? []}
            daily={statsData?.daily ?? []}
            topStaff={statsData?.topStaff ?? []}
          />

          <AdminUserManagement
            users={users}
            total={usersTotal}
            onSave={updateUser}
            savingId={savingUserId}
          />

          <AdminStaffManagement
            staff={staff}
            onSave={updateStaff}
            savingId={savingStaffId}
          />

          <AdminAppointmentManagement
            appointments={filteredAppointments}
            onSave={updateAppointment}
            savingId={savingAppointmentId}
          />

          <AdminAccessPanel
            currentRole={admin?.role}
            canInvite={admin?.caninvite}
            onCreateAdmin={createAdmin}
            creating={creatingAdmin}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
