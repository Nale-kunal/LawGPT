import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

import { 
  Plus, 
  IndianRupee, 
  Clock, 
  FileText, 
  User, 
  CalendarDays,
  Download,
  Send,
  Filter,
  Search,
  Eye
} from 'lucide-react';
import { useLegalData, TimeEntry } from '@/contexts/LegalDataContext';

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
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [invoicePreviewOpen, setInvoicePreviewOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
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

  const handleSendInvoice = () => {
    if (!recipientEmail) {
      toast({
        title: "Error",
        description: "Please enter recipient email address",
        variant: "destructive",
      });
      return;
    }

    // Simulate sending email
    toast({
      title: "Invoice Sent",
      description: `Invoice has been sent to ${recipientEmail}`,
    });
    setEmailModalOpen(false);
    setRecipientEmail('');
  };

  const generateInvoiceHTML = () => {
    const totalAmount = timeEntries.reduce((sum, entry) => sum + (entry.duration / 60 * 2000), 0);
    
    return `
      <div style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6;">
        <div style="background: #1a365d; color: white; padding: 2rem; text-align: center;">
          <h1 style="margin: 0; font-size: 2rem;">LegalPro</h1>
          <p style="margin: 0.5rem 0 0 0;">Indian Law Management</p>
        </div>
        
        <div style="padding: 2rem;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 2rem;">
            <div>
              <h2>Invoice</h2>
              <p><strong>Invoice #:</strong> INV-${Date.now()}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            </div>
            <div style="text-align: right;">
              <h3>From:</h3>
              <p>Law Firm Name<br>
              Bar Council No: 12345<br>
              New Delhi, India</p>
            </div>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 2rem;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="border: 1px solid #ddd; padding: 12px; text-align: left;">Description</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: center;">Hours</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Rate</th>
                <th style="border: 1px solid #ddd; padding: 12px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${timeEntries.map(entry => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 12px;">${entry.description}</td>
                  <td style="border: 1px solid #ddd; padding: 12px; text-align: center;">${entry.duration / 60}</td>
                  <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹2,000</td>
                  <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${((entry.duration / 60) * 2000).toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="3" style="border: 1px solid #ddd; padding: 12px; text-align: right;">Total:</td>
                <td style="border: 1px solid #ddd; padding: 12px; text-align: right;">₹${totalAmount.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="text-align: center; color: #666; font-size: 0.9rem;">
            <p>Thank you for your business!</p>
          </div>
        </div>
      </div>
    `;
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
    <div className="space-y-4 md:space-y-6 p-4 md:p-0">
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground truncate">
            Billing & Time Tracking
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage invoices and track billable hours
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full lg:w-auto">
          <Dialog open={showTimeDialog} onOpenChange={setShowTimeDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={resetTimeForm} className="w-full sm:w-auto">
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

          <Button onClick={() => {
            // Create a mock invoice
            const newInvoice = {
              id: Date.now().toString(),
              clientName: clients[0]?.name || 'New Client',
              invoiceNumber: `INV-2024-${(Math.floor(Math.random() * 900) + 100).toString().padStart(3, '0')}`,
              amount: Math.floor(Math.random() * 100000) + 10000,
              status: 'draft' as const,
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              createdDate: new Date(),
              timeEntries: []
            };
            toast({
              title: "Invoice Created",
              description: `Invoice ${newInvoice.invoiceNumber} has been created for ₹${newInvoice.amount.toLocaleString('en-IN')}`,
            });
          }} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="shadow-card-custom">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Billed</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">₹{totalBilled.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">All time invoices</p>
          </CardContent>
        </Card>

        <Card className="shadow-card-custom">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
            <IndianRupee className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-success">₹{paidAmount.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">Received payments</p>
          </CardContent>
        </Card>

        <Card className="shadow-card-custom">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <IndianRupee className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-warning">₹{pendingAmount.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">Outstanding invoices</p>
          </CardContent>
        </Card>

        <Card className="shadow-card-custom">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{Math.round(totalHours / 60)}h</div>
            <p className="text-xs text-muted-foreground">{totalHours} minutes total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Invoices */}
        <Card className="lg:col-span-2 shadow-elevated">
          <CardHeader>
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Invoices
                </CardTitle>
                <CardDescription>Manage client invoices and payments</CardDescription>
              </div>
              <Button variant="outline" size="sm" className="w-full lg:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filter */}
            <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:gap-4 mb-4">
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
                <SelectTrigger className="w-full lg:w-40">
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
                <div key={invoice.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border rounded-lg space-y-4 lg:space-y-0 lg:gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                      <span className="font-medium truncate">{invoice.invoiceNumber}</span>
                      <Badge variant={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {invoice.clientName} • Due: {invoice.dueDate.toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4">
                    <div className="font-bold text-lg mb-2 lg:mb-0">₹{invoice.amount.toLocaleString('en-IN')}</div>
                    <div className="grid grid-cols-2 lg:flex gap-1">
                      <Button size="sm" variant="outline" onClick={() => setEmailModalOpen(true)}>
                        <Send className="mr-1 h-3 w-3" />
                        Send
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setInvoicePreviewOpen(true)}>
                        <Eye className="mr-1 h-3 w-3" />
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
                      <span className="font-medium">₹{((entry.duration / 60) * entry.hourlyRate).toLocaleString('en-IN')}</span>
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
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Send Invoice</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => setEmailModalOpen(true)}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invoice
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">View Invoice</CardTitle>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" onClick={() => setInvoicePreviewOpen(true)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Invoice
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Recipient Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="client@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSendInvoice} className="flex-1">
                <Send className="h-4 w-4 mr-2" />
                Send Invoice
              </Button>
              <Button variant="outline" onClick={() => setEmailModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Preview Modal */}
      <Dialog open={invoicePreviewOpen} onOpenChange={setInvoicePreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          <div dangerouslySetInnerHTML={{ __html: generateInvoiceHTML() }} />
          <div className="flex gap-2 mt-4">
            <Button onClick={() => window.print()}>
              Print Invoice
            </Button>
            <Button variant="outline" onClick={() => setInvoicePreviewOpen(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Overview */}
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