import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Plus, Users, Trash2 } from 'lucide-react'
import { api, type Client } from '@/lib/api'

const ADVISOR_ID = 1;

export const ClientsScreen = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form State
  const [creationMode, setCreationMode] = useState<'manual'|'agentic'>('manual');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRiskLevel, setNewRiskLevel] = useState('Moderate');
  const [newInvestment, setNewInvestment] = useState('');
  const [rawText, setRawText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newInvestment) return;
    
    setIsSubmitting(true);
    
    try {
      if (creationMode === 'manual') {
        // Auto-generate target weights based on risk level
        let targetWeights = {};
        if (newRiskLevel === 'Conservative') {
          targetWeights = { "BND": 0.70, "VTI": 0.20, "VXUS": 0.10 };
        } else if (newRiskLevel === 'Aggressive') {
          targetWeights = { "VTI": 0.55, "VXUS": 0.35, "BND": 0.10 };
        } else { // Moderate
          targetWeights = { "VTI": 0.40, "VXUS": 0.20, "BND": 0.40 };
        }
        
        await api.createClient({
          advisor_id: ADVISOR_ID,
          name: newName,
          email: newEmail || undefined,
          risk_level: newRiskLevel,
          initial_investment: parseFloat(newInvestment),
          target_weights: targetWeights
        });
      } else {
        if (!rawText) {
          alert("Please provide client notes/profile for the AI assistant.");
          setIsSubmitting(false);
          return;
        }
        await api.createClientAgentic({
          advisor_id: ADVISOR_ID,
          name: newName,
          email: newEmail || undefined,
          initial_investment: parseFloat(newInvestment),
          raw_data: rawText
        });
      }

      setIsAddModalOpen(false);
      setNewName('');
      setNewEmail('');
      setNewRiskLevel('Moderate');
      setNewInvestment('');
      setRawText('');
      await fetchClients();
    } catch (err) {
      console.error("Failed to add client", err);
      alert("Failed to add client. Please check the console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientId: number) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;
    try {
      await api.deleteClient(clientId);
      await fetchClients();
    } catch (err) {
      console.error("Failed to delete client", err);
      alert("Failed to delete client.");
    }
  };

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
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setIsAddModalOpen(true)}>
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
                    <th className="p-3 font-medium text-right">Actions</th>
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
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Client"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Client">
        <form onSubmit={handleAddClient} className="flex flex-col gap-4">
          <div className="flex bg-navy-800 p-1 rounded-lg border border-default">
            <button
              type="button"
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${creationMode === 'manual' ? 'bg-brand-orange text-white' : 'text-secondary hover:text-primary'}`}
              onClick={() => setCreationMode('manual')}
            >
              Manual Entry
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${creationMode === 'agentic' ? 'bg-brand-orange text-white' : 'text-secondary hover:text-primary'}`}
              onClick={() => setCreationMode('agentic')}
            >
              AI Assistant
            </button>
          </div>

          <Input 
            label="Full Name" 
            placeholder="John Doe" 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            required 
          />
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="john@example.com" 
            value={newEmail} 
            onChange={(e) => setNewEmail(e.target.value)} 
          />
          <Input 
            label="Initial Investment ($)" 
            type="number" 
            min="0"
            step="1000"
            placeholder="10000" 
            value={newInvestment} 
            onChange={(e) => setNewInvestment(e.target.value)} 
            required 
          />

          {creationMode === 'manual' ? (
            <Select 
              label="Risk Level" 
              value={newRiskLevel} 
              onChange={(e) => setNewRiskLevel(e.target.value)}
            >
              <option value="Conservative">Conservative</option>
              <option value="Moderate">Moderate</option>
              <option value="Aggressive">Aggressive</option>
            </Select>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-secondary">
                Client Notes & Profile
              </label>
              <textarea
                className="w-full px-4 py-2.5 rounded-xl border bg-card text-primary text-sm transition-colors duration-200 placeholder:text-navy-400 dark:placeholder:text-navy-500 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange border-default hover:border-navy-300 dark:hover:border-navy-600"
                placeholder="Paste interview notes, goals, or financial history. The AI will classify risk and generate a target portfolio."
                rows={4}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                required={creationMode === 'agentic'}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-default">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Client'}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}
