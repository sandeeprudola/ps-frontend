'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CreditCard,
  FileClock,
  Receipt,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { AccountBasicsForm } from '@/components/dashboard/user/account-basics-form';
import { CareSnapshotCard } from '@/components/dashboard/user/care-snapshot-card';
import { PatientProfileForm } from '@/components/dashboard/user/patient-profile-form';
import { DashboardTableCard } from '@/components/dashboard/shared/dashboard-table-card';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { DashboardHeader } from '@/components/ui/dashboard-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { UserSidebar } from '@/components/ui/user-sidebar';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { api, getApiErrorMessage } from '@/lib/api';
import { clearStoredTokens, createAuthHeaders } from '@/lib/auth';

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

const isUnauthorizedError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'response' in error &&
  (error as { response?: { status?: number } }).response?.status === 401;

export default function UserDashboard() {
  const router = useRouter();
  const { token, isCheckingAuth } = useAuthGuard({
    role: 'user',
    redirectTo: '/User/Login',
  });

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
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const headers = createAuthHeaders('user');
      const [
        dashboardRes,
        meRes,
        appointmentsRes,
        salesRes,
        paymentsRes,
        ticketsRes,
        emiRes,
      ] = await Promise.all([
        api.get<DashboardResponse>('/user/dashboard', { headers }),
        api.get<UserMeResponse>('/user/me', { headers }),
        api.get<{ appointments: Appointment[] }>('/user/appointments', { headers }),
        api.get<{ sales: Sale[] }>('/user/sales', { headers }),
        api.get<{ payments: Payment[] }>('/user/payments', { headers }),
        api.get<{ tickets: ServiceTicket[] }>('/user/service-tickets', { headers }),
        api.get<{ installments: EmiInstallment[] }>('/user/emi-installments', {
          headers,
        }),
      ]);

      setDashboard(dashboardRes.data);
      applyUserData(meRes.data);
      setAppointments(appointmentsRes.data.appointments ?? []);
      setSales(salesRes.data.sales ?? []);
      setPayments(paymentsRes.data.payments ?? []);
      setTickets(ticketsRes.data.tickets ?? []);
      setEmiInstallments(emiRes.data.installments ?? []);
    } catch (requestError: unknown) {
      if (isUnauthorizedError(requestError)) {
        clearStoredTokens();
        router.replace('/User/Login');
      }
      setError(getApiErrorMessage(requestError, 'Failed to load user dashboard'));
    } finally {
      setLoading(false);
    }
  }, [applyUserData, router, token]);

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [fetchData, token]);

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

  const handleAccountChange = (
    field: keyof typeof accountForm,
    value: string,
  ) => {
    setAccountForm((current) => ({ ...current, [field]: value }));
  };

  const handleProfileChange = (
    field: keyof typeof profileForm,
    value: string,
  ) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
  };

  const saveAccount = async () => {
    try {
      setSavingAccount(true);
      setAccountMessage(null);
      await api.put('/user/update', accountForm, {
        headers: createAuthHeaders('user'),
      });

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
      if (isUnauthorizedError(requestError)) {
        clearStoredTokens();
        router.replace('/User/Login');
      }
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
      const response = await api.put<{ profile: PatientProfile }>(
        '/user/profile',
        payload,
        { headers: createAuthHeaders('user') },
      );

      setProfile(response.data.profile);
      setProfileMessage('Profile saved successfully.');
    } catch (requestError: unknown) {
      if (isUnauthorizedError(requestError)) {
        clearStoredTokens();
        router.replace('/User/Login');
      }
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
      changeType:
        pendingEmiAmount > 0 ? ('negative' as const) : ('positive' as const),
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

  const assignedTherapistLabel =
    typeof profile?.assignedTherapist === 'string'
      ? profile.assignedTherapist
      : fullName(profile?.assignedTherapist as StaffRef | undefined);

  const assignedAudiologistLabel =
    typeof profile?.assignedAudiologist === 'string'
      ? profile.assignedAudiologist
      : fullName(profile?.assignedAudiologist as StaffRef | undefined);

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
                    Your appointments, payments, devices, service requests, and care
                    profile in one place.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                  {stats.map((stat, index) => (
                    <DashboardCard key={stat.title} stat={stat} index={index} />
                  ))}
                </div>
              </section>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
                <CareSnapshotCard
                  email={user?.email}
                  nextAppointmentLabel={
                    dashboard?.nextAppointment
                      ? formatDateTime(dashboard.nextAppointment.appointmentdate)
                      : 'No upcoming appointment'
                  }
                  assignedTherapistLabel={assignedTherapistLabel}
                  assignedAudiologistLabel={assignedAudiologistLabel}
                  followUpDateLabel={formatDate(profile?.nextFollowUpDate)}
                />

                <section className="space-y-4 xl:col-span-2">
                  <DashboardTableCard
                    id="appointments"
                    title="Appointments"
                    description="All appointment records available from the backend."
                    countLabel={`${filteredAppointments.length} shown`}
                    columns={['Date', 'Type', 'Staff', 'Status', 'Payment']}
                    minWidthClass="min-w-[720px]"
                    rows={filteredAppointments.map((appointment) => ({
                      key: appointment._id,
                      cells: [
                        formatDateTime(appointment.appointmentdate),
                        appointment.appointmentType ?? '-',
                        fullName(appointment.staff),
                        appointment.status ?? '-',
                        appointment.paymentStatus ?? '-',
                      ],
                    }))}
                    emptyMessage="No appointments found."
                  />

                  <DashboardTableCard
                    id="sales"
                    title="Sales & Devices"
                    description="Hearing aid or device purchase history."
                    countLabel={`${filteredSales.length} shown`}
                    columns={['Device', 'Sale Date', 'Mode', 'Final', 'Due']}
                    minWidthClass="min-w-[760px]"
                    rows={filteredSales.map((sale) => ({
                      key: sale._id,
                      cells: [
                        <>
                          <div className="font-medium">
                            {sale.brand} {sale.model}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {sale.serialNumber || 'No serial'}
                          </div>
                        </>,
                        formatDate(sale.saleDate),
                        sale.paymentMode,
                        formatCurrency(sale.finalAmount),
                        formatCurrency(sale.dueAmount),
                      ],
                    }))}
                    emptyMessage="No device sales found."
                  />
                </section>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <DashboardTableCard
                  id="payments"
                  title="Payments"
                  description="Collection history tied to your orders."
                  columns={['Paid On', 'Amount', 'Method', 'Reference']}
                  rows={filteredPayments.map((payment) => ({
                    key: payment._id,
                    cells: [
                      formatDate(payment.paidAt),
                      formatCurrency(payment.amount),
                      payment.method,
                      payment.referenceNumber || '-',
                    ],
                  }))}
                  emptyMessage="No payments recorded."
                />

                <DashboardTableCard
                  id="service-tickets"
                  title="Service Tickets"
                  description="Repair and after-sales service requests."
                  columns={['Title', 'Type', 'Status', 'Due Date']}
                  rows={filteredTickets.map((ticket) => ({
                    key: ticket._id,
                    cells: [
                      <>
                        <div className="font-medium">{ticket.title}</div>
                        <div className="text-muted-foreground text-xs">
                          {ticket.sale?.brand} {ticket.sale?.model}
                        </div>
                      </>,
                      ticket.type,
                      ticket.status ?? '-',
                      formatDate(ticket.dueDate),
                    ],
                  }))}
                  emptyMessage="No service tickets found."
                />
              </div>

              <DashboardTableCard
                id="emi"
                title="EMI Installments"
                description="Due dates, status, and payment-linked installment records."
                columns={['Installment', 'Device', 'Due Date', 'Status', 'Amount']}
                minWidthClass="min-w-[760px]"
                rows={filteredEmi.map((installment) => ({
                  key: installment._id,
                  cells: [
                    `#${installment.installmentNumber}`,
                    `${installment.sale?.brand ?? ''} ${installment.sale?.model ?? ''}`.trim(),
                    formatDate(installment.dueDate),
                    installment.status,
                    formatCurrency(installment.amount),
                  ],
                }))}
                emptyMessage="No EMI installments found."
              />

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                <AccountBasicsForm
                  form={accountForm}
                  onChange={handleAccountChange}
                  onSave={saveAccount}
                  message={accountMessage}
                  saving={savingAccount}
                />

                <PatientProfileForm
                  form={profileForm}
                  onChange={handleProfileChange}
                  onSave={saveProfile}
                  message={profileMessage}
                  saving={savingProfile}
                />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
