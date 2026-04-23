'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Activity, CalendarCheck, CreditCard, ShieldCheck, Stethoscope, Users } from 'lucide-react';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { UsersTable, type DashboardUser } from '@/components/ui/users-table';
import { QuickActions } from '@/components/ui/quick-actions';
import TodayScheduleTable from '@/components/ui/TodayScheduleTable';
import {
  RecentActivity,
  type DashboardAppointment,
} from '@/components/ui/recent-activity';
import { DashboardHeader } from '@/components/ui/dashboard-header';
import { AdminSidebar } from '@/components/ui/admin-sidebar';
import axios, { AxiosError } from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1';

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
};

type StaffMember = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  specialization?: string;
  isActive?: boolean;
};

type StatsResponse = {
  status?: { status: string; count: number }[];
  payments?: { paymentStatus: string; count: number }[];
  topStaff?: {
    staffId: string;
    name: string;
    role?: string;
    specialization?: string;
    count: number;
  }[];
};

const getStoredAdminToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token') ?? localStorage.getItem('ADMIN_TOKEN');
};

const getAuthHeaders = () => ({
  Authorization: `Bearer ${getStoredAdminToken()}`,
});

const getStaffName = (staff: StaffMember) => {
  const name = `${staff.firstName ?? ''} ${staff.lastName ?? ''}`.trim();
  return name || staff.email || 'Unnamed staff';
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { msg?: string; message?: string } | undefined;
    return data?.msg ?? data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

export default function AdminDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [todaySchedule, setTodaySchedule] = useState<DashboardAppointment[]>([]);
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [appointments, setAppointments] = useState<DashboardAppointment[]>([]);
  const [statsData, setStatsData] = useState<StatsResponse | null>(null);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const fetchDashboardData = useCallback(async () => {
    const token = getStoredAdminToken();
    if (!token) {
      router.replace('/Admin/AdminLogin');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const headers = getAuthHeaders();
      const [dashboardRes, adminRes, usersRes, staffRes, appointmentsRes, statsRes] =
        await Promise.all([
          axios.get(`${API_BASE_URL}/admin/dashboard`, { headers }),
          axios.get(`${API_BASE_URL}/admin/me`, { headers }),
          axios.get(`${API_BASE_URL}/admin/users`, {
            headers,
            params: { limit: 6, q: searchQuery || undefined },
          }),
          axios.get(`${API_BASE_URL}/admin/staff`, { headers, params: { limit: 5 } }),
          axios.get(`${API_BASE_URL}/admin/appointments`, {
            headers,
            params: { limit: 6 },
          }),
          axios.get(`${API_BASE_URL}/admin/stats`, { headers }),
        ]);

      setSummary(dashboardRes.data.summary);
      setTodaySchedule(dashboardRes.data.todaySchedule ?? []);
      setAdmin(adminRes.data.admin ?? null);
      setUsers(usersRes.data.items ?? []);
      setUsersTotal(usersRes.data.total ?? 0);
      setStaff(staffRes.data.items ?? []);
      setAppointments(appointmentsRes.data.items ?? []);
      setStatsData(statsRes.data ?? null);
    } catch (err: unknown) {
      console.error(err);
      if ((err as AxiosError).response?.status === 401) {
        router.replace('/Admin/AdminLogin');
      }
      setError(getApiErrorMessage(err, 'Failed to load admin dashboard'));
    } finally {
      setLoading(false);
    }
  }, [router, searchQuery]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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

  const handleAddUser = () => {
    router.push('/Admin/adduser');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // ✅ Error State
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
      change: `${usersTotal} listed`,
      changeType: 'positive' as const,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Staff',
      value: String(summary?.totalEmp ?? 0),
      change: `${staff.length} recent`,
      changeType: 'positive' as const,
      icon: Stethoscope,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Today Appointments',
      value: String(summary?.todayAppointments ?? 0),
      change: `${todaySchedule.length} loaded`,
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
      <AdminSidebar />
      <SidebarInset>
        <DashboardHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={handleRefresh}
          onExport={handleExport}
          isRefreshing={isRefreshing}
        />

        <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
          <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-lg p-3 sm:rounded-xl sm:p-4 md:p-6">
            <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
              <div className="px-2 sm:px-0">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome {adminName}
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Live clinic activity from users, staff, appointments, and payments.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                {stats.map((stat, index) => (
                  <DashboardCard key={stat.title} stat={stat} index={index} />
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
                <div className="space-y-4 sm:space-y-6 xl:col-span-2">
                  <TodayScheduleTable schedule={todaySchedule} />
                  <UsersTable
                    users={users}
                    total={usersTotal}
                    onAddUser={handleAddUser}
                  />
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <QuickActions
                    onAddUser={handleAddUser}
                    onViewAppointments={() => router.push('#appointments')}
                    onRefresh={handleRefresh}
                    onExport={handleExport}
                    isRefreshing={isRefreshing}
                  />

                  <RecentActivity appointments={appointments} />

                  <div className="border-border bg-card/40 rounded-xl border p-6">
                    <h3 className="mb-4 text-xl font-semibold">Active Staff</h3>
                    <div className="space-y-3">
                      {staff.length === 0 && (
                        <div className="border-border text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
                          No staff records found.
                        </div>
                      )}
                      {staff.map((member) => (
                        <div
                          key={member._id}
                          className="hover:bg-accent/50 flex items-center justify-between rounded-lg p-2 transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
                              {getStaffName(member)}
                            </div>
                            <div className="text-muted-foreground truncate text-xs">
                              {member.specialization || member.role || 'Staff'}
                            </div>
                          </div>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${
                              member.isActive === false
                                ? 'bg-red-500/10 text-red-500'
                                : 'bg-green-500/10 text-green-500'
                            }`}
                          >
                            {member.isActive === false ? 'Inactive' : 'Active'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
