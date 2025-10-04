import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  Building, 
  User, 
  FileText, 
  CheckCircle, 
  AlertTriangle,
  Plus,
  Edit,
  Trash2,
  Gavel,
  Users,
  FileCheck,
  ArrowRight,
  MapPin,
  Eye
} from 'lucide-react';
import { Case, Hearing } from '@/contexts/LegalDataContext';
import { useLegalData } from '@/contexts/LegalDataContext';
import { HearingRecordPopup } from './HearingRecordPopup';
import { HearingViewPopup } from './HearingViewPopup';

interface CaseDetailsPopupProps {
  case_: Case | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CaseDetailsPopup: React.FC<CaseDetailsPopupProps> = ({ case_, isOpen, onClose }) => {
  const { getHearingsByCaseId, hearings: allHearings } = useLegalData();
  const [showHearingRecord, setShowHearingRecord] = useState(false);
  const [showHearingView, setShowHearingView] = useState(false);
  const [selectedHearing, setSelectedHearing] = useState<Hearing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [localHearings, setLocalHearings] = useState<Hearing[]>([]);

  // Get hearings from both global state and local state for maximum reliability
  const globalHearings = case_ ? getHearingsByCaseId(case_.id) : [];
  const hearings = localHearings.length > 0 ? localHearings : globalHearings;

  // Function to immediately remove a hearing from local state
  const removeHearingFromLocalState = (hearingId: string) => {
    console.log('CaseDetailsPopup: Removing hearing from local state:', hearingId);
    setLocalHearings(prev => {
      const filtered = prev.filter(h => h.id !== hearingId);
      console.log('CaseDetailsPopup: Local hearings after removal:', filtered.length);
      return filtered;
    });
    setRefreshCounter(prev => prev + 1);
  };

  // Force reload hearings from API if needed
  const reloadHearings = async () => {
    if (!case_) return;
    
    try {
      console.log('CaseDetailsPopup: Reloading hearings from API for case:', case_.id);
      const response = await fetch(`/api/hearings/case/${case_.id}`, { 
        credentials: 'include' 
      });
      
      if (response.ok) {
        const apiHearings = await response.json();
        console.log('CaseDetailsPopup: Reloaded hearings from API:', apiHearings.length, apiHearings);
        
        // Update local state with fresh data from API
        const mappedHearings = apiHearings.map((h: any) => ({
          id: h._id,
          caseId: h.caseId,
          hearingDate: h.hearingDate,
          hearingTime: h.hearingTime,
          courtName: h.courtName,
          judgeName: h.judgeName,
          hearingType: h.hearingType,
          status: h.status,
          purpose: h.purpose,
          courtInstructions: h.courtInstructions,
          documentsToBring: h.documentsToBring || [],
          proceedings: h.proceedings,
          nextHearingDate: h.nextHearingDate,
          nextHearingTime: h.nextHearingTime,
          adjournmentReason: h.adjournmentReason,
          attendance: h.attendance || {
            clientPresent: false,
            opposingPartyPresent: false,
            witnessesPresent: []
          },
          orders: h.orders || [],
          notes: h.notes,
          createdAt: h.createdAt,
          updatedAt: h.updatedAt
        }));
        
        setLocalHearings(mappedHearings);
        setRefreshCounter(prev => prev + 1);
        console.log('CaseDetailsPopup: Updated local hearings:', mappedHearings.length, 'hearings');
        
        // Force a small delay to ensure state updates are processed
        setTimeout(() => {
          console.log('CaseDetailsPopup: Final hearing count after reload:', mappedHearings.length);
        }, 100);
      }
    } catch (error) {
      console.error('CaseDetailsPopup: Error reloading hearings:', error);
    }
  };

  // Safety check: ensure hearings are always available
  useEffect(() => {
    if (case_ && hearings.length === 0 && !isLoading) {
      console.log('CaseDetailsPopup: No hearings found for case:', case_.id, 'this might be normal for new cases');
    }
  }, [case_, hearings.length, isLoading]);

  useEffect(() => {
    if (case_ && isOpen) {
      setIsLoading(true);
      // Load hearings when popup opens
      reloadHearings();
      // Small delay to show loading state
      setTimeout(() => {
        setIsLoading(false);
      }, 100);
    }
  }, [case_, isOpen]);

  // Refresh hearings when global hearings state changes
  useEffect(() => {
    if (case_) {
      console.log('CaseDetailsPopup: Global hearings changed, current hearings for case:', hearings.length);
      setRefreshCounter(prev => prev + 1); // Force re-render
    }
  }, [allHearings, case_, hearings.length]);

  // Reset local hearings when popup closes
  useEffect(() => {
    if (!isOpen) {
      setLocalHearings([]);
      setRefreshCounter(0);
    }
  }, [isOpen]);

  if (!case_) return null;

  const getStatusIcon = (status: Case['status']) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      case 'won': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      case 'lost': return <AlertTriangle className="h-4 w-4" />;
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

  const getHearingStatusColor = (status: Hearing['status']) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'completed': return 'outline';
      case 'adjourned': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const getHearingTypeLabel = (type: Hearing['hearingType']) => {
    switch (type) {
      case 'first_hearing': return 'First Hearing';
      case 'interim_hearing': return 'Interim Hearing';
      case 'final_hearing': return 'Final Hearing';
      case 'evidence_hearing': return 'Evidence Hearing';
      case 'argument_hearing': return 'Argument Hearing';
      case 'judgment_hearing': return 'Judgment Hearing';
      case 'other': return 'Other';
      default: return type;
    }
  };

  // Sort hearings by date (most recent first)
  const sortedHearings = [...hearings].sort((a, b) => 
    new Date(b.hearingDate).getTime() - new Date(a.hearingDate).getTime()
  );

  // Get next hearing
  const nextHearing = sortedHearings.find(h => h.status === 'scheduled' && new Date(h.hearingDate) >= new Date());

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-3 text-2xl">
              {getStatusIcon(case_.status)}
              {case_.caseNumber}
              <div className="flex gap-2">
                <Badge variant={getStatusColor(case_.status)}>
                  {case_.status}
                </Badge>
                <Badge variant={getPriorityColor(case_.priority)}>
                  {case_.priority}
                </Badge>
              </div>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="h-[calc(90vh-120px)]">
            <div className="p-6 space-y-6">
              {/* Case Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Case Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Client:</span>
                        <span>{case_.clientName}</span>
                      </div>
                      {case_.opposingParty && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">vs:</span>
                          <span>{case_.opposingParty}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Court:</span>
                        <span>{case_.courtName}</span>
                      </div>
                      {case_.judgeName && (
                        <div className="flex items-center gap-2 text-sm">
                          <Gavel className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Judge:</span>
                          <span>{case_.judgeName}</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Type:</span>
                        <span className="capitalize">{case_.caseType}</span>
                      </div>
                      {case_.hearingDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Next Hearing:</span>
                          <span>
                            {new Date(case_.hearingDate).toLocaleDateString('en-IN')}
                            {case_.hearingTime && ` at ${case_.hearingTime}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {case_.description && (
                    <div>
                      <span className="font-medium text-sm">Description:</span>
                      <p className="text-sm text-muted-foreground mt-1">{case_.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Amazon-style Pipeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Case Progress Pipeline
                  </CardTitle>
                  <CardDescription>
                    Track your case through different stages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    {/* Pipeline Steps */}
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Case Filed */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-xs text-center">Case Filed</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      
                      {/* First Hearing */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          sortedHearings.some(h => h.hearingType === 'first_hearing') 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }`}>
                          {sortedHearings.some(h => h.hearingType === 'first_hearing') ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <span className="text-xs text-center">First Hearing</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      
                      {/* Evidence */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          sortedHearings.some(h => h.hearingType === 'evidence_hearing') 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }`}>
                          {sortedHearings.some(h => h.hearingType === 'evidence_hearing') ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <span className="text-xs text-center">Evidence</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      
                      {/* Arguments */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          sortedHearings.some(h => h.hearingType === 'argument_hearing') 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }`}>
                          {sortedHearings.some(h => h.hearingType === 'argument_hearing') ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <span className="text-xs text-center">Arguments</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      
                      {/* Judgment */}
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          sortedHearings.some(h => h.hearingType === 'judgment_hearing') 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }`}>
                          {sortedHearings.some(h => h.hearingType === 'judgment_hearing') ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : (
                            <Clock className="h-4 w-4 text-gray-600" />
                          )}
                        </div>
                        <span className="text-xs text-center">Judgment</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Hearing Details */}
              {nextHearing && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Next Hearing Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-sm">Date & Time:</span>
                        <p className="text-sm text-muted-foreground">
                          {new Date(nextHearing.hearingDate).toLocaleDateString('en-IN')}
                          {nextHearing.hearingTime && ` at ${nextHearing.hearingTime}`}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-sm">Type:</span>
                        <p className="text-sm text-muted-foreground">
                          {getHearingTypeLabel(nextHearing.hearingType)}
                        </p>
                      </div>
                    </div>
                    {nextHearing.purpose && (
                      <div>
                        <span className="font-medium text-sm">Purpose:</span>
                        <p className="text-sm text-muted-foreground">{nextHearing.purpose}</p>
                      </div>
                    )}
                    {nextHearing.courtInstructions && (
                      <div>
                        <span className="font-medium text-sm">Court Instructions:</span>
                        <p className="text-sm text-muted-foreground">{nextHearing.courtInstructions}</p>
                      </div>
                    )}
                    {nextHearing.documentsToBring.length > 0 && (
                      <div>
                        <span className="font-medium text-sm">Documents to Bring:</span>
                        <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                          {nextHearing.documentsToBring.map((doc, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <FileCheck className="h-3 w-3" />
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Hearing History */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Hearing History ({hearings.length})
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={reloadHearings}
                      >
                        Reload
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          setSelectedHearing(null);
                          setShowHearingRecord(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Record Hearing
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p>Loading hearings...</p>
                    </div>
                  ) : sortedHearings.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No hearings recorded yet</p>
                      <p className="text-sm">Click "Record Hearing" to add the first hearing</p>
                    </div>
                  ) : (
                    <div className="space-y-4" key={`hearings-${refreshCounter}`}>
                      {sortedHearings.map((hearing) => (
                        <div key={`${hearing.id}-${refreshCounter}`} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {new Date(hearing.hearingDate).toLocaleDateString('en-IN')}
                                </span>
                                {hearing.hearingTime && (
                                  <>
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">
                                      {hearing.hearingTime}
                                    </span>
                                  </>
                                )}
                              </div>
                              <Badge variant={getHearingStatusColor(hearing.status)}>
                                {hearing.status}
                              </Badge>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  console.log('CaseDetailsPopup: View button clicked for hearing:', hearing.id, hearing);
                                  setSelectedHearing(hearing);
                                  setShowHearingView(true);
                                  console.log('CaseDetailsPopup: Set selectedHearing and showHearingView to true');
                                }}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  console.log('CaseDetailsPopup: Edit button clicked for hearing:', hearing.id, hearing);
                                  setSelectedHearing(hearing);
                                  setShowHearingRecord(true);
                                  console.log('CaseDetailsPopup: Set selectedHearing and showHearingRecord to true');
                                }}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Type:</span>
                              <span className="ml-2">{getHearingTypeLabel(hearing.hearingType)}</span>
                            </div>
                            <div>
                              <span className="font-medium">Court:</span>
                              <span className="ml-2">{hearing.courtName}</span>
                            </div>
                          </div>

                          {hearing.proceedings && (
                            <div>
                              <span className="font-medium text-sm">Proceedings:</span>
                              <p className="text-sm text-muted-foreground mt-1">{hearing.proceedings}</p>
                            </div>
                          )}

                          {hearing.orders.length > 0 && (
                            <div>
                              <span className="font-medium text-sm">Orders:</span>
                              <div className="mt-1 space-y-1">
                                {hearing.orders.map((order, index) => (
                                  <div key={index} className="text-sm text-muted-foreground">
                                    <span className="font-medium">{order.orderType}:</span> {order.orderDetails}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {hearing.nextHearingDate && (
                            <div className="flex items-center gap-2 text-sm">
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Next Hearing:</span>
                              <span>
                                {new Date(hearing.nextHearingDate).toLocaleDateString('en-IN')}
                                {hearing.nextHearingTime && ` at ${hearing.nextHearingTime}`}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Hearing View Popup */}
      <HearingViewPopup
        case_={case_}
        hearing={selectedHearing}
        isOpen={showHearingView}
        onClose={() => {
          console.log('CaseDetailsPopup: Closing hearing view popup');
          setShowHearingView(false);
          setSelectedHearing(null);
          console.log('CaseDetailsPopup: Hearing view popup closed');
        }}
      />

      {/* Hearing Record Popup */}
      <HearingRecordPopup
        key={`${selectedHearing?.id || 'new'}-${showHearingRecord}`}
        case_={case_}
        hearing={selectedHearing}
        isOpen={showHearingRecord}
        onClose={() => {
          console.log('CaseDetailsPopup: Closing hearing popup');
          setShowHearingRecord(false);
          setSelectedHearing(null);
          console.log('CaseDetailsPopup: Hearing popup closed');
        }}
        onHearingSaved={() => {
          console.log('CaseDetailsPopup: Hearing saved/deleted, forcing refresh');
          setRefreshCounter(prev => prev + 1);
          
          // Force reload from API to ensure we have the latest data
          setTimeout(() => {
            console.log('CaseDetailsPopup: Reloading hearings after save/delete');
            reloadHearings();
          }, 500);
        }}
        onHearingDeleted={(hearingId) => {
          console.log('CaseDetailsPopup: Hearing deleted, removing from local state:', hearingId);
          removeHearingFromLocalState(hearingId);
          
          // Also reload from API to ensure consistency
          setTimeout(() => {
            reloadHearings();
          }, 200);
        }}
      />
    </>
  );
};
