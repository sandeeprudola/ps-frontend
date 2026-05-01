'use client';

import { BadgeIndianRupee, CalendarCheck, TrendingUp, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type AdminMonthlyReport = {
  range?: {
    from?: string;
    to?: string;
    year?: number;
    month?: number;
  };
  revenue?: {
    totalRevenue?: number;
    paymentCount?: number;
    paymentsByMethod?: { method: string; total: number; count: number }[];
    totalSalesValue?: number;
    totalPaidOnSales?: number;
    totalDue?: number;
  };
  conversion?: {
    leadCount?: number;
    convertedLeadCount?: number;
    leadToPatientRate?: number;
    newPatients?: number;
    salesCount?: number;
    appointmentCount?: number;
    completedAppointmentCount?: number;
    patientToSaleRate?: number;
    appointmentToSaleRate?: number;
    completedAppointmentToSaleRate?: number;
  };
};

interface AdminReportsPanelProps {
  report: AdminMonthlyReport | null;
  year: number;
  month: number;
  loading?: boolean;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onRefresh: () => Promise<void>;
  onExport: () => void;
}

const money = (value?: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const metricCards = [
  {
    key: 'totalRevenue',
    title: 'Revenue Collected',
    icon: BadgeIndianRupee,
    color: 'bg-emerald-100 text-emerald-700',
  },
  {
    key: 'totalSalesValue',
    title: 'Sales Value',
    icon: TrendingUp,
    color: 'bg-sky-100 text-sky-700',
  },
  {
    key: 'appointmentCount',
    title: 'Appointments',
    icon: CalendarCheck,
    color: 'bg-violet-100 text-violet-700',
  },
  {
    key: 'leadCount',
    title: 'Leads',
    icon: Users,
    color: 'bg-amber-100 text-amber-700',
  },
];

export function AdminReportsPanel({
  report,
  year,
  month,
  loading = false,
  onYearChange,
  onMonthChange,
  onRefresh,
  onExport,
}: AdminReportsPanelProps) {
  const revenue = report?.revenue;
  const conversion = report?.conversion;

  const values = {
    totalRevenue: money(revenue?.totalRevenue),
    totalSalesValue: money(revenue?.totalSalesValue),
    appointmentCount: String(conversion?.appointmentCount ?? 0),
    leadCount: String(conversion?.leadCount ?? 0),
  };

  return (
    <section
      id="reports"
      className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.25)]"
    >
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Reports
          </p>
          <h2 className="text-2xl font-semibold text-slate-950">
            Monthly revenue and conversion
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Pulls live monthly data from `/reports/monthly`.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <label className="text-sm text-slate-600">
            Month
            <select
              className="mt-1 block h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950"
              value={month}
              onChange={(event) => onMonthChange(Number(event.target.value))}
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-600">
            Year
            <Input
              className="mt-1 w-28"
              type="number"
              value={String(year)}
              onChange={(event) => onYearChange(Number(event.target.value))}
            />
          </label>
          <Button variant="outline" onClick={onRefresh} disabled={loading}>
            {loading ? 'Loading...' : 'Load'}
          </Button>
          <Button onClick={onExport}>Export CSV</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className={`mb-4 flex size-10 items-center justify-center rounded-xl ${metric.color}`}>
                <Icon className="size-5" />
              </div>
              <div className="text-2xl font-semibold text-slate-950">
                {values[metric.key as keyof typeof values]}
              </div>
              <div className="mt-1 text-sm text-slate-600">{metric.title}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
          <h3 className="text-lg font-semibold text-slate-950">Revenue</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-slate-600">Payments</span>
              <span className="font-semibold text-slate-950">{revenue?.paymentCount ?? 0}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-600">Paid on sales</span>
              <span className="font-semibold text-slate-950">{money(revenue?.totalPaidOnSales)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-slate-600">Outstanding due</span>
              <span className="font-semibold text-slate-950">{money(revenue?.totalDue)}</span>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            {(revenue?.paymentsByMethod ?? []).length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                No payment method breakdown for this month.
              </div>
            ) : (
              revenue?.paymentsByMethod?.map((item) => (
                <div
                  key={item.method}
                  className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm"
                >
                  <span className="font-medium text-slate-950">{item.method}</span>
                  <span className="text-slate-600">
                    {money(item.total)} · {item.count} payments
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
          <h3 className="text-lg font-semibold text-slate-950">Conversion</h3>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <ReportPill label="Converted leads" value={conversion?.convertedLeadCount ?? 0} />
            <ReportPill label="Lead rate" value={`${conversion?.leadToPatientRate ?? 0}%`} />
            <ReportPill label="New patients" value={conversion?.newPatients ?? 0} />
            <ReportPill label="Sales" value={conversion?.salesCount ?? 0} />
            <ReportPill label="Patient to sale" value={`${conversion?.patientToSaleRate ?? 0}%`} />
            <ReportPill
              label="Appointment to sale"
              value={`${conversion?.appointmentToSaleRate ?? 0}%`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ReportPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-white p-4">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="mt-1 text-xl font-semibold text-slate-950">{value}</div>
    </div>
  );
}
