import * as React from 'react';

type DashboardTableRow = {
  key: string;
  cells: React.ReactNode[];
};

interface DashboardTableCardProps {
  id?: string;
  title: string;
  description: string;
  countLabel?: string;
  columns: string[];
  rows: DashboardTableRow[];
  minWidthClass?: string;
  emptyMessage?: string;
}

export function DashboardTableCard({
  id,
  title,
  description,
  countLabel,
  columns,
  rows,
  minWidthClass = 'min-w-[620px]',
  emptyMessage = 'No records found.',
}: DashboardTableCardProps) {
  return (
    <section
      id={id}
      className="border-border bg-card/40 rounded-xl border p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-muted-foreground text-sm">{description}</p>
        </div>
        {countLabel ? (
          <span className="text-muted-foreground text-sm">{countLabel}</span>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <div className="border-border text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
          {emptyMessage}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className={`w-full text-left text-sm ${minWidthClass}`}>
            <thead>
              <tr className="border-b">
                {columns.map((column, index) => (
                  <th key={`${column}-${index}`} className={index === 0 ? 'py-2' : ''}>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b last:border-0">
                  {row.cells.map((cell, index) => (
                    <td key={`${row.key}-${index}`} className={index === 0 ? 'py-3' : ''}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
