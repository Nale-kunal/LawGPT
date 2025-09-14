import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  IndianRupee, 
  Clock, 
  FileText, 
  User, 
  Calendar,
  Download,
  Send,
  Filter,
  Search
} from 'lucide-react';
import { useLegalData, TimeEntry } from '@/contexts/LegalDataContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: string;
  clientName: string;
  invoiceNumber: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: Date;
  createdDate: Date;
  timeEntries: TimeEntry[];
}

const Billing = () => {
  const { cases, clients, timeEntries, addTimeEntry } = useLegalData();
  const [showTimeDialog, setShowTimeDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  // Mock invoices data - in real app, this would come from context
  const [invoices] = useState<Invoice[]>([
    {
      id: '1',
      clientName: 'Raj Enterprises',
      invoiceNumber: 'INV-2024-001',
      amount: 50000,
      status: 'sent',
      dueDate: new Date('2024-12-31'),
      createdDate: new Date('2024-12-01'),
      timeEntries: []
    },
    {
      id: '2',
      clientName: 'Sharma Industries',
      invoiceNumber: 'INV-2024-002', 
      amount: 75000,
      status: 'paid',
      dueDate: new Date('2024-12-15'),
      createdDate: new Date('2024-11-15'),
      timeEntries: []
    }
  ]);

  // Form state for time entry
  const [timeFormData, setTimeFormData] = useState({
    caseId: '',
    description: '',
    duration: '',
    hourlyRate: '2000',
    date: new Date().toISOString().split('T')[0],
    billable: true
  });

  const resetTimeForm = () => {
    setTimeFormData({
      caseId: '',
      description: '',
      duration: '',
      hourlyRate: '2000',
      date: new Date().toISOString().split('T')[0],
      billable: true
    });
  };

  const handleTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addTimeEntry({
      caseId: timeFormData.caseId,
      description: timeFormData.description,
      duration: parseInt(timeFormData.duration),
      hourlyRate: parseInt(timeFormData.hourlyRate),
      date: new Date(timeFormData.date),
      billable: timeFormData.billable
    });

    toast({
      title: "Time Entry Added",
      description: "Billable time has been recorded successfully",
    });

    setShowTimeDialog(false);
    resetTimeForm();
  };

  // Calculate stats
  const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices.filter(inv => inv.status === 'sent' || inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0);
  const totalHours = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'default';
      case 'sent': return 'secondary';
      case 'overdue': return 'destructive';
      case 'draft': return 'outline';
      default: return 'outline';
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing & Time Tracking</h1>
          <p className="text-muted-foreground">Manage invoices and track billable hours</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={resetTimeForm}>
                <Clock className="mr-2 h-4 w-4" />
                Log Time
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Log Billable Time</DialogTitle>
                <DialogDescription>Record time spent on case work</DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleTimeSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="caseId">Case*</Label>
                  <Select value={timeFormData.caseId} onValueChange={(value) => setTimeFormData(prev => ({ ...prev, caseId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a case" />
                    </SelectTrigger>
                    <SelectContent>
                      {cases.map(case_ => (
                        <SelectItem key={case_.id} value={case_.id}>
                          {case_.caseNumber} - {case_.clientName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (minutes)*</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={timeFormData.duration}
                      onChange={(e) => setTimeFormData(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="e.g., 60"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate (₹)*</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={timeFormData.hourlyRate}
                      onChange={(e) => setTimeFormData(prev => ({ ...prev, hourlyRate: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="date">Date*</Label>
                  <Input
                    id="date"
                    type="date"
                    value={timeFormData.date}
                    onChange={(e) => setTimeFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description*</Label>
                  <Textarea
                    id="description"
                    value={timeFormData.description}
                    onChange={(e) => setTimeFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the work performed..."
                    required
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowTimeDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Log Time</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-card-custom">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalBilled.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">All time invoices</p>
          </CardContent>
        </Card>

        <Card className="shadow-card-custom">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <IndianRupee className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">₹{paidAmount.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">Received payments</p>
          </CardContent>
        </Card>

        <Card className="shadow-card-custom">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <IndianRupee className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">₹{pendingAmount.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">Outstanding invoices</p>
          </CardContent>
        </Card>

        <Card className="shadow-card-custom">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalHours / 60)}h</div>
            <p className="text-xs text-muted-foreground">{totalHours} minutes total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoices */}
        <Card className="lg:col-span-2 shadow-elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Invoices
              </CardTitle>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
            <CardDescription>Manage client invoices and payments</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{invoice.invoiceNumber}</span>
                      <Badge variant={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {invoice.clientName} • Due: {invoice.dueDate.toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">₹{invoice.amount.toLocaleString('en-IN')}</div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">
                        <Send className="mr-1 h-3 w-3" />
                        Send
                      </Button>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredInvoices.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No invoices found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Time Entries */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Time Entries
            </CardTitle>
            <CardDescription>Latest billable hours logged</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeEntries.slice(0, 5).map((entry) => {
                const case_ = cases.find(c => c.id === entry.caseId);
                const amount = (entry.duration / 60) * entry.hourlyRate;
                
                return (
                  <div key={entry.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {case_?.caseNumber || 'Unknown Case'}
                      </span>
                      <Badge variant={entry.billable ? 'default' : 'outline'}>
                        {entry.billable ? 'Billable' : 'Non-billable'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {entry.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {Math.round(entry.duration / 60 * 10) / 10}h @ ₹{entry.hourlyRate}/hr
                      </span>
                      <span className="font-medium">₹{amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {entry.date.toLocaleDateString('en-IN')}
                    </div>
                  </div>
                );
              })}

              {timeEntries.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No time entries yet</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setShowTimeDialog(true)}
                  >
                    <Plus className="mr-2 h-3 w-3" />
                    Log First Entry
                  </Button>
                </div>
              )}

              {timeEntries.length > 5 && (
                <Button variant="outline" className="w-full">
                  View All Entries
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status */}
      <Card className="shadow-card-custom">
        <CardHeader>
          <CardTitle>Payment Overview</CardTitle>
          <CardDescription>Monthly payment status and trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-success mb-1">
                {Math.round((paidAmount / totalBilled) * 100)}%
              </div>
              <p className="text-sm text-muted-foreground">Collection Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">
                ₹{Math.round(totalBilled / invoices.length).toLocaleString('en-IN')}
              </div>
              <p className="text-sm text-muted-foreground">Average Invoice</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {Math.round(totalHours / invoices.length)}h
              </div>
              <p className="text-sm text-muted-foreground">Avg. Hours per Invoice</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Billing;