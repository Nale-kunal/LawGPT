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

  // Case management functions
  const addCase = (caseData: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCase: Case = {
      ...caseData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCases(prev => [...prev, newCase]);
  };

  const updateCase = (caseId: string, updates: Partial<Case>) => {
    setCases(prev => prev.map(c => 
      c.id === caseId 
        ? { ...c, ...updates, updatedAt: new Date() }
        : c
    ));
  };

  const deleteCase = (caseId: string) => {
    setCases(prev => prev.filter(c => c.id !== caseId));
  };

  const getCaseById = (caseId: string) => {
    return cases.find(c => c.id === caseId);
  };

  // Client management functions
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (clientId: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => 
      c.id === clientId 
        ? { ...c, ...updates, updatedAt: new Date() }
        : c
    ));
  };

  const deleteClient = (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
  };

  // Alert management
  const addAlert = (alertData: Omit<Alert, 'id' | 'createdAt'>) => {
    const newAlert: Alert = {
      ...alertData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setAlerts(prev => [...prev, newAlert]);
  };

  const markAlertAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, isRead: true } : a
    ));
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
  const addTimeEntry = (entry: Omit<TimeEntry, 'id'>) => {
    const newEntry: TimeEntry = {
      ...entry,
      id: Date.now().toString()
    };
    setTimeEntries(prev => [...prev, newEntry]);
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