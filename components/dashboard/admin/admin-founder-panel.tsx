'use client';

import { useMemo, useState } from 'react';
import {
  Banknote,
  Building2,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Headphones,
  ReceiptIndianRupee,
  TriangleAlert,
  Trophy,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type BranchRecord = {
  _id: string;
  name: string;
  code: string;
  city: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
  manager?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  };
};

type BranchMetric = {
  branchId?: string | null;
  branch?: BranchRecord | null;
  revenue?: number;
  salesCount?: number;
  dueAmount?: number;
  appointments?: number;
};

type FounderDashboard = {
  summary?: {
    branchCount?: number;
    activeBranchCount?: number;
    totalSalesToday?: number;
    totalSalesCountToday?: number;
    totalCollectionToday?: number;
    totalCollectionCountToday?: number;
    totalPendingDues?: number;
    pendingDueSalesCount?: number;
  };
  branchWiseRevenue?: BranchMetric[];
  branchWiseAppointments?: BranchMetric[];
  topSellingBranch?: BranchMetric | null;
  topEmployees?: {
    employeeId?: string;
    name?: string;
    role?: string;
    specialization?: string;
    revenue?: number;
    salesCount?: number;
  }[];
  lowStock?: {
    _id: string;
    name: string;
    sku: string;
    currentQty: number;
    branch?: BranchRecord | null;
  }[];
  emiPending?: {
    totalAmount?: number;
    totalCount?: number;
    byBranch?: {
      branch?: BranchRecord | null;
      amount?: number;
      count?: number;
    }[];
  };
  serviceTicketLoad?: {
    totalOpen?: number;
    byBranch?: {
      branch?: BranchRecord | null;
      tickets?: number;
    }[];
  };
};

type BranchDraft = {
  name: string;
  code: string;
  city: string;
  address: string;
  phone: string;
};

interface AdminFounderPanelProps {
  founderDashboard: FounderDashboard | null;
  branches: BranchRecord[];
  onCreateBranch: (payload: BranchDraft) => Promise<void>;
  creatingBranch: boolean;
}

const money = (value?: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value ?? 0);

const branchLabel = (branch?: BranchRecord | null) =>
  branch ? `${branch.name} (${branch.code})` : 'Unassigned legacy records';

