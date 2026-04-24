import { Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type PatientProfileFormState = {
  phone: string;
  alternatePhone: string;
  gender: string;
  dob: string;
  guardianName: string;
  relationWithPatient: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  leadSource: string;
  referredBy: string;
  primaryConcern: string;
  diagnosis: string;
  medicalHistory: string;
  clinicalNotes: string;
  caseStatus: string;
  nextFollowUpDate: string;
};

interface PatientProfileFormProps {
  form: PatientProfileFormState;
  onChange: (field: keyof PatientProfileFormState, value: string) => void;
  onSave: () => void;
  message: string | null;
  saving: boolean;
}

export function PatientProfileForm({
  form,
  onChange,
  onSave,
  message,
  saving,
}: PatientProfileFormProps) {
  return (
    <section className="border-border bg-card/40 rounded-xl border p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Patient Profile</h2>
        <p className="text-muted-foreground text-sm">
          Writes to `/user/profile` with the full backend-supported profile shape.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone</label>
          <Input
            value={form.phone}
            onChange={(event) => onChange('phone', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Alternate Phone</label>
          <Input
            value={form.alternatePhone}
            onChange={(event) => onChange('alternatePhone', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Gender</label>
          <select
            className="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs"
            value={form.gender}
            onChange={(event) => onChange('gender', event.target.value)}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Date of Birth</label>
          <Input
            type="date"
            value={form.dob}
            onChange={(event) => onChange('dob', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Guardian Name</label>
          <Input
            value={form.guardianName}
            onChange={(event) => onChange('guardianName', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Relation</label>
          <Input
            value={form.relationWithPatient}
            onChange={(event) => onChange('relationWithPatient', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Emergency Contact Name</label>
          <Input
            value={form.emergencyContactName}
            onChange={(event) =>
              onChange('emergencyContactName', event.target.value)
            }
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Emergency Contact Phone</label>
          <Input
            value={form.emergencyContactPhone}
            onChange={(event) =>
              onChange('emergencyContactPhone', event.target.value)
            }
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Address Line 1</label>
          <Input
            value={form.addressLine1}
            onChange={(event) => onChange('addressLine1', event.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Address Line 2</label>
          <Input
            value={form.addressLine2}
            onChange={(event) => onChange('addressLine2', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">City</label>
          <Input
            value={form.city}
            onChange={(event) => onChange('city', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">State</label>
          <Input
            value={form.state}
            onChange={(event) => onChange('state', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Pincode</label>
          <Input
            value={form.pincode}
            onChange={(event) => onChange('pincode', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Lead Source</label>
          <Input
            value={form.leadSource}
            onChange={(event) => onChange('leadSource', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Referred By</label>
          <Input
            value={form.referredBy}
            onChange={(event) => onChange('referredBy', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Primary Concern</label>
          <Input
            value={form.primaryConcern}
            onChange={(event) => onChange('primaryConcern', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Diagnosis</label>
          <Input
            value={form.diagnosis}
            onChange={(event) => onChange('diagnosis', event.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Medical History</label>
          <textarea
            className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm shadow-xs"
            value={form.medicalHistory}
            onChange={(event) => onChange('medicalHistory', event.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Clinical Notes</label>
          <textarea
            className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm shadow-xs"
            value={form.clinicalNotes}
            onChange={(event) => onChange('clinicalNotes', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Case Status</label>
          <Input
            value={form.caseStatus}
            onChange={(event) => onChange('caseStatus', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Next Follow-up</label>
          <Input
            type="date"
            value={form.nextFollowUpDate}
            onChange={(event) =>
              onChange('nextFollowUpDate', event.target.value)
            }
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">{message ?? ' '}</p>
        <Button onClick={onSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </section>
  );
}
