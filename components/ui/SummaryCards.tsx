'use client';

export default function SummaryCards({ summary }: any) {
  const data = [
    { label: 'Total Users', value: summary.totalUsers },
    { label: 'Total Staff', value: summary.totalEmp },
    { label: 'Total Admins', value: summary.totalAdmins },
    { label: 'Total Appointments', value: summary.totalAppointments },
    { label: 'Today Appointments', value: summary.todayAppointments },
    { label: 'Pending Payments', value: summary.pendingPayments },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {data.map((item) => (
        <div
          key={item.label}
          className="bg-white p-4 rounded-lg shadow text-center border border-gray-100"
        >
          <p className="text-sm text-gray-500">{item.label}</p>
          <p className="text-xl font-semibold text-gray-900">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
