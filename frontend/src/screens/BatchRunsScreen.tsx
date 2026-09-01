import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Activity, Clock } from 'lucide-react'
import { api, type BatchRun } from '@/lib/api'

const ADVISOR_ID = 1;

export const BatchRunsScreen = () => {
  const [runs, setRuns] = useState<BatchRun[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        const data = await api.getBatchRuns(ADVISOR_ID);
        setRuns(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRuns();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-6 sm:mb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-1 flex items-center gap-2">
              <Activity className="text-brand-orange" /> Batch Runs History
            </h1>
            <p className="text-secondary text-sm sm:text-base">
              View historical records of AI-powered portfolio drift checks.
            </p>
          </div>
        </div>

        <Card>
          {loading ? (
            <div className="p-8 text-center text-secondary">Loading batch runs...</div>
          ) : runs.length === 0 ? (
            <div className="p-8 text-center text-secondary">No batch runs found. Trigger one from the dashboard!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-default text-secondary text-sm">
                    <th className="p-3 font-medium">Date</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Clients Processed</th>
                    <th className="p-3 font-medium">Alerts Flagged</th>
                    <th className="p-3 font-medium">Processing Time</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => (
                    <tr key={run.id} className="border-b border-default hover:bg-navy-50/50 dark:hover:bg-navy-800/30 transition-colors">
                      <td className="p-3 text-primary font-medium">
                        {new Date(run.started_at).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                          run.status === 'completed' ? 'bg-success/10 text-success' : 
                          run.status === 'failed' ? 'bg-error/10 text-error' : 
                          'bg-sky-500/10 text-sky-500'
                        }`}>
                          {run.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-secondary">{run.processed} / {run.total_clients}</td>
                      <td className="p-3">
                        <span className={run.flagged > 0 ? "text-brand-orange font-bold" : "text-secondary"}>
                          {run.flagged}
                        </span>
                      </td>
                      <td className="p-3 text-secondary flex items-center gap-1">
                        <Clock size={14} /> {run.processing_time_seconds ? `${run.processing_time_seconds.toFixed(1)}s` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
