'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type InventoryItemRecord = {
  _id: string;
  name: string;
  sku: string;
  category?: string;
  unit?: string;
  currentQty?: number;
  isActive?: boolean;
  createdAt?: string;
};

export type InventoryLogRecord = {
  _id: string;
  type: string;
  quantity: number;
  note?: string;
  loggedBy?: {
    type?: string;
    name?: string;
    role?: string;
  };
  loggedByRole?: string;
  item?: {
    _id?: string;
    name?: string;
    sku?: string;
    category?: string;
    unit?: string;
  };
  createdAt?: string;
};

type CreateItemPayload = {
  name: string;
  sku: string;
  category: string;
  unit: string;
  currentQty: number;
  isActive: boolean;
};

type LogInventoryPayload = {
  itemId: string;
  sku: string;
  quantity: number;
  note: string;
};

interface AdminInventoryPanelProps {
  items: InventoryItemRecord[];
  logs: InventoryLogRecord[];
  loading?: boolean;
  onCreateItem: (payload: CreateItemPayload) => Promise<void>;
  onLogInventory: (payload: LogInventoryPayload) => Promise<void>;
  creatingItem?: boolean;
  loggingInventory?: boolean;
}

export function AdminInventoryPanel({
  items,
  logs,
  loading = false,
  onCreateItem,
  onLogInventory,
  creatingItem = false,
  loggingInventory = false,
}: AdminInventoryPanelProps) {
  const [createForm, setCreateForm] = useState<CreateItemPayload>({
    name: '',
    sku: '',
    category: 'other',
    unit: 'pcs',
    currentQty: 0,
    isActive: true,
  });

  const [logForm, setLogForm] = useState<LogInventoryPayload>({
    itemId: '',
    sku: '',
    quantity: 1,
    note: '',
  });

  const selectedItem = useMemo(
    () => items.find((item) => item._id === logForm.itemId),
    [items, logForm.itemId],
  );

  const handleCreateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onCreateItem(createForm);
    setCreateForm({
      name: '',
      sku: '',
      category: 'other',
      unit: 'pcs',
      currentQty: 0,
      isActive: true,
    });
  };

  const handleLogSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onLogInventory({
      ...logForm,
      sku: selectedItem?.sku ?? logForm.sku,
    });
    setLogForm({
      itemId: '',
      sku: '',
      quantity: 1,
      note: '',
    });
  };

  return (
    <section
      id="inventory"
      className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-32px_rgba(15,23,42,0.25)]"
    >
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Inventory
          </p>
          <h2 className="text-2xl font-semibold text-slate-950">
            Stock and inward operations
          </h2>
        </div>
        <p className="text-sm text-slate-600">
          Admin inventory management powered by `/inventory/items`, `/inventory/admin/log-in`,
          and `/inventory/logs`.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <form
            onSubmit={handleCreateSubmit}
            className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
          >
            <h3 className="mb-4 text-lg font-semibold text-slate-950">
              Create inventory item
            </h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <Input
                value={createForm.name}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Item name"
                required
              />
              <Input
                value={createForm.sku}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, sku: event.target.value }))
                }
                placeholder="SKU"
                required
              />
              <select
                className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm"
                value={createForm.category}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
              >
                <option value="hearing-aid">Hearing Aid</option>
                <option value="battery">Battery</option>
                <option value="accessory">Accessory</option>
                <option value="other">Other</option>
              </select>
              <Input
                value={createForm.unit}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, unit: event.target.value }))
                }
                placeholder="Unit"
              />
              <Input
                type="number"
                min={0}
                value={String(createForm.currentQty)}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    currentQty: Number(event.target.value),
                  }))
                }
                placeholder="Opening quantity"
              />
              <label className="flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={createForm.isActive}
                  onChange={(event) =>
                    setCreateForm((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                />
                Active item
              </label>
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit" disabled={creatingItem}>
                {creatingItem ? 'Creating...' : 'Create Item'}
              </Button>
            </div>
          </form>

          <form
            onSubmit={handleLogSubmit}
            className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
          >
            <h3 className="mb-4 text-lg font-semibold text-slate-950">
              Log stock in
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <select
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                value={logForm.itemId}
                onChange={(event) =>
                  setLogForm((current) => ({
                    ...current,
                    itemId: event.target.value,
                    sku:
                      items.find((item) => item._id === event.target.value)?.sku ?? '',
                  }))
                }
                required
              >
                <option value="">Select item</option>
                {items.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name} • {item.sku} • Qty {item.currentQty ?? 0}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Input
                  type="number"
                  min={1}
                  value={String(logForm.quantity)}
                  onChange={(event) =>
                    setLogForm((current) => ({
                      ...current,
                      quantity: Number(event.target.value),
                    }))
                  }
                  placeholder="Quantity"
                  required
                />
                <Input
                  value={selectedItem?.sku ?? logForm.sku}
                  onChange={(event) =>
                    setLogForm((current) => ({ ...current, sku: event.target.value }))
                  }
                  placeholder="SKU"
                  required
                />
              </div>
              <textarea
                className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                value={logForm.note}
                onChange={(event) =>
                  setLogForm((current) => ({ ...current, note: event.target.value }))
                }
                placeholder="Stock-in note"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button type="submit" disabled={loggingInventory}>
                {loggingInventory ? 'Logging...' : 'Log Stock In'}
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <h3 className="mb-4 text-lg font-semibold text-slate-950">Inventory items</h3>
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100" />
                ))
              ) : items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                  No inventory items found yet.
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item._id}
                    className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-950">
                        {item.name}
                      </div>
                      <div className="truncate text-xs text-slate-500">
                        {item.sku} • {item.category ?? 'other'} • {item.unit ?? 'pcs'}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        Qty {item.currentQty ?? 0}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.isActive !== false
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {item.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <h3 className="mb-4 text-lg font-semibold text-slate-950">Recent stock logs</h3>
            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100" />
                ))
              ) : logs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                  No inventory logs found yet.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log._id}
                    className="rounded-xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-slate-950">
                          {log.item?.name ?? 'Unknown item'} • {log.item?.sku ?? 'No SKU'}
                        </div>
                        <div className="text-xs text-slate-500">
                          Logged by {log.loggedBy?.name ?? 'Unknown'} •{' '}
                          {log.loggedBy?.role ?? log.loggedByRole ?? 'unknown role'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700">
                          {log.type} {log.quantity}
                        </span>
                        <span className="text-xs text-slate-500">
                          {log.createdAt
                            ? new Date(log.createdAt).toLocaleString()
                            : 'Unknown time'}
                        </span>
                      </div>
                    </div>
                    {log.note ? (
                      <p className="mt-2 text-sm text-slate-600">{log.note}</p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
