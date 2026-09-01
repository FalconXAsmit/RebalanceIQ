import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Bell, Check, X, AlertTriangle, MessageSquare, ShieldAlert } from 'lucide-react'
import { api, type Alert } from '@/lib/api'

const ADVISOR_ID = 1;

export const AlertsScreen = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState<number | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.getPendingAlerts(ADVISOR_ID);
      setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: number, action: string) => {
    try {
      setActioningId(id);
      let notes = "";
      // If approving and compliance failed, require justification
      const alertItem = alerts.find(a => a.id === id);
      if (action === 'approved' && alertItem?.compliance_status === 'fail') {
        const justification = prompt("Compliance failed. Please provide justification to override:");
        if (!justification) return;
        notes = justification;
      }
      
      await api.takeActionOnAlert(id, action, notes);
      // Remove from list
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err: any) {
      alert("Action failed: " + err.message);
    } finally {
      setActioningId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-6 sm:mb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-1 flex items-center gap-2">
              <Bell className="text-brand-orange" /> Pending Alerts
            </h1>
            <p className="text-secondary text-sm sm:text-base">
              Review AI-generated portfolio drift analyses and recommendations.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-secondary">Loading alerts...</div>
        ) : alerts.length === 0 ? (
          <Card>
            <div className="p-8 text-center text-secondary">No pending alerts. All caught up!</div>
          </Card>
        ) : (
          <div className="space-y-6">
            {alerts.map((alert) => (
              <Card key={alert.id} className="border border-brand-orange/20">
                <div className="flex justify-between items-start mb-4 border-b border-default pb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-primary">{alert.client_name}</h2>
                    <div className="flex gap-3 text-sm mt-1">
                      <span className="text-error font-medium">Drift: {alert.drift_percentage.toFixed(2)}%</span>
                      <span className="text-secondary">|</span>
                      <span className={`font-medium ${alert.severity === 'high' ? 'text-error' : 'text-brand-orange'}`}>
                        Severity: {alert.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-success text-success hover:bg-success/10"
                      onClick={() => handleAction(alert.id, 'approved')}
                      disabled={actioningId === alert.id}
                    >
                      <Check size={16} className="mr-1" /> Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-error text-error hover:bg-error/10"
                      onClick={() => handleAction(alert.id, 'rejected')}
                      disabled={actioningId === alert.id}
                    >
                      <X size={16} className="mr-1" /> Reject
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-brand-orange"/> AI Analysis
                    </h3>
                    <p className="text-sm text-secondary whitespace-pre-wrap leading-relaxed">
                      {alert.analysis}
                    </p>
                    
                    <h3 className="text-sm font-semibold text-primary mt-4 mb-2 flex items-center gap-2">
                      <Check size={16} className="text-success"/> Recommendation
                    </h3>
                    <p className="text-sm text-secondary">
                      {alert.recommendation}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-navy-50 dark:bg-navy-800/50 p-4 rounded-xl">
                      <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                        <MessageSquare size={16} className="text-sky-500"/> Draft Email
                      </h3>
                      <p className="text-sm text-secondary whitespace-pre-wrap font-mono text-xs">
                        {alert.draft_email}
                      </p>
                    </div>

                    <div className={`p-4 rounded-xl border ${alert.compliance_status === 'fail' ? 'bg-error/5 border-error/20' : 'bg-success/5 border-success/20'}`}>
                      <h3 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                        <ShieldAlert size={16} className={alert.compliance_status === 'fail' ? 'text-error' : 'text-success'}/> 
                        Compliance Check: {alert.compliance_status.toUpperCase()}
                      </h3>
                      <p className="text-sm text-secondary">
                        {alert.compliance_details}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
