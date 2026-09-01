import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Plus, Users } from 'lucide-react'
import { api, type Client } from '@/lib/api'

const ADVISOR_ID = 1;

export const ClientsScreen = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', risk_level: 'Medium', initial_investment: 0 });

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.addClient(formData);
    setIsModalOpen(false);
    setFormData({ name: '', email: '', risk_level: 'Medium', initial_investment: 0 });
    const data = await api.getClients(ADVISOR_ID);
    setClients(data);
  };

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
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
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
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Client">
          <form onSubmit={handleAddClient} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Name</label>
              <input required type="text" className="w-full bg-navy-50 dark:bg-navy-900 border border-default rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-brand-orange" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Email</label>
              <input type="email" className="w-full bg-navy-50 dark:bg-navy-900 border border-default rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-brand-orange" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Risk Level</label>
              <select className="w-full bg-navy-50 dark:bg-navy-900 border border-default rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-brand-orange" value={formData.risk_level} onChange={e => setFormData({...formData, risk_level: e.target.value})}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Initial Investment</label>
              <input required type="number" min="0" className="w-full bg-navy-50 dark:bg-navy-900 border border-default rounded-lg px-3 py-2 text-primary focus:outline-none focus:border-brand-orange" value={formData.initial_investment} onChange={e => setFormData({...formData, initial_investment: Number(e.target.value)})} />
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Add Client</Button>
            </div>
          </form>
        </Modal>
    </DashboardLayout>
  )
}
