'use client';
export default function TodayScheduleTable({ schedule }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Today’s Schedule</h2>
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2">Patient</th>
            <th>Staff</th>
            <th>Specialization</th>
            <th>Status</th>
            <th>Appointment Time</th>
          </tr>
        </thead>
        <tbody>
          {schedule.map((item: any) => (
            <tr key={item._id} className="border-b hover:bg-gray-50">
              <td>{item.patient?.firstName} {item.patient?.lastName}</td>
              <td>{item.staff?.firstName} {item.staff?.lastName}</td>
              <td>{item.staff?.specialization}</td>
              <td>{item.status}</td>
              <td>{new Date(item.appointmentdate).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
