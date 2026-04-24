type CareSnapshotCardProps = {
  email?: string;
  nextAppointmentLabel: string;
  assignedTherapistLabel: string;
  assignedAudiologistLabel: string;
  followUpDateLabel: string;
};

export function CareSnapshotCard({
  email,
  nextAppointmentLabel,
  assignedTherapistLabel,
  assignedAudiologistLabel,
  followUpDateLabel,
}: CareSnapshotCardProps) {
  const items = [
    { label: 'Email', value: email ?? '-' },
    { label: 'Next Appointment', value: nextAppointmentLabel },
    { label: 'Assigned Therapist', value: assignedTherapistLabel },
    { label: 'Assigned Audiologist', value: assignedAudiologistLabel },
    { label: 'Follow-up Date', value: followUpDateLabel },
  ];

  return (
    <section
      id="profile"
      className="border-border bg-card/40 rounded-xl border p-6 xl:col-span-1"
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Care Snapshot</h2>
        <p className="text-muted-foreground text-sm">
          Assigned team and upcoming care details.
        </p>
      </div>

      <div className="space-y-3 text-sm">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg border p-3">
            <div className="text-muted-foreground text-xs">{item.label}</div>
            <div className="font-medium">{item.value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
