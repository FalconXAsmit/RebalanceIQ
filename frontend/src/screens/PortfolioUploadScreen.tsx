import { useState, useRef } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Upload, FileJson, FileText, Info, CheckCircle, AlertTriangle, X, Plus, Trash2, PencilLine } from 'lucide-react'
import { api } from '@/lib/api'

interface Holding {
  ticker: string
  name: string
  quantity: number
  avg_cost: number
  current_value: number
  weight: number
}

interface PortfolioData {
  client_name: string
  date: string
  holdings: Holding[]
  total_value: number
}

const SAMPLE_JSON = `{
  "client_name": "Priya Sharma",
  "date": "2026-09-01",
  "holdings": [
    {
      "ticker": "RELIANCE.NS",
      "name": "Reliance Industries",
      "quantity": 50,
      "avg_cost": 2450.00,
      "current_value": 137500.00,
      "weight": 0.275
    },
    {
      "ticker": "TCS.NS",
      "name": "Tata Consultancy Services",
      "quantity": 30,
      "avg_cost": 3200.00,
      "current_value": 108000.00,
      "weight": 0.216
    },
    {
      "ticker": "HDFCBANK.NS",
      "name": "HDFC Bank",
      "quantity": 40,
      "avg_cost": 1580.00,
      "current_value": 68000.00,
      "weight": 0.136
    },
    {
      "ticker": "INFY.NS",
      "name": "Infosys",
      "quantity": 60,
      "avg_cost": 1400.00,
      "current_value": 90000.00,
      "weight": 0.180
    },
    {
      "ticker": "SBI_BOND_FUND",
      "name": "SBI Bond Fund",
      "quantity": 1000,
      "avg_cost": 48.50,
      "current_value": 52000.00,
      "weight": 0.104
    },
    {
      "ticker": "GOLD_ETF",
      "name": "Gold ETF",
      "quantity": 200,
      "avg_cost": 220.00,
      "current_value": 44500.00,
      "weight": 0.089
    }
  ],
  "total_value": 500000.00
}`

const SAMPLE_PDF_INFO = `Your PDF should contain a table or structured text with these columns:

┌──────────────┬──────────────────────────┬──────┬───────────┬───────────────┬────────┐
│ Ticker       │ Name                     │ Qty  │ Avg Cost  │ Current Value │ Weight │
├──────────────┼──────────────────────────┼──────┼───────────┼───────────────┼────────┤
│ RELIANCE.NS  │ Reliance Industries      │ 50   │ ₹2,450.00 │ ₹1,37,500.00  │ 27.5%  │
│ TCS.NS       │ Tata Consultancy         │ 30   │ ₹3,200.00 │ ₹1,08,000.00  │ 21.6%  │
│ HDFCBANK.NS  │ HDFC Bank                │ 40   │ ₹1,580.00 │ ₹68,000.00    │ 13.6%  │
└──────────────┴──────────────────────────┴──────┴───────────┴───────────────┴────────┘

Include:
• Client name at the top
• Date of portfolio snapshot
• A holdings table with: Ticker, Name, Quantity, Average Cost, Current Value, Weight (%)
• Total portfolio value at the bottom

Most brokerage statements (Zerodha, Groww, etc.) export PDFs in this format.`

