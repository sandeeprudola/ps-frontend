'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CalendarDays,
  CalendarPlus,
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
import { Button } from '@/components/ui/button';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { DashboardHeader } from '@/components/ui/dashboard-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

type StaffOption = StaffRef & {
  _id: string;
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
  duration?: number;
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

type Reminder = {
  id: string;
  type: string;
  title: string;
  dueDate: string;
  status?: string;
  amount?: number;
  detail?: string;
};

type AvailabilityResponse = {
  date: string;
  duration: number;
  workingHours: {
    start: string;
    end: string;
    slotIntervalMinutes: number;
  };
  bookedSlots: string[];
  availableSlots: string[];
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
  const [staffOptions, setStaffOptions] = useState<StaffOption[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [cancelingAppointmentId, setCancelingAppointmentId] = useState<string | null>(null);

  const [bookingForm, setBookingForm] = useState({
    staff: '',
    appointmentdate: '',
    duration: '30',
    appointmentType: 'consultation',
    priority: 'normal',
    notes: '',
  });

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
        staffRes,
        remindersRes,
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
        api.get<{ staff: StaffOption[] }>('/appointment/staff-list'),
        api.get<{ reminders: Reminder[] }>('/user/reminders', { headers }),
      ]);

      setDashboard(dashboardRes.data);
      applyUserData(meRes.data);
      setAppointments(appointmentsRes.data.appointments ?? []);
      setSales(salesRes.data.sales ?? []);
      setPayments(paymentsRes.data.payments ?? []);
      setTickets(ticketsRes.data.tickets ?? []);
      setEmiInstallments(emiRes.data.installments ?? []);
      setStaffOptions(staffRes.data.staff ?? []);
      setReminders(remindersRes.data.reminders ?? []);
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

  const handleBookingChange = (
    field: keyof typeof bookingForm,
    value: string,
  ) => {
    setBookingForm((current) => ({ ...current, [field]: value }));
  };

  const fetchAvailability = async () => {
    if (!bookingForm.staff || !bookingDate) {
      setBookingMessage('Select staff and date to check available slots.');
      return;
    }

    try {
      setLoadingSlots(true);
      setBookingMessage(null);
      const response = await api.get<AvailabilityResponse>('/appointment/availability', {
        params: {
          staffId: bookingForm.staff,
          date: bookingDate,
          duration: bookingForm.duration,
        },
      });
      setAvailability(response.data);
      if (response.data.availableSlots.length === 0) {
        setBookingMessage('No slots available for this staff member on the selected date.');
      }
    } catch (requestError: unknown) {
      setAvailability(null);
      setBookingMessage(getApiErrorMessage(requestError, 'Failed to load available slots.'));
    } finally {
      setLoadingSlots(false);
    }
  };

  const selectSlot = (slot: string) => {
    setBookingForm((current) => ({
      ...current,
      appointmentdate: `${bookingDate}T${slot}`,
    }));
    setBookingMessage(`Selected ${slot}. You can now book the appointment.`);
  };

  const bookAppointment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setBooking(true);
      setBookingMessage(null);

      await api.post(
        '/appointment/user',
        {
          staff: bookingForm.staff,
          appointmentdate: new Date(bookingForm.appointmentdate).toISOString(),
          duration: Number(bookingForm.duration),
          appointmentType: bookingForm.appointmentType,
          priority: bookingForm.priority,
          notes: bookingForm.notes || undefined,
        },
        { headers: createAuthHeaders('user') },
      );

      setBookingForm({
        staff: '',
        appointmentdate: '',
        duration: '30',
        appointmentType: 'consultation',
        priority: 'normal',
        notes: '',
      });
      setBookingMessage('Appointment booked successfully.');
      setAvailability(null);
      setBookingDate('');
      await fetchData();
    } catch (requestError: unknown) {
      if (isUnauthorizedError(requestError)) {
        clearStoredTokens();
        router.replace('/User/Login');
      }
      setBookingMessage(
        getApiErrorMessage(requestError, 'Failed to book appointment.'),
      );
    } finally {
      setBooking(false);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      setCancelingAppointmentId(appointmentId);
      await api.patch(
        `/appointment/user/${appointmentId}/cancel`,
        {},
        { headers: createAuthHeaders('user') },
      );
      await fetchData();
    } catch (requestError: unknown) {
      setBookingMessage(getApiErrorMessage(requestError, 'Failed to cancel appointment.'));
    } finally {
      setCancelingAppointmentId(null);
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

  const filteredReminders = useMemo(
    () =>
      reminders.filter((reminder) =>
        matchesSearch(searchQuery, [
          reminder.type,
          reminder.title,
          reminder.status,
          reminder.detail,
          reminder.amount,
        ]),
      ),
    [reminders, searchQuery],
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
                  <section
                    id="book-appointment"
                    className="border-border bg-card/40 rounded-xl border p-6"
                  >
                    <div className="mb-4 flex items-start gap-3">
                      <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                        <CalendarPlus className="size-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">Book Appointment</h2>
                        <p className="text-muted-foreground text-sm">
                          Choose a clinician, time, appointment type, and priority.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={bookAppointment} className="space-y-4">
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="appointment-staff">Staff</Label>
                          <select
                            id="appointment-staff"
                            className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs"
                            value={bookingForm.staff}
                            onChange={(event) =>
                              handleBookingChange('staff', event.target.value)
                            }
                            required
                          >
                            <option value="">Select staff</option>
                            {staffOptions.map((staff) => (
                              <option key={staff._id} value={staff._id}>
                                {fullName(staff)} · {staff.specialization ?? staff.role}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="appointment-slot-date">Date</Label>
                          <Input
                            id="appointment-slot-date"
                            type="date"
                            value={bookingDate}
                            onChange={(event) => {
                              setBookingDate(event.target.value);
                              setAvailability(null);
                              handleBookingChange('appointmentdate', '');
                            }}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="appointment-date">Date and Time</Label>
                          <Input
                            id="appointment-date"
                            type="datetime-local"
                            value={bookingForm.appointmentdate}
                            onChange={(event) =>
                              handleBookingChange('appointmentdate', event.target.value)
                            }
                            required
                            readOnly
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="appointment-duration">Duration</Label>
                          <select
                            id="appointment-duration"
                            className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs"
                            value={bookingForm.duration}
                            onChange={(event) =>
                              handleBookingChange('duration', event.target.value)
                            }
                          >
                            <option value="30">30 minutes</option>
                            <option value="45">45 minutes</option>
                            <option value="60">60 minutes</option>
                            <option value="90">90 minutes</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="appointment-type">Type</Label>
                          <select
                            id="appointment-type"
                            className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs"
                            value={bookingForm.appointmentType}
                            onChange={(event) =>
                              handleBookingChange('appointmentType', event.target.value)
                            }
                          >
                            <option value="consultation">Consultation</option>
                            <option value="speech-therapy">Speech Therapy</option>
                            <option value="hearing-test">Hearing Test</option>
                            <option value="followup">Follow-up</option>
                            <option value="emergency">Emergency</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="appointment-priority">Priority</Label>
                          <select
                            id="appointment-priority"
                            className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs"
                            value={bookingForm.priority}
                            onChange={(event) =>
                              handleBookingChange('priority', event.target.value)
                            }
                          >
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="emergency">Emergency</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="appointment-notes">Notes</Label>
                          <Input
                            id="appointment-notes"
                            value={bookingForm.notes}
                            onChange={(event) =>
                              handleBookingChange('notes', event.target.value)
                            }
                            placeholder="Optional"
                          />
                        </div>
                      </div>

                      <div className="rounded-lg border border-dashed p-3">
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="text-sm font-medium">Available slots</div>
                            <p className="text-muted-foreground text-xs">
                              Choose staff, date, and duration, then pick an open slot.
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={fetchAvailability}
                            disabled={loadingSlots}
                          >
                            {loadingSlots ? 'Checking...' : 'Check Slots'}
                          </Button>
                        </div>
                        {availability ? (
                          <div className="flex flex-wrap gap-2">
                            {availability.availableSlots.map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => selectSlot(slot)}
                                className={`rounded-md border px-3 py-1.5 text-sm transition ${
                                  bookingForm.appointmentdate.endsWith(slot)
                                    ? 'border-slate-950 bg-slate-950 text-white'
                                    : 'border-slate-200 bg-white hover:bg-slate-50'
                                }`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-muted-foreground text-sm">
                          {bookingMessage ?? 'Appointments can be booked during clinic hours.'}
                        </p>
                        <Button type="submit" disabled={booking}>
                          <CalendarPlus className="mr-2 size-4" />
                          {booking ? 'Booking...' : 'Book Appointment'}
                        </Button>
                      </div>
                    </form>
                  </section>

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
                        <>
                          <div>{appointment.paymentStatus ?? '-'}</div>
                          {!['completed', 'canceled'].includes(appointment.status ?? '') ? (
                            <button
                              type="button"
                              onClick={() => cancelAppointment(appointment._id)}
                              disabled={cancelingAppointmentId === appointment._id}
                              className="mt-1 text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                            >
                              {cancelingAppointmentId === appointment._id ? 'Canceling...' : 'Cancel'}
                            </button>
                          ) : null}
                        </>,
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

              <section
                id="reminders"
                className="border-border bg-card/40 rounded-xl border p-6"
              >
                <div className="mb-4 flex items-start gap-3">
                  <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                    <Bell className="size-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Reminders & Follow-ups</h2>
                    <p className="text-muted-foreground text-sm">
                      Upcoming follow-ups, service due dates, warranty/AMC reminders, and EMI dues.
                    </p>
                  </div>
                </div>

                {filteredReminders.length === 0 ? (
                  <div className="border-border text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
                    No upcoming reminders in the next 45 days.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {filteredReminders.map((reminder) => (
                      <div key={reminder.id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium">{reminder.title}</div>
                            <div className="text-muted-foreground mt-1 text-xs">
                              {reminder.type} · {formatDate(reminder.dueDate)}
                            </div>
                          </div>
                          <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-medium text-white">
                            {reminder.status ?? 'upcoming'}
                          </span>
                        </div>
                        {reminder.detail ? (
                          <p className="text-muted-foreground mt-3 text-sm">
                            {reminder.detail}
                          </p>
                        ) : null}
                        {typeof reminder.amount === 'number' ? (
                          <div className="mt-3 text-sm font-semibold">
                            {formatCurrency(reminder.amount)}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </section>

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
