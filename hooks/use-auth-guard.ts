'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { type AuthRole, getStoredToken } from '@/lib/auth';

type UseAuthGuardOptions = {
  role: AuthRole;
  redirectTo: string;
};

export function useAuthGuard({
  role,
  redirectTo,
}: UseAuthGuardOptions) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const storedToken = getStoredToken(role);

    if (!storedToken) {
      router.replace(redirectTo);
      setIsCheckingAuth(false);
      return;
    }

    setToken(storedToken);
    setIsCheckingAuth(false);
  }, [redirectTo, role, router]);

  return { token, isCheckingAuth };
}