export function AdminFounderPanel({
  founderDashboard,
  branches,
  onCreateBranch,
  creatingBranch,
}: AdminFounderPanelProps) {
  const [draft, setDraft] = useState<BranchDraft>({
    name: '',
    code: '',
    city: '',
    address: '',
    phone: '',
  });

  const summary = founderDashboard?.summary;
  const cards = useMemo(
    () => [
      {
        title: 'Sales Today',
        value: money(summary?.totalSalesToday),
        detail: `${summary?.totalSalesCountToday ?? 0} sales`,
        icon: CircleDollarSign,
      },
      {
        title: 'Collection Today',
        value: money(summary?.totalCollectionToday),
        detail: `${summary?.totalCollectionCountToday ?? 0} payments`,
        icon: ReceiptIndianRupee,
      },
      {
        title: 'Pending Dues',
        value: money(summary?.totalPendingDues),
        detail: `${summary?.pendingDueSalesCount ?? 0} sales with dues`,
        icon: Banknote,
      },
      {
        title: 'Active Branches',
        value: String(summary?.activeBranchCount ?? branches.length),
        detail: `${summary?.branchCount ?? branches.length} total centers`,
        icon: Building2,
      },
      {
        title: 'EMI Pending',
        value: money(founderDashboard?.emiPending?.totalAmount),
        detail: `${founderDashboard?.emiPending?.totalCount ?? 0} installments`,
        icon: CalendarDays,
      },
      {
        title: 'Open Tickets',
        value: String(founderDashboard?.serviceTicketLoad?.totalOpen ?? 0),
        detail: 'active service load',
        icon: ClipboardList,
      },
    ],
    [branches.length, founderDashboard, summary],
  );

  const updateDraft = (field: keyof BranchDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const submitBranch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onCreateBranch(draft);
    setDraft({ name: '', code: '', city: '', address: '', phone: '' });
  };

  return (
    <section
      id="founder"
      className="rounded-[1.9rem] border border-slate-200 bg-white/90 p-6 shadow-[0_25px_70px_-35px_rgba(15,23,42,0.35)]"
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Founder Control
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Multi-center business dashboard
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Superadmin-only view for revenue, collections, pending dues, branch load,
            low stock, EMI, and service pressure across all centers.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-300">
            Top branch
          </div>
          <div className="mt-1 text-sm font-semibold">
            {branchLabel(founderDashboard?.topSellingBranch?.branch)}
          </div>
          <div className="text-xs text-slate-300">
            {money(founderDashboard?.topSellingBranch?.revenue)}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {cards.map(({ title, value, detail, icon: Icon }) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <div className="mt-2 text-2xl font-semibold text-slate-950">{value}</div>
                <p className="mt-1 text-xs text-slate-500">{detail}</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Icon className="size-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1fr_0.9fr]">
        <div className="rounded-2xl border border-slate-200 p-5">
          <div className="mb-4 flex items-center gap-3">
            <Trophy className="size-5 text-amber-600" />
            <h3 className="text-lg font-semibold text-slate-950">Branch revenue</h3>
          </div>
          <div className="space-y-3">
            {(founderDashboard?.branchWiseRevenue ?? []).slice(0, 8).map((item, index) => (
              <div key={`${item.branchId ?? 'unassigned'}-${index}`} className="rounded-xl bg-slate-50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-slate-950">{branchLabel(item.branch)}</div>
                    <div className="text-xs text-slate-500">
                      {item.salesCount ?? 0} sales · due {money(item.dueAmount)}
                    </div>
                  </div>
                  <div className="text-right font-semibold text-slate-950">
                    {money(item.revenue)}
                  </div>
                </div>
              </div>
            ))}
            {(founderDashboard?.branchWiseRevenue ?? []).length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                No branch-linked sales yet.
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5">
          <div className="mb-4 flex items-center gap-3">
            <Building2 className="size-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-slate-950">Create branch</h3>
          </div>
          <form onSubmit={submitBranch} className="grid grid-cols-1 gap-3">
            <div>
              <Label htmlFor="branch-name">Branch name</Label>
              <Input
                id="branch-name"
                value={draft.name}
                onChange={(event) => updateDraft('name', event.target.value)}
                placeholder="PS Speech & Hearing Clinic - Dehradun"
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="branch-code">Code</Label>
                <Input
                  id="branch-code"
                  value={draft.code}
                  onChange={(event) => updateDraft('code', event.target.value)}
                  placeholder="DDN"
                  required
                />
              </div>
              <div>
                <Label htmlFor="branch-city">City</Label>
                <Input
                  id="branch-city"
                  value={draft.city}
                  onChange={(event) => updateDraft('city', event.target.value)}
                  placeholder="Dehradun"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="branch-phone">Phone</Label>
              <Input
                id="branch-phone"
                value={draft.phone}
                onChange={(event) => updateDraft('phone', event.target.value)}
                placeholder="+91 ..."
              />
            </div>
            <div>
              <Label htmlFor="branch-address">Address</Label>
              <Input
                id="branch-address"
                value={draft.address}
                onChange={(event) => updateDraft('address', event.target.value)}
                placeholder="Clinic address"
              />
            </div>
            <Button type="submit" disabled={creatingBranch}>
              {creatingBranch ? 'Creating...' : 'Create Branch'}
            </Button>
          </form>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 p-5">
          <div className="mb-4 flex items-center gap-2 font-semibold text-slate-950">
            <Headphones className="size-5 text-violet-600" />
            Top employees
          </div>
          <div className="space-y-3">
            {(founderDashboard?.topEmployees ?? []).map((employee) => (
              <div key={employee.employeeId ?? employee.name} className="rounded-xl bg-slate-50 p-3">
                <div className="font-medium text-slate-950">{employee.name}</div>
                <div className="text-xs text-slate-500">
                  {employee.role ?? 'staff'} · {employee.salesCount ?? 0} sales
                </div>
                <div className="mt-1 text-sm font-semibold">{money(employee.revenue)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5">
          <div className="mb-4 flex items-center gap-2 font-semibold text-slate-950">
            <TriangleAlert className="size-5 text-red-600" />
            Low stock
          </div>
          <div className="space-y-3">
            {(founderDashboard?.lowStock ?? []).slice(0, 6).map((item) => (
              <div key={item._id} className="rounded-xl bg-slate-50 p-3">
                <div className="font-medium text-slate-950">{item.name}</div>
                <div className="text-xs text-slate-500">
                  {item.sku} · {branchLabel(item.branch)}
                </div>
                <div className="mt-1 text-sm font-semibold">{item.currentQty} left</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5">
          <div className="mb-4 flex items-center gap-2 font-semibold text-slate-950">
            <Building2 className="size-5 text-emerald-600" />
            Branches
          </div>
          <div className="space-y-3">
            {branches.map((branch) => (
              <div key={branch._id} className="rounded-xl bg-slate-50 p-3">
                <div className="font-medium text-slate-950">{branch.name}</div>
                <div className="text-xs text-slate-500">
                  {branch.code} · {branch.city} · {branch.isActive ? 'active' : 'inactive'}
                </div>
                {branch.phone ? <div className="mt-1 text-xs text-slate-500">{branch.phone}</div> : null}
              </div>
            ))}
            {branches.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                No branches created yet.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
