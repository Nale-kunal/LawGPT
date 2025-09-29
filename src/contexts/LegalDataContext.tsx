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

  // Initial loads
  React.useEffect(() => {
    // Load initial data from API
    Promise.all([
      fetch('/api/cases', { credentials: 'include' }).then(r => r.ok ? r.json() : Promise.resolve([])),
      fetch('/api/clients', { credentials: 'include' }).then(r => r.ok ? r.json() : Promise.resolve([])),
      fetch('/api/alerts', { credentials: 'include' }).then(r => r.ok ? r.json() : Promise.resolve([])),
      fetch('/api/time-entries', { credentials: 'include' }).then(r => r.ok ? r.json() : Promise.resolve([])),
    ]).then(([casesRes, clientsRes, alertsRes, timeEntriesRes]) => {
      setCases(casesRes.map(mapCaseFromApi));
      setClients(clientsRes.map(mapClientFromApi));
      setAlerts(alertsRes.map(mapAlertFromApi));
      setTimeEntries(timeEntriesRes.map(mapTimeEntryFromApi));
    }).catch(() => {
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
    addTimeEntry
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