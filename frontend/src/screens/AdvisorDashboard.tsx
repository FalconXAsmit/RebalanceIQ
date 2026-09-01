import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { MetricCard } from '@/components/ui/MetricCard'
import { Button } from '@/components/ui/Button'
import { Users, Bell, Activity, ArrowRight, Play } from 'lucide-react'
import { api, type DashboardStats } from '@/lib/api'
import { useNavigate } from 'react-router-dom'

const ADVISOR_ID = 1; // Hardcoded for demo

export const AdvisorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningBatch, setRunningBatch] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await api.getDashboardStats(ADVISOR_ID);
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleRunBatch = async () => {
    try {
      setRunningBatch(true);
      await api.runBatchCheck(ADVISOR_ID);
      // Re-fetch stats after running
      const data = await api.getDashboardStats(ADVISOR_ID);
      setStats(data);
      navigate('/alerts'); // Go see the new alerts!
    } catch (err: any) {
      alert("Failed to run batch: " + err.message);
    } finally {
      setRunningBatch(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="p-8 flex justify-center text-secondary">Loading dashboard...</div>
    </DashboardLayout>
  );
  
  if (error) return (
    <DashboardLayout>
      <div className="p-8 flex justify-center text-error">Error: {error}</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-6 sm:mb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-1">
              Advisor Dashboard
            </h1>
            <p className="text-secondary text-sm sm:text-base">
              Monitor your book of business and run AI-powered drift checks.
            </p>
          </div>
          <Button 
            onClick={handleRunBatch} 
            disabled={runningBatch}
            className="bg-brand-orange hover:bg-brand-orange-dark text-white shadow-md transition-all hover:-translate-y-0.5"
          >
            {runningBatch ? (
              <span className="flex items-center gap-2">Running...</span>
            ) : (
              <span className="flex items-center gap-2"><Play size={16} /> Run Drift Check</span>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <MetricCard
            label="Total Clients"
            value={stats?.total_clients.toString() || '0'}
            icon={<Users size={14} />}
            positive={true}
            className="!p-4"
          />
          <MetricCard
            label="Pending Alerts"
            value={stats?.pending_alerts.toString() || '0'}
            icon={<Bell size={14} />}
            positive={stats?.pending_alerts === 0}
            className="!p-4 border border-brand-orange/20"
          />
          <MetricCard
            label="Latest Batch Run"
            value={stats?.latest_batch_run ? new Date(stats.latest_batch_run.completed_at).toLocaleDateString() : 'Never'}
            icon={<Activity size={14} />}
            positive={true}
            className="!p-4"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary">Risk Distribution</h2>
            </div>
            <div className="space-y-4">
              {stats?.risk_distribution && Object.entries(stats.risk_distribution).map(([risk, count]) => (
                <div key={risk} className="flex items-center justify-between">
                  <span className="text-secondary font-medium">{risk}</span>
                  <span className="text-primary font-bold">{count} clients</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-brand-orange/[0.05] to-transparent border-brand-orange/10">
            <h2 className="text-lg font-semibold text-primary mb-2">Pending Actions</h2>
            <p className="text-secondary text-sm mb-4">
              You have {stats?.pending_alerts || 0} drift alerts awaiting your review.
            </p>
            <Button variant="outline" onClick={() => navigate('/alerts')}>
              Review Alerts <ArrowRight size={16} className="ml-2" />
            </Button>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
