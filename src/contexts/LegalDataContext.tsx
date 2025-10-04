import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Case {
  id: string;
  caseNumber: string;
  clientName: string;
  opposingParty: string;
  courtName: string;
  judgeName: string;
  hearingDate: Date;
  hearingTime: string;
  status: 'active' | 'pending' | 'closed' | 'won' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  caseType: string;
  description: string;
  nextHearing?: Date;
  documents: string[];
  notes: string;
  alerts: Alert[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  panNumber?: string;
  aadharNumber?: string;
  cases: string[]; // Case IDs
  documents: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Alert {
  id: string;
  caseId: string;
  type: 'hearing' | 'deadline' | 'payment' | 'document';
  message: string;
  alertTime: Date;
  isRead: boolean;
  createdAt: Date;
}

export interface LegalSection {
  id: string;
  actName: string;
  sectionNumber: string;
  title: string;
  description: string;
  punishment?: string;
  keywords: string[];
}

export interface TimeEntry {
  id: string;
  caseId: string;
  description: string;
  duration: number; // in minutes
  hourlyRate: number;
  date: Date;
  billable: boolean;
}

export interface Hearing {
  id: string;
  caseId: string;
  hearingDate: Date;
  hearingTime?: string;
  courtName: string;
  judgeName?: string;
  hearingType: 'first_hearing' | 'interim_hearing' | 'final_hearing' | 'evidence_hearing' | 'argument_hearing' | 'judgment_hearing' | 'other';
  status: 'scheduled' | 'completed' | 'adjourned' | 'cancelled';
  purpose?: string;
  courtInstructions?: string;
  documentsToBring: string[];
  proceedings?: string;
  nextHearingDate?: Date;
  nextHearingTime?: string;
  adjournmentReason?: string;
  attendance: {
    clientPresent: boolean;
    opposingPartyPresent: boolean;
    witnessesPresent: string[];
  };
  orders: Array<{
    orderType: string;
    orderDetails: string;
    orderDate: Date;
  }>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  caseId?: string;
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  currency: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  notes?: string;
  terms?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface LegalDataContextType {
  // Cases
  cases: Case[];
  addCase: (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCase: (caseId: string, updates: Partial<Case>) => void;
  deleteCase: (caseId: string) => void;
  getCaseById: (caseId: string) => Case | undefined;
  
  // Clients
  clients: Client[];
  addClient: (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateClient: (clientId: string, updates: Partial<Client>) => void;
  deleteClient: (clientId: string) => void;
  
  // Alerts
  alerts: Alert[];
  addAlert: (alertData: Omit<Alert, 'id' | 'createdAt'>) => void;
  markAlertAsRead: (alertId: string) => void;
  deleteAlert: (alertId: string) => void;
  
  // Legal Sections
  legalSections: LegalSection[];
  searchLegalSections: (query: string) => LegalSection[];
  
  // Time Entries
  timeEntries: TimeEntry[];
  addTimeEntry: (entry: Omit<TimeEntry, 'id'>) => void;

  // Hearings
  hearings: Hearing[];
  addHearing: (hearing: Omit<Hearing, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateHearing: (hearingId: string, updates: Partial<Hearing>) => void;
  deleteHearing: (hearingId: string) => void;
  getHearingsByCaseId: (caseId: string) => Hearing[];

  // Invoices
  invoices: Invoice[];
  createInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (invoiceId: string) => Promise<void>;
  sendInvoice: (invoiceId: string, payload: { to?: string; subject?: string; message?: string }) => Promise<{ previewUrl?: string }>;
}

const LegalDataContext = createContext<LegalDataContextType | undefined>(undefined);

export const useLegalData = () => {
  const context = useContext(LegalDataContext);
  if (context === undefined) {
    throw new Error('useLegalData must be used within a LegalDataProvider');
  }
  return context;
};

interface LegalDataProviderProps {
  children: ReactNode;
}

// Mock Indian Legal Sections Data
const mockLegalSections: LegalSection[] = [
  {
    id: '1',
    actName: 'Indian Penal Code, 1860',
    sectionNumber: '302',
    title: 'Punishment for murder',
    description: 'Whoever commits murder shall be punished with death, or imprisonment for life, and shall also be liable to fine.',
    punishment: 'Death or life imprisonment and fine',
    keywords: ['murder', 'death', 'life imprisonment', 'killing']
  },
  {
    id: '2',
    actName: 'Indian Penal Code, 1860',
    sectionNumber: '420',
    title: 'Cheating and dishonestly inducing delivery of property',
    description: 'Whoever cheats and thereby dishonestly induces the person deceived to deliver any property to any person...',
    punishment: 'Imprisonment up to 7 years and fine',
    keywords: ['cheating', 'fraud', 'property', 'dishonestly']
  },
  {
    id: '3',
    actName: 'Code of Criminal Procedure, 1973',
    sectionNumber: '154',
    title: 'Information in cognizable cases',
    description: 'Every information relating to the commission of a cognizable offence...',
    punishment: 'N/A - Procedural',
    keywords: ['FIR', 'cognizable', 'information', 'police']
  },
  {
    id: '4',
    actName: 'Indian Contract Act, 1872',
    sectionNumber: '10',
    title: 'What agreements are contracts',
    description: 'All agreements are contracts if they are made by the free consent of parties competent to contract...',
    punishment: 'N/A - Civil Law',
    keywords: ['contract', 'agreement', 'consent', 'competent']
  }
];

export const LegalDataProvider: React.FC<LegalDataProviderProps> = ({ children }) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [legalSections] = useState<LegalSection[]>(mockLegalSections);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [hearings, setHearings] = useState<Hearing[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Initial loads
  React.useEffect(() => {
    // Load initial data from API
    Promise.all([
      fetch('/api/cases', { credentials: 'include' }).then(r => r.ok ? r.json() : Promise.resolve([])),
      fetch('/api/clients', { credentials: 'include' }).then(r => r.ok ? r.json() : Promise.resolve([])),
      fetch('/api/alerts', { credentials: 'include' }).then(r => r.ok ? r.json() : Promise.resolve([])),
      fetch('/api/time-entries', { credentials: 'include' }).then(r => r.ok ? r.json() : Promise.resolve([])),
      fetch('/api/hearings', { credentials: 'include' }).then(r => r.ok ? r.json() : Promise.resolve([])),
      fetch('/api/invoices', { credentials: 'include' }).then(r => r.ok ? r.json() : Promise.resolve([])),
    ]).then(([casesRes, clientsRes, alertsRes, timeEntriesRes, hearingsRes, invoicesRes]) => {
      console.log('LegalDataContext: Initial data loaded');
      console.log('LegalDataContext: Cases:', casesRes.length);
      console.log('LegalDataContext: Clients:', clientsRes.length);
      console.log('LegalDataContext: Hearings:', hearingsRes.length, hearingsRes);
      setCases(casesRes.map(mapCaseFromApi));
      setClients(clientsRes.map(mapClientFromApi));
      setAlerts(alertsRes.map(mapAlertFromApi));
      setTimeEntries(timeEntriesRes.map(mapTimeEntryFromApi));
      const mappedHearings = hearingsRes.map(mapHearingFromApi);
      console.log('LegalDataContext: Mapped hearings:', mappedHearings.length, mappedHearings);
      setHearings(mappedHearings);
      setInvoices(invoicesRes.map(mapInvoiceFromApi));
    }).catch((error) => {
      console.error('LegalDataContext: Error loading initial data:', error);
      // Silently ignore for now; UI can still function
    });
  }, []);

  // Case management functions
  const addCase = async (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await fetch('/api/cases', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(caseData) });
    if (res.ok) {
      const saved = await res.json();
      setCases(prev => [...prev, mapCaseFromApi(saved)]);
    }
  };

  const updateCase = async (caseId: string, updates: Partial<Case>) => {
    const res = await fetch(`/api/cases/${caseId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(updates) });
    if (res.ok) {
      const saved = await res.json();
      setCases(prev => prev.map(c => c.id === caseId ? mapCaseFromApi(saved) : c));
    }
  };

  const deleteCase = async (caseId: string) => {
    const res = await fetch(`/api/cases/${caseId}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) setCases(prev => prev.filter(c => c.id !== caseId));
  };

  const getCaseById = (caseId: string) => {
    return cases.find(c => c.id === caseId);
  };

  // Client management functions
  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const res = await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(clientData) });
    if (res.ok) {
      const saved = await res.json();
      setClients(prev => [...prev, mapClientFromApi(saved)]);
    }
  };

  const updateClient = async (clientId: string, updates: Partial<Client>) => {
    const res = await fetch(`/api/clients/${clientId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(updates) });
    if (res.ok) {
      const saved = await res.json();
      setClients(prev => prev.map(c => c.id === clientId ? mapClientFromApi(saved) : c));
    }
  };

  const deleteClient = async (clientId: string) => {
    const res = await fetch(`/api/clients/${clientId}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) setClients(prev => prev.filter(c => c.id !== clientId));
  };

  // Alert management
  const addAlert = async (alertData: Omit<Alert, 'id' | 'createdAt'>) => {
    const res = await fetch('/api/alerts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(alertData) });
    if (res.ok) {
      const saved = await res.json();
      setAlerts(prev => [...prev, mapAlertFromApi(saved)]);
    }
  };

  const markAlertAsRead = async (alertId: string) => {
    const res = await fetch(`/api/alerts/${alertId}/read`, { method: 'PATCH', credentials: 'include' });
    if (res.ok) {
      const saved = await res.json();
      setAlerts(prev => prev.map(a => a.id === alertId ? mapAlertFromApi(saved) : a));
    }
  };

  const deleteAlert = async (alertId: string) => {
    const res = await fetch(`/api/alerts/${alertId}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) setAlerts(prev => prev.filter(a => a.id !== alertId));
  };


  // Legal research
  const searchLegalSections = (query: string): LegalSection[] => {
    if (!query) return legalSections;
    
    const lowerQuery = query.toLowerCase();
    return legalSections.filter(section =>
      section.sectionNumber.toLowerCase().includes(lowerQuery) ||
      section.title.toLowerCase().includes(lowerQuery) ||
      section.description.toLowerCase().includes(lowerQuery) ||
      section.actName.toLowerCase().includes(lowerQuery) ||
      section.keywords.some(keyword => keyword.toLowerCase().includes(lowerQuery))
    );
  };

  // Time tracking
  const addTimeEntry = async (entry: Omit<TimeEntry, 'id'>) => {
    const res = await fetch('/api/time-entries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(entry) });
    if (res.ok) {
      const saved = await res.json();
      setTimeEntries(prev => [...prev, mapTimeEntryFromApi(saved)]);
    }
  };

  // Hearing management functions
  const addHearing = async (hearing: Omit<Hearing, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('LegalDataContext: Adding hearing:', hearing);
    const res = await fetch('/api/hearings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(hearing) });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Failed to create hearing' }));
      throw new Error(errorData.error || 'Failed to create hearing');
    }
    const saved = await res.json();
    console.log('LegalDataContext: Hearing saved from API:', saved);
    const mappedHearing = mapHearingFromApi(saved);
    console.log('LegalDataContext: Mapped hearing:', mappedHearing);
    setHearings(prev => {
      const newHearings = [...prev, mappedHearing];
      console.log('LegalDataContext: Updated hearings state:', newHearings.length, 'hearings');
      return newHearings;
    });
    return saved;
  };

  const updateHearing = async (hearingId: string, updates: Partial<Hearing>) => {
    console.log('LegalDataContext: Updating hearing:', hearingId, 'with updates:', updates);
    
    try {
      const res = await fetch(`/api/hearings/${hearingId}`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json' }, 
        credentials: 'include', 
        body: JSON.stringify(updates) 
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Failed to update hearing' }));
        throw new Error(errorData.error || 'Failed to update hearing');
      }
      
      const saved = await res.json();
      console.log('LegalDataContext: Hearing updated from API:', saved);
      const mappedHearing = mapHearingFromApi(saved);
      console.log('LegalDataContext: Mapped updated hearing:', mappedHearing);
      
      // BULLETPROOF UPDATE: Always ensure the hearing exists in state
      setHearings(prev => {
        console.log('LegalDataContext: Current hearings before update:', prev.length, prev.map(h => ({ id: h.id, caseId: h.caseId })));
        
        // Find the hearing to update by multiple criteria
        const hearingIndex = prev.findIndex(h => {
          const idMatch = h.id === hearingId || 
                         h.id === hearingId.toString() || 
                         h.id === saved._id || 
                         h.id === saved.id;
          const caseIdMatch = h.caseId === saved.caseId || h.caseId === saved.caseId?.toString();
          console.log('LegalDataContext: Checking hearing:', h.id, 'against', hearingId, 'idMatch:', idMatch, 'caseIdMatch:', caseIdMatch);
          return idMatch || (caseIdMatch && h.hearingDate === saved.hearingDate);
        });
        
        console.log('LegalDataContext: Found hearing at index:', hearingIndex);
        
        if (hearingIndex !== -1) {
          // Update existing hearing
          const updatedHearings = [...prev];
          updatedHearings[hearingIndex] = mappedHearing;
          console.log('LegalDataContext: Updated hearing at index:', hearingIndex, 'new hearing:', mappedHearing);
          return updatedHearings;
        } else {
          // Hearing not found, add it to the list
          console.log('LegalDataContext: Hearing not found, adding new hearing');
          const newHearings = [...prev, mappedHearing];
          console.log('LegalDataContext: Added hearing to list, total hearings:', newHearings.length);
          return newHearings;
        }
      });
      
      return saved;
    } catch (error) {
      console.error('LegalDataContext: Update hearing error:', error);
      throw error;
    }
  };

  const deleteHearing = async (hearingId: string) => {
    const res = await fetch(`/api/hearings/${hearingId}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ error: 'Failed to delete hearing' }));
      throw new Error(errorData.error || 'Failed to delete hearing');
    }
    setHearings(prev => prev.filter(h => h.id !== hearingId));
  };

  const getHearingsByCaseId = (caseId: string) => {
    console.log('LegalDataContext: Getting hearings for case:', caseId);
    console.log('LegalDataContext: All hearings:', hearings.length, hearings);
    const caseHearings = hearings.filter(h => {
      const match = h.caseId === caseId || h.caseId === caseId.toString();
      console.log('LegalDataContext: Comparing hearing caseId:', h.caseId, 'with:', caseId, 'match:', match);
      return match;
    });
    console.log('LegalDataContext: Filtered hearings for case:', caseHearings.length, caseHearings);
    return caseHearings;
  };

  // Invoices
  const createInvoice = async (invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const payload = mapInvoiceToApi(invoice);
    const res = await fetch('/api/invoices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
    if (res.ok) {
      const saved = await res.json();
      setInvoices(prev => [mapInvoiceFromApi(saved), ...prev]);
    }
  };

  const updateInvoice = async (invoiceId: string, updates: Partial<Invoice>) => {
    const res = await fetch(`/api/invoices/${invoiceId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(mapInvoicePartialToApi(updates)) });
    if (res.ok) {
      const saved = await res.json();
      setInvoices(prev => prev.map(i => i.id === invoiceId ? mapInvoiceFromApi(saved) : i));
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    const res = await fetch(`/api/invoices/${invoiceId}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) setInvoices(prev => prev.filter(i => i.id !== invoiceId));
  };

  const sendInvoice = async (invoiceId: string, payload: { to?: string; subject?: string; message?: string }) => {
    const res = await fetch(`/api/invoices/${invoiceId}/send`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
    if (!res.ok) throw new Error('Failed to send invoice');
    const body = await res.json();
    return { previewUrl: body.previewUrl } as { previewUrl?: string };
  };

  const value = {
    cases,
    addCase,
    updateCase,
    deleteCase,
    getCaseById,
    clients,
    addClient,
    updateClient,
    deleteClient,
    alerts,
    addAlert,
    markAlertAsRead,
    deleteAlert,
    legalSections,
    searchLegalSections,
    timeEntries,
    addTimeEntry,
    hearings,
    addHearing,
    updateHearing,
    deleteHearing,
    getHearingsByCaseId,
    invoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    sendInvoice,
  };

  return (
    <LegalDataContext.Provider value={value}>
      {children}
    </LegalDataContext.Provider>
  );
};

// Mappers
function mapCaseFromApi(raw: any): Case {
  return {
    id: raw._id || raw.id,
    caseNumber: raw.caseNumber,
    clientName: raw.clientName,
    opposingParty: raw.opposingParty,
    courtName: raw.courtName,
    judgeName: raw.judgeName,
    hearingDate: raw.hearingDate ? new Date(raw.hearingDate) : undefined as any,
    hearingTime: raw.hearingTime,
    status: raw.status,
    priority: raw.priority,
    caseType: raw.caseType,
    description: raw.description,
    nextHearing: raw.nextHearing ? new Date(raw.nextHearing) : undefined as any,
    documents: raw.documents || [],
    notes: raw.notes || '',
    alerts: [],
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
  } as Case;
}

function mapClientFromApi(raw: any): Client {
  return {
    id: raw._id || raw.id,
    name: raw.name,
    email: raw.email,
    phone: raw.phone,
    address: raw.address || '',
    panNumber: raw.panNumber,
    aadharNumber: raw.aadharNumber,
    cases: raw.cases || [],
    documents: raw.documents || [],
    notes: raw.notes || '',
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
  } as Client;
}

function mapAlertFromApi(raw: any): Alert {
  return {
    id: raw._id || raw.id,
    caseId: raw.caseId,
    type: raw.type,
    message: raw.message,
    alertTime: raw.alertTime ? new Date(raw.alertTime) : new Date(),
    isRead: !!raw.isRead,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
  } as Alert;
}

function mapTimeEntryFromApi(raw: any): TimeEntry {
  return {
    id: raw._id || raw.id,
    caseId: raw.caseId,
    description: raw.description,
    duration: raw.duration,
    hourlyRate: raw.hourlyRate,
    date: raw.date ? new Date(raw.date) : new Date(),
    billable: !!raw.billable,
  } as TimeEntry;
}

function mapHearingFromApi(raw: any): Hearing {
  return {
    id: raw._id || raw.id,
    caseId: raw.caseId,
    hearingDate: raw.hearingDate ? new Date(raw.hearingDate) : new Date(),
    hearingTime: raw.hearingTime,
    courtName: raw.courtName,
    judgeName: raw.judgeName,
    hearingType: raw.hearingType,
    status: raw.status,
    purpose: raw.purpose,
    courtInstructions: raw.courtInstructions,
    documentsToBring: raw.documentsToBring || [],
    proceedings: raw.proceedings,
    nextHearingDate: raw.nextHearingDate ? new Date(raw.nextHearingDate) : undefined,
    nextHearingTime: raw.nextHearingTime,
    adjournmentReason: raw.adjournmentReason,
    attendance: {
      clientPresent: !!raw.attendance?.clientPresent,
      opposingPartyPresent: !!raw.attendance?.opposingPartyPresent,
      witnessesPresent: raw.attendance?.witnessesPresent || [],
    },
    orders: (raw.orders || []).map((order: any) => ({
      orderType: order.orderType,
      orderDetails: order.orderDetails,
      orderDate: order.orderDate ? new Date(order.orderDate) : new Date(),
    })),
    notes: raw.notes,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
  } as Hearing;
}

function mapInvoiceFromApi(raw: any): Invoice {
  return {
    id: raw._id || raw.id,
    clientId: raw.clientId,
    caseId: raw.caseId,
    invoiceNumber: raw.invoiceNumber,
    issueDate: raw.issueDate ? new Date(raw.issueDate) : new Date(),
    dueDate: raw.dueDate ? new Date(raw.dueDate) : new Date(),
    status: raw.status,
    currency: raw.currency || 'INR',
    items: (raw.items || []).map((i: any) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, amount: i.amount })),
    subtotal: raw.subtotal || 0,
    taxRate: raw.taxRate || 0,
    taxAmount: raw.taxAmount || 0,
    discountAmount: raw.discountAmount || 0,
    total: raw.total || 0,
    notes: raw.notes,
    terms: raw.terms,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date(),
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : new Date(),
  } as Invoice;
}

function mapInvoiceToApi(inv: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) {
  return {
    clientId: inv.clientId,
    caseId: inv.caseId,
    invoiceNumber: inv.invoiceNumber,
    issueDate: inv.issueDate,
    dueDate: inv.dueDate,
    status: inv.status,
    currency: inv.currency,
    items: inv.items,
    subtotal: inv.subtotal,
    taxRate: inv.taxRate,
    taxAmount: inv.taxAmount,
    discountAmount: inv.discountAmount,
    total: inv.total,
    notes: inv.notes,
    terms: inv.terms,
  };
}

function mapInvoicePartialToApi(updates: Partial<Invoice>) {
  const u: any = { ...updates };
  if ('id' in u) delete u.id;
  if (u.issueDate instanceof Date) u.issueDate = u.issueDate.toISOString();
  if (u.dueDate instanceof Date) u.dueDate = u.dueDate.toISOString();
  return u;
}