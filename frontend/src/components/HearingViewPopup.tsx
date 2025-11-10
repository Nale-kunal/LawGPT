import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar, 
  Clock, 
  Building, 
  Gavel, 
  FileText, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  MapPin,
  User,
  FileCheck
} from 'lucide-react';
import { Case, Hearing } from '@/contexts/LegalDataContext';

interface HearingViewPopupProps {
  case_: Case | null;
  hearing: Hearing | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HearingViewPopup: React.FC<HearingViewPopupProps> = ({ 
  case_, 
  hearing, 
  isOpen, 
  onClose 
}) => {
  if (!hearing) return null;

  const getHearingStatusColor = (status: Hearing['status']) => {
    switch (status) {
      case 'scheduled': return 'default';
      case 'completed': return 'outline';
      case 'adjourned': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'default';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Hearing Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Date:</span>
                    <span>{formatDate(hearing.hearingDate)}</span>
                  </div>
                  
                  {hearing.hearingTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Time:</span>
                      <span>{formatTime(hearing.hearingTime)}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Court:</span>
                    <span>{hearing.courtName}</span>
                  </div>

                  {hearing.judgeName && (
                    <div className="flex items-center gap-2">
                      <Gavel className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Judge:</span>
                      <span>{hearing.judgeName}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Type:</span>
                    <Badge variant="outline">{hearing.hearingType.replace('_', ' ').toUpperCase()}</Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-medium">Status:</span>
                    <Badge variant={getHearingStatusColor(hearing.status)}>
                      {hearing.status.toUpperCase()}
                    </Badge>
                  </div>

                  {hearing.nextHearingDate && (
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Next Hearing:</span>
                      <span>
                        {formatDate(hearing.nextHearingDate)}
                        {hearing.nextHearingTime && ` at ${formatTime(hearing.nextHearingTime)}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Purpose and Instructions */}
          {(hearing.purpose || hearing.courtInstructions) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4" />
                  Purpose & Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hearing.purpose && (
                  <div>
                    <h4 className="font-medium mb-2">Purpose:</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      {hearing.purpose}
                    </p>
                  </div>
                )}

                {hearing.courtInstructions && (
                  <div>
                    <h4 className="font-medium mb-2">Court Instructions:</h4>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      {hearing.courtInstructions}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Documents and Witnesses */}
          {(hearing.documentsToBring?.length > 0 || hearing.attendance?.witnessesPresent?.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documents & Witnesses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {hearing.documentsToBring?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Documents to Bring:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {hearing.documentsToBring.map((doc, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {doc}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {hearing.attendance?.witnessesPresent?.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Witnesses Present:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {hearing.attendance.witnessesPresent.map((witness, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {witness}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Attendance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Attendance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Client Present:</span>
                  <Badge variant={hearing.attendance?.clientPresent ? 'outline' : 'secondary'}>
                    {hearing.attendance?.clientPresent ? 'Yes' : 'No'}
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Opposing Party Present:</span>
                  <Badge variant={hearing.attendance?.opposingPartyPresent ? 'outline' : 'secondary'}>
                    {hearing.attendance?.opposingPartyPresent ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Orders */}
          {hearing.orders?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-4 w-4" />
                  Court Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {hearing.orders.map((order, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium">{order.orderType}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(order.orderDate)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {order.orderDetails}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Proceedings */}
          {hearing.proceedings && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Proceedings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  {hearing.proceedings}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Adjournment Reason */}
          {hearing.adjournmentReason && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Adjournment Reason
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  {hearing.adjournmentReason}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {hearing.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Additional Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  {hearing.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
