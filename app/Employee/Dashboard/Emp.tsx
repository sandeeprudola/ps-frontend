'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BadgeIndianRupee,
  Boxes,
  CalendarClock,
  ClipboardCheck,
  Headphones,
  LogOut,
  RefreshCw,
  TicketCheck,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { DashboardTableCard } from '@/components/dashboard/shared/dashboard-table-card';
import { useAuthGuard } from '@/hooks/use-auth-guard';
import { api, getApiErrorMessage } from '@/lib/api';
import { clearStoredTokens, createAuthHeaders } from '@/lib/auth';

type EmployeeProfile = {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  role?: string;
  specialization?: string;
};

type Person = {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
};

type AttendanceRecord = {
  _id: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  status: string;
};

type AppointmentRecord = {
  _id: string;
  patient?: Person;
  appointmentdate: string;
  status: string;
  appointmentType: string;
  priority?: string;
  paymentStatus?: string;
  notes?: string;
  duration?: number;
};

type LeadRecord = {
  _id: string;
  firstName: string;
  lastName?: string;
  phone: string;
  interest: string;
  status: string;
  source?: string;
  nextFollowUpDate?: string;
};

type InventoryItem = {
  _id: string;
  name: string;
  sku: string;
  category?: string;
  unit?: string;
  currentQty: number;
};

type InventoryLog = {
  _id: string;
  item?: InventoryItem;
  quantity: number;
  note?: string;
  createdAt: string;
};

type SaleRecord = {
  _id: string;
  patient?: Person;
  brand: string;
  model: string;
  finalAmount: number;
  dueAmount: number;
  paymentMode: string;
  saleDate: string;
};

type ServiceTicketRecord = {
  _id: string;
  patient?: Person;
  title: string;
  type: string;
  priority: string;
  status: string;
  dueDate?: string;
};

type EmployeeDashboardResponse = {
  employee: EmployeeProfile;
  summary: {
    todayAppointments: number;
    totalAppointments: number;
    openLeads: number;
    activeTickets: number;
    inventoryItems: number;
    salesTotal: number;
  };
  attendance: {
    today?: AttendanceRecord | null;
    history: AttendanceRecord[];
  };
  appointments: AppointmentRecord[];
  leads: LeadRecord[];
  inventory: {
    items: InventoryItem[];
    logs: InventoryLog[];
  };
  sales: SaleRecord[];
  serviceTickets: ServiceTicketRecord[];
};

const formatName = (person?: Person | EmployeeProfile) => {
  const name = `${person?.firstName ?? ''} ${person?.lastName ?? ''}`.trim();
  const username = person && 'username' in person ? person.username : undefined;
  return name || person?.email || username || 'Unassigned';
};

const formatDateTime = (value?: string) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
};

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0);

const isUnauthorizedError = (error: unknown) =>
  typeof error === 'object' &&
  error !== null &&
  'response' in error &&
  (error as { response?: { status?: number } }).response?.status === 401;

