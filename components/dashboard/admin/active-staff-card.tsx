type StaffMember = {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  specialization?: string;
  isActive?: boolean;
};

interface ActiveStaffCardProps {
  staff: StaffMember[];
  getStaffName: (staffMember: StaffMember) => string;
}

export function ActiveStaffCard({
  staff,
  getStaffName,
}: ActiveStaffCardProps) {
  return (
    <div className="border-border bg-card/40 rounded-xl border p-6">
      <h3 className="mb-4 text-xl font-semibold">Active Staff</h3>
      <div className="space-y-3">
        {staff.length === 0 && (
          <div className="border-border text-muted-foreground rounded-lg border border-dashed p-6 text-center text-sm">
            No staff records found.
          </div>
        )}
        {staff.map((member) => (
          <div
            key={member._id}
            className="hover:bg-accent/50 flex items-center justify-between rounded-lg p-2 transition-colors"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">
                {getStaffName(member)}
              </div>
              <div className="text-muted-foreground truncate text-xs">
                {member.specialization || member.role || 'Staff'}
              </div>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                member.isActive === false
                  ? 'bg-red-500/10 text-red-500'
                  : 'bg-green-500/10 text-green-500'
              }`}
            >
              {member.isActive === false ? 'Inactive' : 'Active'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
