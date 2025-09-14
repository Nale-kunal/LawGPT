import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useLegalData, Case } from '@/contexts/LegalDataContext';

interface ConflictCheckerProps {
  currentCase?: Case;
}

interface Conflict {
  type: 'time' | 'client' | 'court' | 'opposing-party';
  severity: 'high' | 'medium' | 'low';
  message: string;
  affectedCase: Case;
}

export const CaseConflictChecker = ({ currentCase }: ConflictCheckerProps) => {
  const { cases } = useLegalData();

  const conflicts = useMemo(() => {
    if (!currentCase) return [];

    const foundConflicts: Conflict[] = [];

    cases.forEach(existingCase => {
      if (existingCase.id === currentCase.id) return;

      // Time conflict check
      if (existingCase.hearingDate && currentCase.hearingDate) {
        const existingDate = new Date(existingCase.hearingDate);
        const currentDate = new Date(currentCase.hearingDate);
        
        if (existingDate.toDateString() === currentDate.toDateString()) {
          const timeDiff = Math.abs(
            new Date(`2000-01-01 ${existingCase.hearingTime || '10:00'}`).getTime() - 
            new Date(`2000-01-01 ${currentCase.hearingTime || '10:00'}`).getTime()
          );
          
          if (timeDiff < 2 * 60 * 60 * 1000) { // Less than 2 hours apart
            foundConflicts.push({
              type: 'time',
              severity: timeDiff < 60 * 60 * 1000 ? 'high' : 'medium',
              message: `Time conflict with ${existingCase.caseNumber} on ${existingDate.toLocaleDateString('en-IN')}`,
              affectedCase: existingCase
            });
          }
        }
      }

      // Client conflict check
      if (existingCase.clientName.toLowerCase() === currentCase.clientName.toLowerCase() && 
          existingCase.status === 'active' && currentCase.status === 'active') {
        foundConflicts.push({
          type: 'client',
          severity: 'medium',
          message: `Multiple active cases for client: ${currentCase.clientName}`,
          affectedCase: existingCase
        });
      }

      // Opposing party conflict check
      if (existingCase.opposingParty && currentCase.opposingParty &&
          existingCase.opposingParty.toLowerCase() === currentCase.opposingParty.toLowerCase()) {
        foundConflicts.push({
          type: 'opposing-party',
          severity: 'high',
          message: `Conflict of interest: Same opposing party (${currentCase.opposingParty})`,
          affectedCase: existingCase
        });
      }

      // Court conflict check (same court, same date)
      if (existingCase.courtName.toLowerCase() === currentCase.courtName.toLowerCase() &&
          existingCase.hearingDate && currentCase.hearingDate) {
        const existingDate = new Date(existingCase.hearingDate);
        const currentDate = new Date(currentCase.hearingDate);
        
        if (existingDate.toDateString() === currentDate.toDateString()) {
          foundConflicts.push({
            type: 'court',
            severity: 'low',
            message: `Multiple cases at ${currentCase.courtName} on ${currentDate.toLocaleDateString('en-IN')}`,
            affectedCase: existingCase
          });
        }
      }
    });

    return foundConflicts;
  }, [cases, currentCase]);

  const getConflictIcon = (severity: Conflict['severity']) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'medium': return <Clock className="h-4 w-4 text-warning" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getConflictColor = (severity: Conflict['severity']) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
    }
  };

  if (!currentCase) {
    return (
      <Card className="shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-success" />
            Conflict Checker
          </CardTitle>
          <CardDescription>AI-powered conflict detection system</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Enter case details to check for potential conflicts
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card-custom">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {conflicts.length > 0 ? (
            <AlertTriangle className="h-5 w-5 text-warning" />
          ) : (
            <CheckCircle className="h-5 w-5 text-success" />
          )}
          Conflict Checker
          {conflicts.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {conflicts.length} conflict{conflicts.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {conflicts.length > 0 
            ? 'Potential conflicts detected for this case'
            : 'No conflicts detected for this case'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {conflicts.length > 0 ? (
          <div className="space-y-3">
            {conflicts.map((conflict, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                {getConflictIcon(conflict.severity)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">{conflict.message}</p>
                    <Badge variant={getConflictColor(conflict.severity)}>
                      {conflict.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Conflicting case: {conflict.affectedCase.caseNumber} - {conflict.affectedCase.clientName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 mx-auto text-success mb-2" />
            <p className="text-sm font-medium">All Clear!</p>
            <p className="text-xs text-muted-foreground">
              No scheduling conflicts or ethical concerns detected
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};