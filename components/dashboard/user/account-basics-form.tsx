import { Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type AccountFormState = {
  username: string;
  firstName: string;
  lastName: string;
};

interface AccountBasicsFormProps {
  form: AccountFormState;
  onChange: (field: keyof AccountFormState, value: string) => void;
  onSave: () => void;
  message: string | null;
  saving: boolean;
}

export function AccountBasicsForm({
  form,
  onChange,
  onSave,
  message,
  saving,
}: AccountBasicsFormProps) {
  return (
    <section className="border-border bg-card/40 rounded-xl border p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Account Basics</h2>
        <p className="text-muted-foreground text-sm">
          Updates the `/user/update` backend endpoint.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Username</label>
          <Input
            value={form.username}
            onChange={(event) => onChange('username', event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">First Name</label>
          <Input
            value={form.firstName}
            onChange={(event) => onChange('firstName', event.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Last Name</label>
          <Input
            value={form.lastName}
            onChange={(event) => onChange('lastName', event.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">{message ?? ' '}</p>
        <Button onClick={onSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Account'}
        </Button>
      </div>
    </section>
  );
}