export default function EmployeeDashboard() {
  const router = useRouter();
  const { token, isCheckingAuth } = useAuthGuard({
    role: 'employee',
    redirectTo: '/Employee/Login',
  });

  const [data, setData] = useState<EmployeeDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState<string | null>(null);
  const [inventoryForm, setInventoryForm] = useState({
    itemId: '',
    quantity: '1',
    note: '',
  });

  const handleLogout = useCallback(() => {
    clearStoredTokens();
    router.replace('/Employee/Login');
  }, [router]);

  const fetchDashboard = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await api.get<EmployeeDashboardResponse>('/employee/dashboard', {
        headers: createAuthHeaders('employee'),
      });
      setData(response.data);
      setMessage(null);
    } catch (error: unknown) {
      if (isUnauthorizedError(error)) {
        handleLogout();
        return;
      }
      setMessage(getApiErrorMessage(error, 'Failed to load employee dashboard.'));
    } finally {
      setLoading(false);
    }
  }, [handleLogout, token]);

  useEffect(() => {
    if (!token) return;
    fetchDashboard();
  }, [fetchDashboard, token]);

  const refresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
  };

  const recordAttendance = async (type: 'checkin' | 'checkout') => {
    try {
      setMessage(null);
      await api.post(`/attendance/${type}`, {}, {
        headers: createAuthHeaders('employee'),
      });
      setMessage(type === 'checkin' ? 'Checked in successfully.' : 'Checked out successfully.');
      await fetchDashboard();
    } catch (error: unknown) {
      setMessage(getApiErrorMessage(error, 'Failed to update attendance.'));
    }
  };

  const logInventory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selected = data?.inventory.items.find((item) => item._id === inventoryForm.itemId);

    try {
      setMessage(null);
      await api.post(
        '/inventory/log-in',
        {
          itemId: inventoryForm.itemId || undefined,
          sku: selected?.sku,
          quantity: Number(inventoryForm.quantity),
          note: inventoryForm.note || undefined,
        },
        { headers: createAuthHeaders('employee') },
      );
      setInventoryForm({ itemId: '', quantity: '1', note: '' });
      setMessage('Inventory stock-in logged.');
      await fetchDashboard();
    } catch (error: unknown) {
      setMessage(getApiErrorMessage(error, 'Failed to log inventory.'));
    }
  };

  const updateAppointmentStatus = async (
    appointmentId: string,
    status: 'confirmed' | 'in-progress' | 'completed' | 'canceled',
  ) => {
    try {
      setUpdatingAppointmentId(appointmentId);
      setMessage(null);
      await api.patch(
        `/appointment/${appointmentId}/employee`,
        { status },
        { headers: createAuthHeaders('employee') },
      );
      setMessage('Appointment updated.');
      await fetchDashboard();
    } catch (error: unknown) {
      setMessage(getApiErrorMessage(error, 'Failed to update appointment.'));
    } finally {
      setUpdatingAppointmentId(null);
    }
  };

  const stats = useMemo(() => {
    const summary = data?.summary;
    return [
      {
        title: 'Today Appointments',
        value: String(summary?.todayAppointments ?? 0),
        change: `${summary?.totalAppointments ?? 0} total`,
        changeType: 'positive' as const,
        icon: CalendarClock,
        color: 'text-sky-600',
        bgColor: 'bg-sky-100',
      },
      {
        title: 'Open Leads',
        value: String(summary?.openLeads ?? 0),
        change: 'follow-up queue',
        changeType: 'positive' as const,
        icon: UsersRound,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-100',
      },
      {
        title: 'Active Tickets',
        value: String(summary?.activeTickets ?? 0),
        change: 'service work',
        changeType: 'positive' as const,
        icon: TicketCheck,
        color: 'text-rose-600',
        bgColor: 'bg-rose-100',
      },
      {
        title: 'Inventory Items',
        value: String(summary?.inventoryItems ?? 0),
        change: 'available stock',
        changeType: 'positive' as const,
        icon: Boxes,
        color: 'text-amber-600',
        bgColor: 'bg-amber-100',
      },
      {
        title: 'Sales Value',
        value: money(summary?.salesTotal ?? 0),
        change: 'sold by you',
        changeType: 'positive' as const,
        icon: BadgeIndianRupee,
        color: 'text-violet-600',
        bgColor: 'bg-violet-100',
      },
    ];
  }, [data]);

  if (isCheckingAuth || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">Loading employee dashboard...</p>
      </div>
    );
  }

  const employeeName = formatName(data?.employee);
  const todayAttendance = data?.attendance.today;
  const checkedIn = Boolean(todayAttendance?.checkInTime);
  const checkedOut = Boolean(todayAttendance?.checkOutTime);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 md:px-6">
        <section
          id="overview"
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-slate-950 text-white">
                  <Headphones className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Employee workspace
                  </p>
                  <h1 className="text-2xl font-semibold text-slate-950 md:text-3xl">
                    {employeeName}
                  </h1>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                {data?.employee.role ?? 'employee'} · {data?.employee.specialization ?? 'Clinic team'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={refresh} disabled={refreshing}>
                <RefreshCw className={refreshing ? 'animate-spin' : ''} />
                Refresh
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut />
                Logout
              </Button>
            </div>
          </div>

          {message ? (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            {stats.map((stat, index) => (
              <DashboardCard key={stat.title} stat={stat} index={index} />
            ))}
          </div>
        </section>

        <section
          id="attendance"
          className="grid grid-cols-1 gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[0.85fr_1.15fr]"
        >
          <div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <UserRoundCheck className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Attendance</h2>
                <p className="text-sm text-slate-600">
                  Today: {checkedIn ? formatDateTime(todayAttendance?.checkInTime) : 'not checked in'}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={() => recordAttendance('checkin')} disabled={checkedIn}>
                Check In
              </Button>
              <Button
                variant="outline"
                onClick={() => recordAttendance('checkout')}
                disabled={!checkedIn || checkedOut}
              >
                Check Out
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {(data?.attendance.history ?? []).slice(0, 6).map((item) => (
              <div key={item._id} className="rounded-xl border border-slate-200 p-3 text-sm">
                <div className="font-medium">{formatDate(item.date)}</div>
                <div className="mt-1 text-slate-600">
                  {item.status} · {formatDateTime(item.checkInTime)} - {formatDateTime(item.checkOutTime)}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          id="appointments"
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Appointments</h2>
              <p className="text-sm text-slate-600">
                Confirm visits, start consultations, complete sessions, or cancel assigned appointments.
              </p>
            </div>
            <span className="text-sm font-medium text-slate-500">
              {data?.appointments.length ?? 0} loaded
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {(data?.appointments ?? []).map((appointment) => (
              <article
                key={appointment._id}
                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-950">
                      {formatName(appointment.patient)}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {formatDateTime(appointment.appointmentdate)} · {appointment.appointmentType}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {appointment.duration ?? 30} min · {appointment.paymentStatus ?? 'payment pending'}
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                    {appointment.status}
                  </span>
                </div>

                {appointment.notes ? (
                  <p className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-600">
                    {appointment.notes}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  {(['confirmed', 'in-progress', 'completed', 'canceled'] as const).map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={appointment.status === status ? 'default' : 'outline'}
                      disabled={updatingAppointmentId === appointment._id}
                      onClick={() => updateAppointmentStatus(appointment._id, status)}
                    >
                      {status === 'in-progress' ? 'Start' : status[0].toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </article>
            ))}
            {(data?.appointments ?? []).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 lg:col-span-2">
                No appointments assigned yet.
              </div>
            ) : null}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <DashboardTableCard
            id="leads"
            title="Leads"
            description="Leads assigned to you or created by you."
            countLabel={`${data?.leads.length ?? 0} loaded`}
            columns={['Lead', 'Phone', 'Interest', 'Status', 'Follow-up']}
            rows={(data?.leads ?? []).map((lead) => ({
              key: lead._id,
              cells: [
                `${lead.firstName} ${lead.lastName ?? ''}`.trim(),
                lead.phone,
                lead.interest,
                lead.status,
                formatDate(lead.nextFollowUpDate),
              ],
            }))}
          />

          <DashboardTableCard
            id="service-tickets"
            title="Service Tickets"
            description="Assigned and created service tickets."
            countLabel={`${data?.serviceTickets.length ?? 0} loaded`}
            columns={['Patient', 'Ticket', 'Priority', 'Status', 'Due']}
            rows={(data?.serviceTickets ?? []).map((ticket) => ({
              key: ticket._id,
              cells: [
                formatName(ticket.patient),
                ticket.title,
                ticket.priority,
                ticket.status,
                formatDate(ticket.dueDate),
              ],
            }))}
          />
        </div>

        <section
          id="inventory"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Inventory</h2>
              <p className="text-sm text-slate-600">
                View stock and log incoming inventory as an employee.
              </p>
            </div>

            <form onSubmit={logInventory} className="grid w-full grid-cols-1 gap-3 sm:grid-cols-[1fr_110px_1fr_auto] lg:max-w-3xl">
              <div>
                <Label htmlFor="itemId">Item</Label>
                <select
                  id="itemId"
                  value={inventoryForm.itemId}
                  onChange={(event) => setInventoryForm((current) => ({ ...current, itemId: event.target.value }))}
                  className="mt-1 h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                  required
                >
                  <option value="">Select item</option>
                  {(data?.inventory.items ?? []).map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} ({item.sku})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="quantity">Qty</Label>
                <Input
                  id="quantity"
                  min="1"
                  type="number"
                  value={inventoryForm.quantity}
                  onChange={(event) => setInventoryForm((current) => ({ ...current, quantity: event.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="note">Note</Label>
                <Input
                  id="note"
                  value={inventoryForm.note}
                  onChange={(event) => setInventoryForm((current) => ({ ...current, note: event.target.value }))}
                  placeholder="Optional"
                />
              </div>
              <Button type="submit" className="self-end">
                <ClipboardCheck />
                Log
              </Button>
            </form>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {(data?.inventory.items ?? []).slice(0, 8).map((item) => (
              <div key={item._id} className="rounded-xl border border-slate-200 p-3">
                <div className="font-medium">{item.name}</div>
                <div className="mt-1 text-sm text-slate-600">{item.sku} · {item.category ?? 'other'}</div>
                <div className="mt-3 text-2xl font-semibold">{item.currentQty}</div>
                <div className="text-xs text-slate-500">{item.unit ?? 'pcs'} in stock</div>
              </div>
            ))}
          </div>
        </section>

        <DashboardTableCard
          id="sales"
          title="Sales"
          description="Recent hearing-aid or device sales sold by this employee."
          countLabel={`${data?.sales.length ?? 0} loaded`}
          columns={['Patient', 'Device', 'Amount', 'Due', 'Date']}
          rows={(data?.sales ?? []).map((sale) => ({
            key: sale._id,
            cells: [
              formatName(sale.patient),
              `${sale.brand} ${sale.model}`,
              money(sale.finalAmount),
              money(sale.dueAmount),
              formatDate(sale.saleDate),
            ],
          }))}
        />
      </div>
    </main>
  );
}
