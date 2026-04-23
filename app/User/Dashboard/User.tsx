'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  CalendarDays,
  CreditCard,
  FileClock,
  Receipt,
  Save,
  ShieldCheck,
  UserCircle2,
  Wrench,
} from 'lucide-react';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/ui/dashboard-header';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserSidebar } from '@/components/ui/user-sidebar';
import { useRouter } from 'next/navigation';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000/api/v1';

type StaffRef = {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  specialization?: string;
};

type UserAccount = {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  HearingServices?: string;
  SpeechServices?: string;
};

type PatientProfile = {
  phone?: string;
  alternatePhone?: string;
  gender?: string;
  dob?: string;
  guardianName?: string;
  relationWithPatient?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  leadSource?: string;
  referredBy?: string;
  primaryConcern?: string;
  diagnosis?: string;
  medicalHistory?: string;
  clinicalNotes?: string;
  assignedTherapist?: StaffRef | string;
  assignedAudiologist?: StaffRef | string;
  caseStatus?: string;
  nextFollowUpDate?: string;
};

type Appointment = {
  _id: string;
  appointmentdate: string;
  status?: string;
  appointmentType?: string;
  priority?: string;
  paymentStatus?: string;
  staff?: StaffRef;
  notes?: string;
};

type Sale = {
  _id: string;
  brand: string;
  model: string;
  serialNumber?: string;
  saleDate: string;
  finalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentMode: string;
  soldByEmp?: StaffRef;
};

type Payment = {
  _id: string;
  amount: number;
  method: string;
  referenceNumber?: string;
  paidAt: string;
  sale?: {
    brand?: string;
    model?: string;
    serialNumber?: string;
    finalAmount?: number;
    paidAmount?: number;
    dueAmount?: number;
    paymentMode?: string;
  };
  collectedByEmp?: StaffRef;
  collectedByAdmin?: StaffRef;
};

type ServiceTicket = {
  _id: string;
  title: string;
  type: string;
  priority?: string;
  status?: string;
  dueDate?: string;
  sale?: {
    brand?: string;
    model?: string;
    serialNumber?: string;
  };
  assignedTo?: StaffRef;
};

type EmiInstallment = {
  _id: string;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: string;
  paidAt?: string;
  sale?: {
    brand?: string;
    model?: string;
    serialNumber?: string;
    finalAmount?: number;
    paidAmount?: number;
    dueAmount?: number;
    paymentMode?: string;
  };
};

type DashboardResponse = {
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  };
  nextAppointment?: Appointment | null;
  totalAppointments: number;
};

type UserMeResponse = {
  user: UserAccount;
  profile?: PatientProfile | null;
};

type SearchableValue = string | number | undefined | null;

type ApiErrorData = {
  msg?: string;
  message?: string;
};

const getStoredUserToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

const authHeaders = () => ({
  Authorization: `Bearer ${getStoredUserToken()}`,
});

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorData | undefined;
    return data?.msg ?? data?.message ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const fullName = (person?: StaffRef | null) => {
  const value = `${person?.firstName ?? ''} ${person?.lastName ?? ''}`.trim();
  return value || person?.email || 'Not assigned';
};

const formatCurrency = (value: number | undefined) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : '-';

const formatDateTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString([], {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '-';

const toDateInput = (value?: string) =>
  value ? new Date(value).toISOString().slice(0, 10) : '';

const toIsoDate = (value: string) =>
  value ? new Date(`${value}T00:00:00`).toISOString() : undefined;

const matchesSearch = (query: string, values: SearchableValue[]) => {
  if (!query) return true;
  const normalized = query.toLowerCase();
  return values.some((value) =>
    String(value ?? '')
      .toLowerCase()
      .includes(normalized),
  );
};

export default function UserDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [accountMessage, setAccountMessage] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [emiInstallments, setEmiInstallments] = useState<EmiInstallment[]>([]);

  const [accountForm, setAccountForm] = useState({
    username: '',
    firstName: '',
    lastName: '',
  });

  const [profileForm, setProfileForm] = useState({
    phone: '',
    alternatePhone: '',
    gender: '',
    dob: '',
    guardianName: '',
    relationWithPatient: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    leadSource: '',
    referredBy: '',
    primaryConcern: '',
    diagnosis: '',
    medicalHistory: '',
    clinicalNotes: '',
    caseStatus: '',
    nextFollowUpDate: '',
  });

  const applyUserData = useCallback((data: UserMeResponse) => {
    setUser(data.user);
    setProfile(data.profile ?? null);
    setAccountForm({
      username: data.user.username ?? '',
      firstName: data.user.firstName ?? '',
      lastName: data.user.lastName ?? '',
    });
    setProfileForm({
      phone: data.profile?.phone ?? '',
      alternatePhone: data.profile?.alternatePhone ?? '',
      gender: data.profile?.gender ?? '',
      dob: toDateInput(data.profile?.dob),
      guardianName: data.profile?.guardianName ?? '',
      relationWithPatient: data.profile?.relationWithPatient ?? '',
      emergencyContactName: data.profile?.emergencyContactName ?? '',
      emergencyContactPhone: data.profile?.emergencyContactPhone ?? '',
      addressLine1: data.profile?.addressLine1 ?? '',
      addressLine2: data.profile?.addressLine2 ?? '',
      city: data.profile?.city ?? '',
      state: data.profile?.state ?? '',
      pincode: data.profile?.pincode ?? '',
      leadSource: data.profile?.leadSource ?? '',
      referredBy: data.profile?.referredBy ?? '',
      primaryConcern: data.profile?.primaryConcern ?? '',
      diagnosis: data.profile?.diagnosis ?? '',
      medicalHistory: data.profile?.medicalHistory ?? '',
      clinicalNotes: data.profile?.clinicalNotes ?? '',
      caseStatus: data.profile?.caseStatus ?? '',
      nextFollowUpDate: toDateInput(data.profile?.nextFollowUpDate),
    });
  }, []);

  const fetchData = useCallback(async () => {
    const token = getStoredUserToken();
    if (!token) {
      router.replace('/User/Login');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const headers = authHeaders();
      const [
        dashboardRes,
        meRes,
        appointmentsRes,
        salesRes,
        paymentsRes,
        ticketsRes,
        emiRes,
      ] = await Promise.all([
        axios.get<DashboardResponse>(`${API_BASE_URL}/user/dashboard`, { headers }),
        axios.get<UserMeResponse>(`${API_BASE_URL}/user/me`, { headers }),
        axios.get<{ appointments: Appointment[] }>(`${API_BASE_URL}/user/appointments`, { headers }),
        axios.get<{ sales: Sale[] }>(`${API_BASE_URL}/user/sales`, { headers }),
        axios.get<{ payments: Payment[] }>(`${API_BASE_URL}/user/payments`, { headers }),
        axios.get<{ tickets: ServiceTicket[] }>(`${API_BASE_URL}/user/service-tickets`, { headers }),
        axios.get<{ installments: EmiInstallment[] }>(`${API_BASE_URL}/user/emi-installments`, { headers }),
      ]);

      setDashboard(dashboardRes.data);
      applyUserData(meRes.data);
      setAppointments(appointmentsRes.data.appointments ?? []);
      setSales(salesRes.data.sales ?? []);
      setPayments(paymentsRes.data.payments ?? []);
      setTickets(ticketsRes.data.tickets ?? []);
      setEmiInstallments(emiRes.data.installments ?? []);
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
        router.replace('/User/Login');
      }
      setError(getApiErrorMessage(requestError, 'Failed to load user dashboard'));
    } finally {
      setLoading(false);
    }
  }, [applyUserData, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  const handleExport = () => {
    const payload = {
      user,
      profile,
      appointments,
      sales,
      payments,
      tickets,
      emiInstallments,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `user-dashboard-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAccountChange = (field: keyof typeof accountForm, value: string) => {
    setAccountForm((current) => ({ ...current, [field]: value }));
  };

  const handleProfileChange = (field: keyof typeof profileForm, value: string) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
  };

  const saveAccount = async () => {
    try {
      setSavingAccount(true);
      setAccountMessage(null);
      await axios.put(
        `${API_BASE_URL}/user/update`,
        accountForm,
        { headers: authHeaders() },
      );

      setUser((current) =>
        current
          ? {
              ...current,
              username: accountForm.username,
              firstName: accountForm.firstName,
              lastName: accountForm.lastName,
            }
          : current,
      );
      setAccountMessage('Account details updated.');
    } catch (requestError: unknown) {
      setAccountMessage(getApiErrorMessage(requestError, 'Failed to update account.'));
    } finally {
      setSavingAccount(false);
    }
  };

  const saveProfile = async () => {
    const payload = {
      phone: profileForm.phone || undefined,
      alternatePhone: profileForm.alternatePhone || undefined,
      gender: profileForm.gender || undefined,
      dob: profileForm.dob ? toIsoDate(profileForm.dob) : undefined,
      guardianName: profileForm.guardianName || undefined,
      relationWithPatient: profileForm.relationWithPatient || undefined,
      emergencyContactName: profileForm.emergencyContactName || undefined,
      emergencyContactPhone: profileForm.emergencyContactPhone || undefined,
      addressLine1: profileForm.addressLine1 || undefined,
      addressLine2: profileForm.addressLine2 || undefined,
      city: profileForm.city || undefined,
      state: profileForm.state || undefined,
      pincode: profileForm.pincode || undefined,
      leadSource: profileForm.leadSource || undefined,
      referredBy: profileForm.referredBy || undefined,
      primaryConcern: profileForm.primaryConcern || undefined,
      diagnosis: profileForm.diagnosis || undefined,
      medicalHistory: profileForm.medicalHistory || undefined,
      clinicalNotes: profileForm.clinicalNotes || undefined,
      caseStatus: profileForm.caseStatus || undefined,
      nextFollowUpDate: profileForm.nextFollowUpDate
        ? toIsoDate(profileForm.nextFollowUpDate)
        : undefined,
    };

    try {
      setSavingProfile(true);
      setProfileMessage(null);
      const response = await axios.put<{ profile: PatientProfile }>(
        `${API_BASE_URL}/user/profile`,
        payload,
        { headers: authHeaders() },
      );

      setProfile(response.data.profile);
      setProfileMessage('Profile saved successfully.');
    } catch (requestError: unknown) {
      setProfileMessage(getApiErrorMessage(requestError, 'Failed to save profile.'));
    } finally {
      setSavingProfile(false);
    }
  };

  const filteredAppointments = useMemo(
    () =>
      appointments.filter((appointment) =>
        matchesSearch(searchQuery, [
          appointment.status,
          appointment.appointmentType,
          appointment.priority,
          appointment.staff?.firstName,
          appointment.staff?.lastName,
          appointment.staff?.specialization,
        ]),
      ),
    [appointments, searchQuery],
  );

  const filteredSales = useMemo(
    () =>
      sales.filter((sale) =>
        matchesSearch(searchQuery, [
          sale.brand,
          sale.model,
          sale.serialNumber,
          sale.paymentMode,
        ]),
      ),
    [sales, searchQuery],
  );

  const filteredPayments = useMemo(
    () =>
      payments.filter((payment) =>
        matchesSearch(searchQuery, [
          payment.method,
          payment.referenceNumber,
          payment.sale?.brand,
          payment.sale?.model,
        ]),
      ),
    [payments, searchQuery],
  );

  const filteredTickets = useMemo(
    () =>
      tickets.filter((ticket) =>
        matchesSearch(searchQuery, [
          ticket.title,
          ticket.type,
          ticket.status,
          ticket.priority,
          ticket.sale?.brand,
          ticket.sale?.model,
        ]),
      ),
    [tickets, searchQuery],
  );

  const filteredEmi = useMemo(
    () =>
      emiInstallments.filter((installment) =>
        matchesSearch(searchQuery, [
          installment.installmentNumber,
          installment.status,
          installment.sale?.brand,
          installment.sale?.model,
        ]),
      ),
    [emiInstallments, searchQuery],
  );

  const totalDue = sales.reduce((sum, sale) => sum + (sale.dueAmount ?? 0), 0);
  const pendingEmiAmount = emiInstallments
    .filter((item) => item.status !== 'paid')
    .reduce((sum, item) => sum + item.amount, 0);
  const openTickets = tickets.filter((ticket) => ticket.status !== 'resolved').length;

  const stats = [
    {
      title: 'Total Appointments',
      value: String(dashboard?.totalAppointments ?? appointments.length),
      change: dashboard?.nextAppointment ? 'next booked' : 'no upcoming visit',
      changeType: 'positive' as const,
      icon: CalendarDays,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Outstanding Balance',
      value: formatCurrency(totalDue),
      change: `${sales.length} device orders`,
      changeType: totalDue > 0 ? ('negative' as const) : ('positive' as const),
      icon: CreditCard,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Service Tickets',
      value: String(openTickets),
      change: `${tickets.length} total tickets`,
      changeType: openTickets > 0 ? ('negative' as const) : ('positive' as const),
      icon: Wrench,
      color: 'text-violet-500',
      bgColor: 'bg-violet-500/10',
    },
    {
      title: 'EMI Remaining',
      value: formatCurrency(pendingEmiAmount),
      change: `${emiInstallments.length} installments`,
      changeType: pendingEmiAmount > 0 ? ('negative' as const) : ('positive' as const),
      icon: FileClock,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Payments Recorded',
      value: String(payments.length),
      change: formatCurrency(
        payments.reduce((sum, payment) => sum + (payment.amount ?? 0), 0),
      ),
      changeType: 'positive' as const,
      icon: Receipt,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Case Status',
      value: profile?.caseStatus ?? 'active',
      change: profile?.primaryConcern ?? user?.role ?? 'patient',
      changeType: 'positive' as const,
      icon: ShieldCheck,
      color: 'text-fuchsia-500',
      bgColor: 'bg-fuchsia-500/10',
    },
  ];

  if (loading) {
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

  return (
    <SidebarProvider>
      <UserSidebar />
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
            <div className="mx-auto max-w-6xl space-y-6">
              <section id="overview" className="space-y-4">
                <div className="px-2 sm:px-0">
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Welcome {user?.firstName || user?.username}
                  </h1>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    Your appointments, payments, devices, service requests, and care profile in one place.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                  {stats.map((stat, index) => (
                    <DashboardCard key={stat.title} stat={stat} index={index} />
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <section
                  id="profile"
                  className="border-border bg-card/40 rounded-xl border p-6 xl:col-span-1"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="bg-primary/10 text-primary rounded-lg p-3">
                      <UserCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Care Snapshot</h2>
                      <p className="text-muted-foreground text-sm">
                        Assigned team and upcoming care details.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="rounded-lg border p-3">
                      <div className="text-muted-foreground text-xs">Email</div>
                      <div className="font-medium">{user?.email ?? '-'}</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-muted-foreground text-xs">Next Appointment</div>
                      <div className="font-medium">
                        {dashboard?.nextAppointment
                          ? formatDateTime(dashboard.nextAppointment.appointmentdate)
                          : 'No upcoming appointment'}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-muted-foreground text-xs">Assigned Therapist</div>
                      <div className="font-medium">
                        {typeof profile?.assignedTherapist === 'string'
                          ? profile.assignedTherapist
                          : fullName(profile?.assignedTherapist as StaffRef | undefined)}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-muted-foreground text-xs">Assigned Audiologist</div>
                      <div className="font-medium">
                        {typeof profile?.assignedAudiologist === 'string'
                          ? profile.assignedAudiologist
                          : fullName(profile?.assignedAudiologist as StaffRef | undefined)}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-muted-foreground text-xs">Follow-up Date</div>
                      <div className="font-medium">{formatDate(profile?.nextFollowUpDate)}</div>
                    </div>
                  </div>
                </section>

                <section className="space-y-4 xl:col-span-2">
                  <div
                    id="appointments"
                    className="border-border bg-card/40 rounded-xl border p-6"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold">Appointments</h2>
                        <p className="text-muted-foreground text-sm">
                          All appointment records available from the backend.
                        </p>
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {filteredAppointments.length} shown
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px] text-left text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2">Date</th>
                            <th>Type</th>
                            <th>Staff</th>
                            <th>Status</th>
                            <th>Payment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAppointments.map((appointment) => (
                            <tr key={appointment._id} className="border-b last:border-0">
                              <td className="py-3">{formatDateTime(appointment.appointmentdate)}</td>
                              <td>{appointment.appointmentType ?? '-'}</td>
                              <td>{fullName(appointment.staff)}</td>
                              <td>{appointment.status ?? '-'}</td>
                              <td>{appointment.paymentStatus ?? '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div id="sales" className="border-border bg-card/40 rounded-xl border p-6">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold">Sales & Devices</h2>
                        <p className="text-muted-foreground text-sm">
                          Hearing aid or device purchase history.
                        </p>
                      </div>
                      <span className="text-muted-foreground text-sm">
                        {filteredSales.length} shown
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="py-2">Device</th>
                            <th>Sale Date</th>
                            <th>Mode</th>
                            <th>Final</th>
                            <th>Due</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSales.map((sale) => (
                            <tr key={sale._id} className="border-b last:border-0">
                              <td className="py-3">
                                <div className="font-medium">
                                  {sale.brand} {sale.model}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  {sale.serialNumber || 'No serial'}
                                </div>
                              </td>
                              <td>{formatDate(sale.saleDate)}</td>
                              <td>{sale.paymentMode}</td>
                              <td>{formatCurrency(sale.finalAmount)}</td>
                              <td>{formatCurrency(sale.dueAmount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <section id="payments" className="border-border bg-card/40 rounded-xl border p-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">Payments</h2>
                    <p className="text-muted-foreground text-sm">
                      Collection history tied to your orders.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-left text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2">Paid On</th>
                          <th>Amount</th>
                          <th>Method</th>
                          <th>Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.map((payment) => (
                          <tr key={payment._id} className="border-b last:border-0">
                            <td className="py-3">{formatDate(payment.paidAt)}</td>
                            <td>{formatCurrency(payment.amount)}</td>
                            <td>{payment.method}</td>
                            <td>{payment.referenceNumber || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section id="service-tickets" className="border-border bg-card/40 rounded-xl border p-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">Service Tickets</h2>
                    <p className="text-muted-foreground text-sm">
                      Repair and after-sales service requests.
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-left text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2">Title</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Due Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTickets.map((ticket) => (
                          <tr key={ticket._id} className="border-b last:border-0">
                            <td className="py-3">
                              <div className="font-medium">{ticket.title}</div>
                              <div className="text-muted-foreground text-xs">
                                {ticket.sale?.brand} {ticket.sale?.model}
                              </div>
                            </td>
                            <td>{ticket.type}</td>
                            <td>{ticket.status ?? '-'}</td>
                            <td>{formatDate(ticket.dueDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <section id="emi" className="border-border bg-card/40 rounded-xl border p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">EMI Installments</h2>
                  <p className="text-muted-foreground text-sm">
                    Due dates, status, and payment-linked installment records.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2">Installment</th>
                        <th>Device</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmi.map((installment) => (
                        <tr key={installment._id} className="border-b last:border-0">
                          <td className="py-3">#{installment.installmentNumber}</td>
                          <td>
                            {installment.sale?.brand} {installment.sale?.model}
                          </td>
                          <td>{formatDate(installment.dueDate)}</td>
                          <td>{installment.status}</td>
                          <td>{formatCurrency(installment.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <section className="border-border bg-card/40 rounded-xl border p-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">Account Basics</h2>
                    <p className="text-muted-foreground text-sm">
                      Updates the `/user/update` backend endpoint.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Username</label>
                      <Input
                        value={accountForm.username}
                        onChange={(event) =>
                          handleAccountChange('username', event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <Input
                        value={accountForm.firstName}
                        onChange={(event) =>
                          handleAccountChange('firstName', event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <Input
                        value={accountForm.lastName}
                        onChange={(event) =>
                          handleAccountChange('lastName', event.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-muted-foreground text-sm">
                      {accountMessage ?? ' '}
                    </p>
                    <Button onClick={saveAccount} disabled={savingAccount}>
                      <Save className="mr-2 h-4 w-4" />
                      {savingAccount ? 'Saving...' : 'Save Account'}
                    </Button>
                  </div>
                </section>

                <section className="border-border bg-card/40 rounded-xl border p-6">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">Patient Profile</h2>
                    <p className="text-muted-foreground text-sm">
                      Writes to `/user/profile` with the full backend-supported profile shape.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone</label>
                      <Input
                        value={profileForm.phone}
                        onChange={(event) =>
                          handleProfileChange('phone', event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Alternate Phone</label>
                      <Input
                        value={profileForm.alternatePhone}
                        onChange={(event) =>
                          handleProfileChange('alternatePhone', event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Gender</label>
                      <select
                        className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs"
                        value={profileForm.gender}
                        onChange={(event) =>
                          handleProfileChange('gender', event.target.value)
                        }
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date of Birth</label>
                      <Input
                        type="date"
                        value={profileForm.dob}
                        onChange={(event) =>
                          handleProfileChange('dob', event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Guardian Name</label>
                      <Input
                        value={profileForm.guardianName}
                        onChange={(event) =>
                          handleProfileChange('guardianName', event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Relation</label>
                      <Input
                        value={profileForm.relationWithPatient}
                        onChange={(event) =>
                          handleProfileChange('relationWithPatient', event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Emergency Contact Name</label>
                      <Input
                        value={profileForm.emergencyContactName}
                        onChange={(event) =>
                          handleProfileChange('emergencyContactName', event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Emergency Contact Phone</label>
                      <Input
                        value={profileForm.emergencyContactPhone}
                        onChange={(event) =>
                          handleProfileChange('emergencyContactPhone', event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium">Address Line 1</label>
                      <Input
                        value={profileForm.addressLine1}
                        onChange={(event) =>
                          handleProfileChange('addressLine1', event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium">Address Line 2</label>
                      <Input
                        value={profileForm.addressLine2}
                        onChange={(event) =>
                          handleProfileChange('addressLine2', event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">City</label>
                      <Input
                        value={profileForm.city}
                        onChange={(event) =>
                          handleProfileChange('city', event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">State</label>
                      <Input
                        value={profileForm.state}
                        onChange={(event) =>
                          handleProfileChange('state', event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Pincode</label>
                      <Input
                        value={profileForm.pincode}
                        onChange={(event) =>
                          handleProfileChange('pincode', event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Lead Source</label>
                      <Input
                        value={profileForm.leadSource}
                        onChange={(event) =>
                          handleProfileChange('leadSource', event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Referred By</label>
                      <Input
                        value={profileForm.referredBy}
                        onChange={(event) =>
                          handleProfileChange('referredBy', event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Primary Concern</label>
                      <select
                        className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs"
                        value={profileForm.primaryConcern}
                        onChange={(event) =>
                          handleProfileChange('primaryConcern', event.target.value)
                        }
                      >
                        <option value="">Select concern</option>
                        <option value="hearing">Hearing</option>
                        <option value="speech">Speech</option>
                        <option value="both">Both</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Case Status</label>
                      <select
                        className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs"
                        value={profileForm.caseStatus}
                        onChange={(event) =>
                          handleProfileChange('caseStatus', event.target.value)
                        }
                      >
                        <option value="">Select case status</option>
                        <option value="active">Active</option>
                        <option value="on-hold">On Hold</option>
                        <option value="completed">Completed</option>
                        <option value="dropped">Dropped</option>
                      </select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium">Diagnosis</label>
                      <textarea
                        className="border-input bg-background flex min-h-[84px] w-full rounded-md border px-3 py-2 text-sm shadow-xs"
                        value={profileForm.diagnosis}
                        onChange={(event) =>
                          handleProfileChange('diagnosis', event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium">Medical History</label>
                      <textarea
                        className="border-input bg-background flex min-h-[96px] w-full rounded-md border px-3 py-2 text-sm shadow-xs"
                        value={profileForm.medicalHistory}
                        onChange={(event) =>
                          handleProfileChange('medicalHistory', event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium">Clinical Notes</label>
                      <textarea
                        className="border-input bg-background flex min-h-[96px] w-full rounded-md border px-3 py-2 text-sm shadow-xs"
                        value={profileForm.clinicalNotes}
                        onChange={(event) =>
                          handleProfileChange('clinicalNotes', event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Next Follow-up Date</label>
                      <Input
                        type="date"
                        value={profileForm.nextFollowUpDate}
                        onChange={(event) =>
                          handleProfileChange('nextFollowUpDate', event.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-muted-foreground text-sm">
                      {profileMessage ?? ' '}
                    </p>
                    <Button onClick={saveProfile} disabled={savingProfile}>
                      <Save className="mr-2 h-4 w-4" />
                      {savingProfile ? 'Saving...' : 'Save Profile'}
                    </Button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
