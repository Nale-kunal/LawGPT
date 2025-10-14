import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  User, 
  Building, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { useLegalData, Case } from '@/contexts/LegalDataContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CaseConflictChecker } from '@/components/CaseConflictChecker';
import { CaseSummaryGenerator } from '@/components/CaseSummaryGenerator';
import { CaseDetailsPopup } from '@/components/CaseDetailsPopup';

const Cases = () => {
  const { cases, clients, addCase, updateCase, deleteCase, addClient } = useLegalData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [showCaseDetails, setShowCaseDetails] = useState(false);
  const [caseForDetails, setCaseForDetails] = useState<Case | null>(null);

  // Form state for adding/editing cases
  const [formData, setFormData] = useState({
    caseNumber: '',
    clientName: '',
    opposingParty: '',
    courtName: '',
    judgeName: '',
    hearingDate: '',
    hearingTime: '',
    status: 'active' as Case['status'],
    priority: 'medium' as Case['priority'],
    caseType: '',
    description: '',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      caseNumber: '',
      clientName: '',
      opposingParty: '',
      courtName: '',
      judgeName: '',
      hearingDate: '',
      hearingTime: '',
      status: 'active',
      priority: 'medium',
      caseType: '',
      description: '',
      notes: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCase) {
      // Update existing case
      updateCase(selectedCase.id, {
        ...formData,
        hearingDate: new Date(formData.hearingDate),
        documents: selectedCase.documents,
        alerts: selectedCase.alerts
      });
    } else {
      // Check if client exists, if not create a new client
      const existingClient = clients.find(client => 
        client.name.toLowerCase() === formData.clientName.toLowerCase()
      );
      
      if (!existingClient) {
        try {
          console.log('Creating new client:', formData.clientName);
          // Create new client with minimal information
          await addClient({
            name: formData.clientName,
            email: 'pending@example.com', // Temporary email, will be updated later
            phone: '0000000000', // Temporary phone, will be updated later
            address: '', // Will be filled later in client interface
            panNumber: '', // Will be filled later in client interface
            aadharNumber: '', // Will be filled later in client interface
            cases: [],
            documents: [],
            notes: `Auto-created when adding case: ${formData.caseNumber}. Please update email and phone details.`
          });
          console.log('Client created successfully');
        } catch (error) {
          console.error('Error creating client:', error);
        }
      } else {
        console.log('Client already exists:', formData.clientName);
      }
      
      // Add new case
      try {
        console.log('Creating new case:', formData.caseNumber);
        await addCase({
          ...formData,
          hearingDate: new Date(formData.hearingDate),
          documents: [],
          alerts: []
        });
        console.log('Case created successfully');
      } catch (error) {
        console.error('Error creating case:', error);
      }
    }
    
    setShowAddDialog(false);
    setSelectedCase(null);
    resetForm();
  };

  // Filter cases based on search and filters
  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.opposingParty.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || case_.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: Case['status']) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      case 'won': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      case 'lost': return <XCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Case['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'won': return 'outline';
      case 'closed': return 'outline';
      case 'lost': return 'destructive';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: Case['priority']) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Case Management</h1>
          <p className="text-muted-foreground">Manage all your legal cases efficiently</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => { setSelectedCase(null); resetForm(); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Case
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCase ? 'Edit Case' : 'Add New Case'}</DialogTitle>
              <DialogDescription>
                {selectedCase ? 'Update case information' : 'Enter the details for the new case'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="caseNumber">Case Number*</Label>
                  <Input
                    id="caseNumber"
                    value={formData.caseNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, caseNumber: e.target.value }))}
                    placeholder="e.g., CC/2024/001"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="clientName">Client Name*</Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                    placeholder="Client's full name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="opposingParty">Opposing Party</Label>
                  <Input
                    id="opposingParty"
                    value={formData.opposingParty}
                    onChange={(e) => setFormData(prev => ({ ...prev, opposingParty: e.target.value }))}
                    placeholder="Opposing party name"
                  />
                </div>
                <div>
                  <Label htmlFor="caseType">Case Type*</Label>
                  <Select value={formData.caseType} onValueChange={(value) => setFormData(prev => ({ ...prev, caseType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select case type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="criminal">Criminal</SelectItem>
                      <SelectItem value="civil">Civil</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="corporate">Corporate</SelectItem>
                      <SelectItem value="property">Property</SelectItem>
                      <SelectItem value="tax">Tax</SelectItem>
                      <SelectItem value="labor">Labor</SelectItem>
                      <SelectItem value="constitutional">Constitutional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="courtName">Court Name*</Label>
                  <Input
                    id="courtName"
                    value={formData.courtName}
                    onChange={(e) => setFormData(prev => ({ ...prev, courtName: e.target.value }))}
                    placeholder="e.g., Delhi High Court"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="judgeName">Judge Name</Label>
                  <Input
                    id="judgeName"
                    value={formData.judgeName}
                    onChange={(e) => setFormData(prev => ({ ...prev, judgeName: e.target.value }))}
                    placeholder="Hon'ble Justice Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hearingDate">Next Hearing Date</Label>
                  <Input
                    id="hearingDate"
                    type="date"
                    value={formData.hearingDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hearingDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="hearingTime">Hearing Time</Label>
                  <Input
                    id="hearingTime"
                    type="time"
                    value={formData.hearingTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, hearingTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as Case['status'] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="won">Won</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Case['priority'] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Case Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the case..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or observations..."
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setShowAddDialog(false); setSelectedCase(null); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {selectedCase ? 'Update Case' : 'Add Case'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by case number, client name, or opposing party..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCases.map((case_) => (
          <Card 
            key={case_.id} 
            className="shadow-card-custom hover:shadow-elevated transition-shadow cursor-pointer"
            onClick={() => {
              setCaseForDetails(case_);
              setShowCaseDetails(true);
            }}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(case_.status)}
                    {case_.caseNumber}
                  </CardTitle>
                  <CardDescription>{case_.caseType}</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Badge variant={getStatusColor(case_.status)}>
                    {case_.status}
                  </Badge>
                  <Badge variant={getPriorityColor(case_.priority)}>
                    {case_.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{case_.clientName}</span>
                </div>
                {case_.opposingParty && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>vs</span>
                    <span>{case_.opposingParty}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{case_.courtName}</span>
                </div>
                {case_.hearingDate && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {new Date(case_.hearingDate).toLocaleDateString('en-IN')} 
                      {case_.hearingTime && ` at ${case_.hearingTime}`}
                    </span>
                  </div>
                )}
                {case_.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {case_.description}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCase(case_);
                    setFormData({
                      caseNumber: case_.caseNumber,
                      clientName: case_.clientName,
                      opposingParty: case_.opposingParty,
                      courtName: case_.courtName,
                      judgeName: case_.judgeName,
                      hearingDate: case_.hearingDate.toISOString().split('T')[0],
                      hearingTime: case_.hearingTime,
                      status: case_.status,
                      priority: case_.priority,
                      caseType: case_.caseType,
                      description: case_.description,
                      notes: case_.notes
                    });
                    setShowAddDialog(true);
                  }}
                >
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Are you sure you want to delete this case?')) {
                      deleteCase(case_.id);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCases.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No cases found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                ? 'No cases match your search criteria.' 
                : 'Start by adding your first case.'
              }
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Case
            </Button>
          </CardContent>
        </Card>
      )}

      {/* AI Conflict Checker */}
      <CaseConflictChecker 
        currentCase={selectedCase || (showAddDialog ? {
          id: 'temp',
          caseNumber: formData.caseNumber,
          clientName: formData.clientName,
          opposingParty: formData.opposingParty,
          courtName: formData.courtName,
          judgeName: formData.judgeName,
          hearingDate: formData.hearingDate ? new Date(formData.hearingDate) : new Date(),
          hearingTime: formData.hearingTime,
          status: formData.status,
          priority: formData.priority,
          caseType: formData.caseType,
          description: formData.description,
          nextHearing: undefined,
          documents: [],
          notes: formData.notes,
          alerts: [],
          createdAt: new Date(),
          updatedAt: new Date()
        } as Case : undefined)}
      />

      {/* AI Case Summary Generator */}
      {selectedCase && (
        <CaseSummaryGenerator caseId={selectedCase.id} />
      )}

      {/* Case Details Popup */}
      <CaseDetailsPopup
        case_={caseForDetails}
        isOpen={showCaseDetails}
        onClose={() => {
          setShowCaseDetails(false);
          setCaseForDetails(null);
        }}
      />
    </div>
  );
};

export default Cases;