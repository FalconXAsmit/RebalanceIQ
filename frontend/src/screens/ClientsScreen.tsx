import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Plus, Users } from 'lucide-react'
import { api, type Client } from '@/lib/api'

const ADVISOR_ID = 1;

export const ClientsScreen = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await api.getClients(ADVISOR_ID);
        setClients(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-6 sm:mb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-1 flex items-center gap-2">
              <Users className="text-brand-orange" /> Clients
            </h1>
            <p className="text-secondary text-sm sm:text-base">
              Manage your client book and their target portfolios.
            </p>
          </div>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => alert('Add client feature coming soon!')}>
            <Plus size={16} /> Add Client
          </Button>
        </div>

        <Card>
          {loading ? (
            <div className="p-8 text-center text-secondary">Loading clients...</div>
          ) : clients.length === 0 ? (
            <div className="p-8 text-center text-secondary">No clients found. Please seed the database.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-default text-secondary text-sm">
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium">Email</th>
                    <th className="p-3 font-medium">Risk Level</th>
                    <th className="p-3 font-medium">Initial Investment</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b border-default hover:bg-navy-50/50 dark:hover:bg-navy-800/30 transition-colors">
                      <td className="p-3 font-medium text-primary">{client.name}</td>
                      <td className="p-3 text-secondary">{client.email || 'N/A'}</td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-brand-orange/10 text-brand-orange text-xs font-semibold rounded-md">
                          {client.risk_level}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-success">${client.initial_investment.toLocaleString()}</td>
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
