'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Users, Activity, DollarSign, Eye } from 'lucide-react';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { RevenueChart } from '@/components/ui/revenue-chart';
import { UsersTable } from '@/components/ui/users-table';
import { QuickActions } from '@/components/ui/quick-actions';
import { SystemStatus } from '@/components/ui/system-status';
import { RecentActivity } from '@/components/ui/recent-activity';
import { DashboardHeader } from '@/components/ui/dashboard-header';
import { AdminSidebar } from '@/components/ui/admin-sidebar';
import axios from 'axios';

export default function AdminDashboard() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const router = useRouter();

  // ✅ Fetch Dashboard Summary
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get('http://localhost:3000/api/v1/admin/dashboard', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setDashboardData(res.data.summary);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ✅ Fetch Admin Info (/me)
  useEffect(() => {
    const fetchAdmin = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get('http://localhost:3000/api/v1/admin/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const name = res.data?.admin?.firstName || res.data?.admin?.username || '';
        setUsername(name);
      } catch (err) {
        console.error('❌ Failed to fetch admin info:', err);
      }
    };

    fetchAdmin();
  }, []);

  // ✅ Handlers
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
  };

  const handleExport = () => {
    console.log('Exporting data...');
    // Optional: Add export logic here
  };

  const handleAddUser = () => {
    // Redirect to add new user page
    router.push('/adduser');
  };

  // ✅ Loading State
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // ✅ Error State
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  // ✅ Dashboard Stats
  const stats = [
    {
      title: 'Total Users',
      value: dashboardData?.totalUsers ?? 0,
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Total Employee',
      value: dashboardData?.totalEmp ?? 0,
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Today Appointments',
      value: dashboardData?.todayAppointments ?? '0',
      change: '+15%',
      changeType: 'positive' as const,
      icon: Activity,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Pending Payments',
      value: dashboardData?.pendingPayments ?? '0',
      change: '-2.4%',
      changeType: 'negative' as const,
      icon: Eye,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
  ];

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <DashboardHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={handleRefresh}
          onExport={handleExport}
          isRefreshing={isRefreshing}
        />

        <div className="flex flex-1 flex-col gap-2 p-2 pt-0 sm:gap-4 sm:p-4">
          <div className="min-h-[calc(100vh-4rem)] flex-1 rounded-lg p-3 sm:rounded-xl sm:p-4 md:p-6">
            <div className="mx-auto max-w-6xl space-y-4 sm:space-y-6">
              <div className="px-2 sm:px-0">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Welcome {username}
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Here&apos;s what&apos;s happening with your platform today.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
                {stats.map((stat, index) => (
                  <DashboardCard key={stat.title} stat={stat} index={index} />
                ))}
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 gap-4 sm:gap-6 xl:grid-cols-3">
                <div className="space-y-4 sm:space-y-6 xl:col-span-2">
                 
                  <UsersTable onAddUser={handleAddUser} />
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <QuickActions onAddUser={handleAddUser} onExport={handleExport} />
                 
                  <RecentActivity />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
