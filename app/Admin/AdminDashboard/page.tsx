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
  AdminAttendancePanel,
  type AdminAttendanceRecord,
  type AdminAttendanceSummary,
  type AdminAttendanceTodayStatus,
  type AttendanceCorrectionPayload,
} from '@/components/dashboard/admin/admin-attendance-panel';
import {
  AdminAnalyticsPanel,
} from '@/components/dashboard/admin/admin-analytics-panel';
import {
  AdminInventoryPanel,
  type InventoryItemRecord,
  type InventoryLogRecord,
} from '@/components/dashboard/admin/admin-inventory-panel';
import {
  AdminLeadsPanel,
  type AdminLeadConversionDraft,
  type AdminLeadDraft,
  type AdminLeadRecord,
} from '@/components/dashboard/admin/admin-leads-panel';
import {
  AdminReportsPanel,
  type AdminMonthlyReport,
} from '@/components/dashboard/admin/admin-reports-panel';
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
  const pageSize = 6;
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
  const [staffTotal, setStaffTotal] = useState(0);
  const [attendanceRecords, setAttendanceRecords] = useState<AdminAttendanceRecord[]>([]);
  const [attendanceToday, setAttendanceToday] = useState<AdminAttendanceTodayStatus[]>([]);
  const [attendanceSummary, setAttendanceSummary] =
    useState<AdminAttendanceSummary | null>(null);
  const [attendanceTotal, setAttendanceTotal] = useState(0);
  const [appointments, setAppointments] = useState<AdminAppointmentRecord[]>([]);
  const [appointmentsTotal, setAppointmentsTotal] = useState(0);
  const [inventoryItems, setInventoryItems] = useState<InventoryItemRecord[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLogRecord[]>([]);
  const [leads, setLeads] = useState<AdminLeadRecord[]>([]);
  const [leadsTotal, setLeadsTotal] = useState(0);
  const currentDate = new Date();
  const [reportYear, setReportYear] = useState(currentDate.getFullYear());
  const [reportMonth, setReportMonth] = useState(currentDate.getMonth() + 1);
  const [reportData, setReportData] = useState<AdminMonthlyReport | null>(null);
  const [statsData, setStatsData] = useState<StatsResponse | null>(null);
  const [admin, setAdmin] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [savingStaffId, setSavingStaffId] = useState<string | null>(null);
  const [savingAttendanceId, setSavingAttendanceId] = useState<string | null>(null);
  const [savingAppointmentId, setSavingAppointmentId] = useState<string | null>(null);
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null);
  const [convertingLeadId, setConvertingLeadId] = useState<string | null>(null);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [creatingLead, setCreatingLead] = useState(false);
  const [creatingInventoryItem, setCreatingInventoryItem] = useState(false);
  const [loggingInventory, setLoggingInventory] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [usersPage, setUsersPage] = useState(1);
  const [staffPage, setStaffPage] = useState(1);
  const [attendancePage, setAttendancePage] = useState(1);
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [leadsPage, setLeadsPage] = useState(1);

  useEffect(() => {
    setUsersPage(1);
    setStaffPage(1);
    setAttendancePage(1);
    setAppointmentsPage(1);
    setLeadsPage(1);
  }, [searchQuery]);

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const headers = createAuthHeaders('admin');
      const [
        dashboardRes,
        adminRes,
        usersRes,
        staffRes,
        attendanceRes,
        appointmentsRes,
        statsRes,
        inventoryItemsRes,
        inventoryLogsRes,
        leadsRes,
        reportRes,
      ] =
        await Promise.all([
          api.get('/admin/dashboard', { headers }),
          api.get('/admin/me', { headers }),
          api.get('/admin/users', {
            headers,
            params: { page: usersPage, limit: pageSize, q: searchQuery || undefined },
          }),
          api.get('/admin/staff', {
            headers,
            params: { page: staffPage, limit: pageSize, q: searchQuery || undefined },
          }),
          api.get('/attendance/admin/list', {
            headers,
            params: {
              page: attendancePage,
              limit: pageSize,
              q: searchQuery || undefined,
            },
          }),
          api.get('/admin/appointments', {
            headers,
            params: { page: appointmentsPage, limit: pageSize },
          }),
          api.get('/admin/stats', { headers }),
          api.get('/inventory/items', { headers }),
          api.get('/inventory/logs', { headers, params: { limit: 12 } }),
          api.get('/leads', {
            headers,
            params: { page: leadsPage, limit: pageSize, q: searchQuery || undefined },
          }),
          api.get('/reports/monthly', {
            headers,
            params: { year: reportYear, month: reportMonth },
          }),
        ]);

      setSummary(dashboardRes.data.summary);
      setTodaySchedule(dashboardRes.data.todaySchedule ?? []);
      setAdmin(adminRes.data.admin ?? null);
      setUsers(usersRes.data.items ?? []);
      setUsersTotal(usersRes.data.total ?? 0);
      setStaff(staffRes.data.items ?? []);
      setStaffTotal(staffRes.data.total ?? 0);
      setAttendanceRecords(attendanceRes.data.items ?? []);
      setAttendanceToday(attendanceRes.data.todayStatus ?? []);
      setAttendanceSummary(attendanceRes.data.summary ?? null);
      setAttendanceTotal(attendanceRes.data.total ?? 0);
      setAppointments(appointmentsRes.data.items ?? []);
      setAppointmentsTotal(appointmentsRes.data.total ?? 0);
      setInventoryItems(inventoryItemsRes.data.items ?? []);
      setInventoryLogs(inventoryLogsRes.data.logs ?? []);
      setLeads(leadsRes.data.items ?? []);
      setLeadsTotal(leadsRes.data.total ?? 0);
      setReportData(reportRes.data ?? null);
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
  }, [
    appointmentsPage,
    attendancePage,
    leadsPage,
    pageSize,
    reportMonth,
    reportYear,
    router,
    searchQuery,
    staffPage,
    token,
    usersPage,
  ]);

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

  const markEmployeeAbsent = async (employeeId: string, reason: string) => {
    try {
      setSavingAttendanceId(employeeId);
      setActionMessage(null);

      await api.post(
        '/attendance/admin/mark-absent',
        { employeeId, reason },
        { headers: createAuthHeaders('admin') },
      );

      setActionMessage('Employee marked absent.');
      await fetchDashboardData();
    } catch (requestError: unknown) {
      if (isUnauthorizedError(requestError)) {
        handleLogout();
        return;
      }
      setActionMessage(getApiErrorMessage(requestError, 'Failed to mark absent.'));
    } finally {
      setSavingAttendanceId(null);
    }
  };

  const correctAttendance = async (
    id: string,
    payload: AttendanceCorrectionPayload,
  ) => {
    try {
      setSavingAttendanceId(id);
      setActionMessage(null);

      await api.put(
        `/attendance/admin/attendance/${id}`,
        {
          status: payload.status,
          checkInTime: payload.checkInTime
            ? new Date(payload.checkInTime).toISOString()
            : undefined,
          checkOutTime: payload.checkOutTime
            ? new Date(payload.checkOutTime).toISOString()
            : undefined,
          overrideReason: payload.overrideReason || undefined,
          note: payload.note || undefined,
        },
        { headers: createAuthHeaders('admin') },
      );

      setActionMessage('Attendance corrected successfully.');
      await fetchDashboardData();
    } catch (requestError: unknown) {
      if (isUnauthorizedError(requestError)) {
        handleLogout();
        return;
      }
      setActionMessage(
        getApiErrorMessage(requestError, 'Failed to correct attendance.'),
      );
    } finally {
      setSavingAttendanceId(null);
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

  const createInventoryItem = async (payload: {
    name: string;
    sku: string;
    category: string;
    unit: string;
    currentQty: number;
    isActive: boolean;
  }) => {
    try {
      setCreatingInventoryItem(true);
      setActionMessage(null);

      const response = await api.post('/inventory/items', payload, {
        headers: createAuthHeaders('admin'),
      });

      setInventoryItems((current) => [response.data.item, ...current]);
      setActionMessage('Inventory item created successfully.');
    } catch (requestError: unknown) {
      if (isUnauthorizedError(requestError)) {
        handleLogout();
        return;
      }
      setActionMessage(
        getApiErrorMessage(requestError, 'Failed to create inventory item.'),
      );
    } finally {
      setCreatingInventoryItem(false);
    }
  };

  const logInventoryIn = async (payload: {
    itemId: string;
    sku: string;
    quantity: number;
    note: string;
  }) => {
    try {
      setLoggingInventory(true);
      setActionMessage(null);

      const response = await api.post('/inventory/admin/log-in', payload, {
        headers: createAuthHeaders('admin'),
      });

      setInventoryItems((current) =>
        current.map((item) =>
          item._id === response.data.item?._id ? response.data.item : item,
        ),
      );
      setInventoryLogs((current) => [response.data.log, ...current].slice(0, 12));
      setActionMessage('Inventory logged successfully.');
    } catch (requestError: unknown) {
      if (isUnauthorizedError(requestError)) {
        handleLogout();
        return;
      }
      setActionMessage(
        getApiErrorMessage(requestError, 'Failed to log inventory entry.'),
      );
    } finally {
      setLoggingInventory(false);
    }
  };

  const prepareLeadPayload = (payload: AdminLeadDraft) => ({
    firstName: payload.firstName,
    lastName: payload.lastName || undefined,
    phone: payload.phone,
    email: payload.email || undefined,
    interest: payload.interest,
    source: payload.source || undefined,
    status: payload.status || undefined,
    assignedTo: payload.assignedTo || undefined,
    nextFollowUpDate: payload.nextFollowUpDate
      ? new Date(payload.nextFollowUpDate).toISOString()
      : undefined,
    notes: payload.notes || undefined,
    lostReason: payload.lostReason || undefined,
  });

  const createLead = async (payload: AdminLeadDraft) => {
    try {
      setCreatingLead(true);
      setActionMessage(null);

      const response = await api.post('/leads', prepareLeadPayload(payload), {
        headers: createAuthHeaders('admin'),
      });

      setLeads((current) => [response.data.lead, ...current].slice(0, pageSize));
      setLeadsTotal((current) => current + 1);
      setActionMessage('Lead created successfully.');
    } catch (requestError: unknown) {
      if (isUnauthorizedError(requestError)) {
        handleLogout();
        return;
      }
      setActionMessage(getApiErrorMessage(requestError, 'Failed to create lead.'));
    } finally {
      setCreatingLead(false);
    }
  };

  const updateLead = async (id: string, payload: AdminLeadDraft) => {
    try {
      setSavingLeadId(id);
      setActionMessage(null);

      const response = await api.put(`/leads/${id}`, prepareLeadPayload(payload), {
        headers: createAuthHeaders('admin'),
      });

      setLeads((current) =>
        current.map((item) => (item._id === id ? response.data.lead ?? item : item)),
      );
      setActionMessage('Lead updated successfully.');
    } catch (requestError: unknown) {
      if (isUnauthorizedError(requestError)) {
        handleLogout();
        return;
      }
      setActionMessage(getApiErrorMessage(requestError, 'Failed to update lead.'));
    } finally {
      setSavingLeadId(null);
    }
  };

  const convertLead = async (id: string, payload: AdminLeadConversionDraft) => {
    try {
      setConvertingLeadId(id);
      setActionMessage(null);

      const response = await api.post(
        `/leads/${id}/convert`,
        {
          username: payload.username || undefined,
          email: payload.email || undefined,
          password: payload.password || undefined,
          role: payload.role,
          HearingServices: payload.HearingServices,
          SpeechServices: payload.SpeechServices,
        },
        {
          headers: createAuthHeaders('admin'),
        },
      );

      setLeads((current) =>
        current.map((item) => (item._id === id ? response.data.lead ?? item : item)),
      );
      setActionMessage(
        response.data.temporaryPassword
          ? `Lead converted. Temporary password: ${response.data.temporaryPassword}`
          : 'Lead converted successfully.',
      );
      await fetchDashboardData();
    } catch (requestError: unknown) {
      if (isUnauthorizedError(requestError)) {
        handleLogout();
        return;
      }
      setActionMessage(getApiErrorMessage(requestError, 'Failed to convert lead.'));
    } finally {
      setConvertingLeadId(null);
    }
  };

  const fetchReport = async () => {
    try {
      setLoadingReport(true);
      setActionMessage(null);
      const response = await api.get('/reports/monthly', {
        headers: createAuthHeaders('admin'),
        params: { year: reportYear, month: reportMonth },
      });
      setReportData(response.data ?? null);
      setActionMessage('Report loaded successfully.');
    } catch (requestError: unknown) {
      if (isUnauthorizedError(requestError)) {
        handleLogout();
        return;
      }
      setActionMessage(getApiErrorMessage(requestError, 'Failed to load report.'));
    } finally {
      setLoadingReport(false);
    }
  };

  const exportReport = () => {
    const revenue = reportData?.revenue;
    const conversion = reportData?.conversion;
    const rows = [
      ['Metric', 'Value'],
      ['Report Month', `${reportYear}-${String(reportMonth).padStart(2, '0')}`],
      ['Total Revenue', revenue?.totalRevenue ?? 0],
      ['Payment Count', revenue?.paymentCount ?? 0],
      ['Total Sales Value', revenue?.totalSalesValue ?? 0],
      ['Total Paid On Sales', revenue?.totalPaidOnSales ?? 0],
      ['Total Due', revenue?.totalDue ?? 0],
      ['Lead Count', conversion?.leadCount ?? 0],
      ['Converted Lead Count', conversion?.convertedLeadCount ?? 0],
      ['Lead To Patient Rate', conversion?.leadToPatientRate ?? 0],
      ['New Patients', conversion?.newPatients ?? 0],
      ['Sales Count', conversion?.salesCount ?? 0],
      ['Appointment Count', conversion?.appointmentCount ?? 0],
    ];

    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `admin-report-${reportYear}-${String(reportMonth).padStart(2, '0')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
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

  const usersTotalPages = Math.max(1, Math.ceil(usersTotal / pageSize));
  const staffTotalPages = Math.max(1, Math.ceil(staffTotal / pageSize));
  const attendanceTotalPages = Math.max(1, Math.ceil(attendanceTotal / pageSize));
  const appointmentsTotalPages = Math.max(1, Math.ceil(appointmentsTotal / pageSize));
  const leadsTotalPages = Math.max(1, Math.ceil(leadsTotal / pageSize));

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
    {
      title: 'Leads',
      value: String(leadsTotal),
      change: `${leads.length} in panel`,
      changeType: 'positive' as const,
      icon: Users,
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
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
                  management, appointment editing, leads, inventory, reports, and admin
                  access controls from the backend routes.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white shadow-lg shadow-slate-300">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-300">
                  Search scope
                </div>
                <div className="mt-1 text-sm font-medium">
                  Users, staff, appointments, and leads
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
            currentPage={usersPage}
            totalPages={usersTotalPages}
            onSave={updateUser}
            onPageChange={setUsersPage}
            savingId={savingUserId}
          />

          <AdminStaffManagement
            staff={staff}
            total={staffTotal}
            currentPage={staffPage}
            totalPages={staffTotalPages}
            onSave={updateStaff}
            onPageChange={setStaffPage}
            savingId={savingStaffId}
          />

          <AdminAttendancePanel
            records={attendanceRecords}
            todayStatus={attendanceToday}
            summary={attendanceSummary}
            total={attendanceTotal}
            currentPage={attendancePage}
            totalPages={attendanceTotalPages}
            onPageChange={setAttendancePage}
            onMarkAbsent={markEmployeeAbsent}
            onCorrect={correctAttendance}
            savingId={savingAttendanceId}
          />

          <AdminAppointmentManagement
            appointments={filteredAppointments}
            total={appointmentsTotal}
            currentPage={appointmentsPage}
            totalPages={appointmentsTotalPages}
            onSave={updateAppointment}
            onPageChange={setAppointmentsPage}
            savingId={savingAppointmentId}
          />

          <AdminLeadsPanel
            leads={leads}
            staff={staff}
            total={leadsTotal}
            currentPage={leadsPage}
            totalPages={leadsTotalPages}
            onCreate={createLead}
            onSave={updateLead}
            onConvert={convertLead}
            onPageChange={setLeadsPage}
            creating={creatingLead}
            savingId={savingLeadId}
            convertingId={convertingLeadId}
          />

          <AdminInventoryPanel
            items={inventoryItems}
            logs={inventoryLogs}
            loading={loading}
            onCreateItem={createInventoryItem}
            onLogInventory={logInventoryIn}
            creatingItem={creatingInventoryItem}
            loggingInventory={loggingInventory}
          />

          <AdminReportsPanel
            report={reportData}
            year={reportYear}
            month={reportMonth}
            loading={loadingReport}
            onYearChange={setReportYear}
            onMonthChange={setReportMonth}
            onRefresh={fetchReport}
            onExport={exportReport}
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
