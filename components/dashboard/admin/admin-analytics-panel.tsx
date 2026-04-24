'use client';

type StatsBucket = {
  count: number;
  status?: string;
  type?: string;
  paymentStatus?: string;
};

type DailyPoint = {
  date: string;
  count: number;
};

type TopStaff = {
  staffId: string;
  name: string;
  role?: string;
  specialization?: string;
  count: number;
};

interface AdminAnalyticsPanelProps {
  status: StatsBucket[];
  types: StatsBucket[];
  payments: StatsBucket[];
  daily: DailyPoint[];
  topStaff: TopStaff[];
  loading?: boolean;
}

function ProgressList({
  title,
  items,
  keyLabel,
  emptyLabel,
}: {
  title: string;
  items: StatsBucket[];
  keyLabel: keyof StatsBucket;
  emptyLabel: string;
}) {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <div className="rounded-xl border p-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </h3>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">{emptyLabel}</p>
        ) : (
          items.map((item) => (
            <div key={`${String(item[keyLabel])}-${item.count}`} className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="capitalize text-slate-700">
                  {String(item[keyLabel] ?? 'Unknown')}
                </span>
                <span className="font-semibold text-slate-900">{item.count}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-900"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function AdminAnalyticsPanel({
  status,
  types,
  payments,
  daily,
  topStaff,
  loading = false,
}: AdminAnalyticsPanelProps) {
  const maxDaily = Math.max(...daily.map((point) => point.count), 1);

  return (
    <section
      id="analytics"
      className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.25)]"
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Analytics
          </p>
          <h2 className="text-2xl font-semibold text-slate-950">
            Appointment and payment insights
          </h2>
        </div>
        <p className="max-w-xl text-sm text-slate-600">
          This section surfaces the richer `/admin/stats` response so the panel is
          not limited to top-level summary cards anymore.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-48 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ProgressList
              title="Status Mix"
              items={status}
              keyLabel="status"
              emptyLabel="No appointment status data in the selected window."
            />
            <ProgressList
              title="Appointment Types"
              items={types}
              keyLabel="type"
              emptyLabel="No appointment type data in the selected window."
            />
            <ProgressList
              title="Payment States"
              items={payments}
              keyLabel="paymentStatus"
              emptyLabel="No payment breakdown available."
            />

            <div className="rounded-xl border p-4">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Top Staff
              </h3>
              <div className="space-y-3">
                {topStaff.length === 0 ? (
                  <p className="text-sm text-slate-500">No staff activity found.</p>
                ) : (
                  topStaff.map((staffMember, index) => (
                    <div
                      key={staffMember.staffId}
                      className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {index + 1}. {staffMember.name}
                        </div>
                        <div className="truncate text-xs text-slate-500">
                          {staffMember.specialization || staffMember.role || 'Staff'}
                        </div>
                      </div>
                      <div className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        {staffMember.count} appts
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border p-4">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Daily Volume
            </h3>
            <div className="space-y-3">
              {daily.length === 0 ? (
                <p className="text-sm text-slate-500">No daily trend data found.</p>
              ) : (
                daily.map((point) => (
                  <div key={point.date} className="space-y-1">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-700">
                        {new Date(point.date).toLocaleDateString()}
                      </span>
                      <span className="font-semibold text-slate-900">{point.count}</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                        style={{ width: `${(point.count / maxDaily) * 100}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