export const PortfolioUploadScreen = () => {
  const [uploadMethod, setUploadMethod] = useState<'json' | 'pdf' | 'manual' | null>(null)
  const [jsonInput, setJsonInput] = useState('')
  const [parsedData, setParsedData] = useState<PortfolioData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showFormat, setShowFormat] = useState(false)
  const [manualHoldings, setManualHoldings] = useState<Holding[]>([])
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleJsonParse = () => {
    setError(null)
    setParsedData(null)
    try {
      const data = JSON.parse(jsonInput)
      if (!data.holdings || !Array.isArray(data.holdings) || data.holdings.length === 0) {
        throw new Error('JSON must contain a non-empty "holdings" array')
      }
      for (const h of data.holdings) {
        if (!h.ticker || h.quantity === undefined || h.current_value === undefined) {
          throw new Error(`Each holding must have "ticker", "quantity", and "current_value". Issue found in: ${JSON.stringify(h)}`)
        }
      }
      const totalValue = data.total_value || data.holdings.reduce((s: number, h: any) => s + (h.current_value || 0), 0)
      const parsed: PortfolioData = {
        client_name: data.client_name || 'Unknown',
        date: data.date || new Date().toISOString().split('T')[0],
        holdings: data.holdings.map((h: any) => ({
          ...h,
          weight: h.weight || h.current_value / totalValue,
        })),
        total_value: totalValue,
      }
      setParsedData(parsed)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.')
      return
    }
    setPdfFile(file)
    setError(null)
    // Simulate PDF parsing with demo data
    setTimeout(() => {
      const demoData: PortfolioData = {
        client_name: file.name.replace('.pdf', ''),
        date: new Date().toISOString().split('T')[0],
        holdings: [
          { ticker: 'RELIANCE.NS', name: 'Reliance Industries', quantity: 50, avg_cost: 2450, current_value: 137500, weight: 0.275 },
          { ticker: 'TCS.NS', name: 'Tata Consultancy Services', quantity: 30, avg_cost: 3200, current_value: 108000, weight: 0.216 },
          { ticker: 'HDFCBANK.NS', name: 'HDFC Bank', quantity: 40, avg_cost: 1580, current_value: 68000, weight: 0.136 },
          { ticker: 'INFY.NS', name: 'Infosys', quantity: 60, avg_cost: 1400, current_value: 90000, weight: 0.180 },
          { ticker: 'SBI_BOND_FUND', name: 'SBI Bond Fund', quantity: 1000, avg_cost: 48.50, current_value: 52000, weight: 0.104 },
          { ticker: 'GOLD_ETF', name: 'Gold ETF', quantity: 200, avg_cost: 220, current_value: 44500, weight: 0.089 },
        ],
        total_value: 500000,
      }
      setParsedData(demoData)
    }, 1500)
  }

  const handleSubmit = async () => {
    if (!parsedData) return
    try {
      await api.uploadPortfolio(parsedData)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
      setParsedData(null)
      setJsonInput('')
      setPdfFile(null)
      setUploadMethod(null)
    } catch (err: any) {
      setError('Failed to upload portfolio: ' + err.message)
    }
  }

  const addManualHolding = () => {
    setManualHoldings([...manualHoldings, { ticker: '', name: '', quantity: 0, avg_cost: 0, current_value: 0, weight: 0 }])
  }

  const updateManualHolding = (index: number, field: keyof Holding, value: any) => {
    const updated = [...manualHoldings]
    ;(updated[index] as any)[field] = value
    setManualHoldings(updated)
  }

  const removeManualHolding = (index: number) => {
    setManualHoldings(manualHoldings.filter((_, i) => i !== index))
  }

  const handleManualSubmit = () => {
    const valid = manualHoldings.filter((h) => h.ticker && h.quantity > 0)
    if (valid.length === 0) {
      setError('Add at least one holding with a ticker and quantity before continuing.')
      return
    }
    const totalValue = valid.reduce((s, h) => s + (h.current_value || h.quantity * (h.avg_cost || 0)), 0)
    const parsed: PortfolioData = {
      client_name: 'Manual Portfolio',
      date: new Date().toISOString().split('T')[0],
      holdings: valid.map((h) => ({
        ...h,
        name: h.name || h.ticker,
        current_value: h.current_value || h.quantity * (h.avg_cost || 0),
        weight: h.weight || (h.current_value || h.quantity * (h.avg_cost || 0)) / totalValue,
      })),
      total_value: totalValue,
    }
    setError(null)
    setParsedData(parsed)
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-6 sm:mb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight mb-1 flex items-center gap-2">
              <Upload className="text-brand-orange" /> Portfolio Upload
            </h1>
            <p className="text-secondary text-sm sm:text-base">
              Import your past portfolio data for accurate drift measurement and analysis.
            </p>
          </div>
          <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowFormat(true)}>
            <Info size={16} /> View Format Guide
          </Button>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-success/10 border border-success/30 rounded-xl flex items-center gap-3 animate-fadeIn">
            <CheckCircle className="text-success" size={20} />
            <span className="text-success font-medium">Portfolio uploaded successfully! It will be used for drift analysis.</span>
          </div>
        )}

        {/* Upload Method Selection */}
        {!uploadMethod && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              className="cursor-pointer hover:border-brand-orange/50 hover:shadow-lg transition-all group"
              onClick={() => setUploadMethod('json')}
            >
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileJson size={32} className="text-brand-orange" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">Upload JSON</h3>
                <p className="text-secondary text-sm">Paste or type your portfolio data in JSON format. Best for programmatic exports.</p>
              </div>
            </Card>

            <Card
              className="cursor-pointer hover:border-brand-orange/50 hover:shadow-lg transition-all group"
              onClick={() => setUploadMethod('pdf')}
            >
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText size={32} className="text-sky-500" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">Upload PDF</h3>
                <p className="text-secondary text-sm">Upload a brokerage statement or portfolio report in PDF format.</p>
              </div>
            </Card>

            <Card
              className="cursor-pointer hover:border-emerald-500/50 hover:shadow-lg transition-all group"
              onClick={() => {
                setUploadMethod('manual')
                if (manualHoldings.length === 0) addManualHolding()
              }}
            >
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <PencilLine size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">Manual Entry</h3>
                <p className="text-secondary text-sm">Type your portfolio holdings yourself — add each position, quantity and value by hand.</p>
              </div>
            </Card>
          </div>
        )}

        {/* JSON Input */}
        {uploadMethod === 'json' && !parsedData && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                <FileJson size={20} className="text-brand-orange" /> JSON Portfolio Input
              </h2>
              <button onClick={() => { setUploadMethod(null); setError(null) }} className="text-secondary hover:text-primary">
                <X size={18} />
              </button>
            </div>
            <textarea
              className="w-full h-64 bg-navy-50 dark:bg-navy-900 border border-default rounded-xl px-4 py-3 text-primary font-mono text-sm focus:outline-none focus:border-brand-orange resize-none"
              placeholder={`Paste your JSON portfolio data here...\n\nExample:\n${SAMPLE_JSON.substring(0, 200)}...`}
              value={jsonInput}
              onChange={e => setJsonInput(e.target.value)}
            />
            <div className="flex items-center justify-between mt-4">
              <button
                className="text-sm text-brand-orange hover:underline"
                onClick={() => setJsonInput(SAMPLE_JSON)}
              >
                Load sample data
              </button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setUploadMethod(null); setJsonInput(''); setError(null) }}>Cancel</Button>
                <Button onClick={handleJsonParse} disabled={!jsonInput.trim()}>Parse JSON</Button>
              </div>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-error/10 border border-error/30 rounded-xl flex items-start gap-2">
                <AlertTriangle className="text-error shrink-0 mt-0.5" size={16} />
                <span className="text-error text-sm">{error}</span>
              </div>
            )}
          </Card>
        )}

        {/* PDF Upload */}
        {uploadMethod === 'pdf' && !parsedData && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                <FileText size={20} className="text-sky-500" /> PDF Portfolio Upload
              </h2>
              <button onClick={() => { setUploadMethod(null); setError(null); setPdfFile(null) }} className="text-secondary hover:text-primary">
                <X size={18} />
              </button>
            </div>
            <div
              className="border-2 border-dashed border-default rounded-2xl p-12 text-center cursor-pointer hover:border-brand-orange/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (file) {
                  const fakeEvent = { target: { files: [file] } } as any
                  handlePdfUpload(fakeEvent)
                }
              }}
            >
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
              {pdfFile ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center animate-pulse">
                    <FileText size={32} className="text-success" />
                  </div>
                  <p className="text-primary font-medium">{pdfFile.name}</p>
                  <p className="text-secondary text-sm">Processing PDF...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-navy-100 dark:bg-navy-800 flex items-center justify-center">
                    <Upload size={32} className="text-secondary" />
                  </div>
                  <p className="text-primary font-medium">Drag & drop your PDF here, or click to browse</p>
                  <p className="text-secondary text-sm">Supports brokerage statements from Zerodha, Groww, Angel One, etc.</p>
                </div>
              )}
            </div>
            {error && (
              <div className="mt-4 p-3 bg-error/10 border border-error/30 rounded-xl flex items-start gap-2">
                <AlertTriangle className="text-error shrink-0 mt-0.5" size={16} />
                <span className="text-error text-sm">{error}</span>
              </div>
            )}
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={() => { setUploadMethod(null); setPdfFile(null); setError(null) }}>Cancel</Button>
            </div>
          </Card>
        )}

        {/* Manual Entry */}
        {uploadMethod === 'manual' && !parsedData && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                <PencilLine size={20} className="text-emerald-500" /> Manual Portfolio Entry
              </h2>
              <button onClick={() => { setUploadMethod(null); setError(null) }} className="text-secondary hover:text-primary">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {manualHoldings.map((h, idx) => (
                <div key={idx} className="bg-navy-50 dark:bg-navy-900 rounded-xl border border-default p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                    <div className="lg:col-span-1">
                      <label className="text-xs font-medium text-secondary mb-1 block">Ticker *</label>
                      <input
                        value={h.ticker}
                        onChange={(e) => updateManualHolding(idx, 'ticker', e.target.value)}
                        placeholder="RELIANCE.NS"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-default bg-card text-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-mono"
                      />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="text-xs font-medium text-secondary mb-1 block">Name</label>
                      <input
                        value={h.name}
                        onChange={(e) => updateManualHolding(idx, 'name', e.target.value)}
                        placeholder="Reliance Industries"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-default bg-card text-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-secondary mb-1 block">Quantity</label>
                      <input
                        type="number"
                        min="0"
                        value={h.quantity || ''}
                        onChange={(e) => updateManualHolding(idx, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="50"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-default bg-card text-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-secondary mb-1 block">Avg Cost</label>
                      <input
                        type="number"
                        min="0"
                        value={h.avg_cost || ''}
                        onChange={(e) => updateManualHolding(idx, 'avg_cost', parseFloat(e.target.value) || 0)}
                        placeholder="2450.00"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-default bg-card text-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-secondary mb-1 block">Current Value</label>
                      <input
                        type="number"
                        min="0"
                        value={h.current_value || ''}
                        onChange={(e) => updateManualHolding(idx, 'current_value', parseFloat(e.target.value) || 0)}
                        placeholder="137500"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-default bg-card text-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => removeManualHolding(idx)}
                      className="text-xs text-error hover:text-error/70 font-medium flex items-center gap-1"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={addManualHolding}>
                <Plus size={15} /> Add Holding
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => { setUploadMethod(null); setError(null) }}>Cancel</Button>
                <Button onClick={handleManualSubmit} className="bg-emerald-500 hover:bg-emerald-600">
                  Continue <CheckCircle size={15} />
                </Button>
              </div>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-error/10 border border-error/30 rounded-xl flex items-start gap-2">
                <AlertTriangle className="text-error shrink-0 mt-0.5" size={16} />
                <span className="text-error text-sm">{error}</span>
              </div>
            )}
          </Card>
        )}

        {/* Parsed Data Preview */}
        {parsedData && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                <CheckCircle size={20} className="text-success" /> Portfolio Preview
              </h2>
              <button onClick={() => { setParsedData(null); setUploadMethod(null) }} className="text-secondary hover:text-primary">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-navy-50 dark:bg-navy-900 rounded-xl p-4">
                <div className="text-xs text-secondary font-medium mb-1">Client</div>
                <div className="text-primary font-bold">{parsedData.client_name}</div>
              </div>
              <div className="bg-navy-50 dark:bg-navy-900 rounded-xl p-4">
                <div className="text-xs text-secondary font-medium mb-1">Date</div>
                <div className="text-primary font-bold">{parsedData.date}</div>
              </div>
              <div className="bg-navy-50 dark:bg-navy-900 rounded-xl p-4">
                <div className="text-xs text-secondary font-medium mb-1">Total Value</div>
                <div className="text-success font-bold">₹{parsedData.total_value.toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-default text-secondary text-sm">
                    <th className="p-3 font-medium">Ticker</th>
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium">Qty</th>
                    <th className="p-3 font-medium">Avg Cost</th>
                    <th className="p-3 font-medium">Current Value</th>
                    <th className="p-3 font-medium">Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.holdings.map((h, i) => (
                    <tr key={i} className="border-b border-default hover:bg-navy-50/50 dark:hover:bg-navy-800/30 transition-colors">
                      <td className="p-3 font-mono text-sm text-brand-orange font-bold">{h.ticker}</td>
                      <td className="p-3 text-primary">{h.name || '-'}</td>
                      <td className="p-3 text-secondary">{h.quantity}</td>
                      <td className="p-3 text-secondary">₹{h.avg_cost?.toLocaleString('en-IN') || '-'}</td>
                      <td className="p-3 text-success font-medium">₹{h.current_value.toLocaleString('en-IN')}</td>
                      <td className="p-3 text-secondary">{(h.weight * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => { setParsedData(null); setUploadMethod(null) }}>Cancel</Button>
              <Button onClick={handleSubmit}>
                <CheckCircle size={16} className="mr-2" /> Confirm & Upload
              </Button>
            </div>
          </Card>
        )}

        {/* Format Guide Modal */}
        <Modal open={showFormat} onClose={() => setShowFormat(false)} title="Portfolio Data Format Guide" size="lg">
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-primary mb-3 flex items-center gap-2">
                <FileJson size={18} className="text-brand-orange" /> JSON Format
              </h3>
              <pre className="bg-navy-50 dark:bg-navy-900 rounded-xl p-4 text-xs overflow-auto max-h-64 text-primary font-mono border border-default">
                {SAMPLE_JSON}
              </pre>
            </div>

            <div className="border-t border-default pt-6">
              <h3 className="text-base font-bold text-primary mb-3 flex items-center gap-2">
                <FileText size={18} className="text-sky-500" /> PDF Format
              </h3>
              <pre className="bg-navy-50 dark:bg-navy-900 rounded-xl p-4 text-xs overflow-auto max-h-64 text-primary font-mono border border-default whitespace-pre-wrap">
                {SAMPLE_PDF_INFO}
              </pre>
            </div>

            <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-xl p-4">
              <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                <Info size={16} className="text-brand-orange" /> Required Fields
              </h4>
              <ul className="text-sm text-secondary space-y-1">
                <li>• <strong>ticker</strong> — Stock symbol (e.g., RELIANCE.NS, TCS.NS, HDFCBANK.NS)</li>
                <li>• <strong>quantity</strong> — Number of shares/units held</li>
                <li>• <strong>current_value</strong> — Current market value of the holding</li>
                <li>• <strong>name</strong> — Company/fund name (optional but recommended)</li>
                <li>• <strong>avg_cost</strong> — Average purchase price per unit (optional)</li>
                <li>• <strong>weight</strong> — Portfolio weight as decimal, e.g. 0.25 = 25% (auto-calculated if missing)</li>
              </ul>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}
