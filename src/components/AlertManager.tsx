import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, AlertTriangle, CheckCircle, Plus, X } from 'lucide-react';
import { useLegalData, Alert } from '@/contexts/LegalDataContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export const AlertManager = () => {
  const { cases, alerts, addAlert, markAlertAsRead } = useLegalData();
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const { toast } = useToast();

  // Form state for creating alerts
  const [alertForm, setAlertForm] = useState({
    caseId: '',
    type: 'hearing' as Alert['type'],
    message: '',
    alertTime: ''
  });

  // Auto-generate hearing alerts
  useEffect(() => {
    cases.forEach(case_ => {
      if (case_.hearingDate) {
        const hearingDate = new Date(case_.hearingDate);
        const now = new Date();
        
        // Create alerts for upcoming hearings (24h, 6h, 1h before)
        [24, 6, 1].forEach(hours => {
          const alertTime = new Date(hearingDate.getTime() - (hours * 60 * 60 * 1000));
          
          if (alertTime > now) {
            const existingAlert = alerts.find(alert => 
              alert.caseId === case_.id && 
              alert.type === 'hearing' &&
              Math.abs(new Date(alert.alertTime).getTime() - alertTime.getTime()) < 60000
            );

            if (!existingAlert) {
              setTimeout(() => {
                addAlert({
                  caseId: case_.id,
                  type: 'hearing',
                  message: `Hearing reminder: ${case_.caseNumber} - ${case_.clientName} at ${case_.courtName} in ${hours} hour${hours !== 1 ? 's' : ''}`,
                  alertTime: alertTime,
                  timestamp: new Date(),
                  isRead: false
                });
              }, 100);
            }
          }
        });
      }
    });
  }, [cases, alerts, addAlert]);

  const handleCreateAlert = () => {
    if (!alertForm.caseId || !alertForm.message || !alertForm.alertTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    addAlert({
      caseId: alertForm.caseId,
      type: alertForm.type,
      message: alertForm.message,
      alertTime: new Date(alertForm.alertTime),
      timestamp: new Date(),
      isRead: false
    });

    toast({
      title: "Alert Created",
      description: "Your custom alert has been scheduled successfully",
    });

    setShowCreateAlert(false);
    setAlertForm({
      caseId: '',
      type: 'hearing',
      message: '',
      alertTime: ''
    });
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'hearing': return <Clock className="h-4 w-4 text-primary" />;
      case 'deadline': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'payment': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'document': return <Bell className="h-4 w-4 text-secondary" />;
      default: return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getAlertBadgeColor = (type: Alert['type']) => {
    switch (type) {
      case 'hearing': return 'default';
      case 'deadline': return 'destructive';
      case 'payment': return 'secondary';
      case 'document': return 'outline';
      default: return 'outline';
    }
  };

  const unreadAlerts = alerts.filter(alert => !alert.isRead);
  const recentAlerts = alerts
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <Card className="shadow-elevated">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Alert Management
            {unreadAlerts.length > 0 && (
              <Badge variant="destructive">
                {unreadAlerts.length} new
              </Badge>
            )}
          </CardTitle>
          
          <Dialog open={showCreateAlert} onOpenChange={setShowCreateAlert}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Create Alert
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Custom Alert</DialogTitle>
                <DialogDescription>
                  Set up a custom reminder for important case events
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="caseId">Case*</Label>
                  <Select value={alertForm.caseId} onValueChange={(value) => 
                    setAlertForm(prev => ({ ...prev, caseId: value }))
                  }>
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

                <div>
                  <Label htmlFor="type">Alert Type*</Label>
                  <Select value={alertForm.type} onValueChange={(value) => 
                    setAlertForm(prev => ({ ...prev, type: value as Alert['type'] }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hearing">Hearing</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">Alert Message*</Label>
                  <Input
                    id="message"
                    value={alertForm.message}
                    onChange={(e) => setAlertForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter alert message..."
                  />
                </div>

                <div>
                  <Label htmlFor="alertTime">Alert Date & Time*</Label>
                  <Input
                    id="alertTime"
                    type="datetime-local"
                    value={alertForm.alertTime}
                    onChange={(e) => setAlertForm(prev => ({ ...prev, alertTime: e.target.value }))}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateAlert(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAlert}>
                  Create Alert
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <CardDescription>
          Manage notifications and reminders for your cases
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentAlerts.length > 0 ? (
            recentAlerts.map((alert) => {
              const associatedCase = cases.find(c => c.id === alert.caseId);
              const isUpcoming = new Date(alert.alertTime) > new Date();
              
              return (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-lg border transition-colors ${
                    alert.isRead ? 'bg-muted/30' : 'bg-primary/5 border-primary/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <Badge variant={getAlertBadgeColor(alert.type)}>
                            {alert.type}
                          </Badge>
                          {!alert.isRead && (
                            <Badge variant="destructive" className="text-xs">New</Badge>
                          )}
                        </div>
                        
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>
                            {isUpcoming ? 'Scheduled for: ' : 'Alert time: '}
                            {new Date(alert.alertTime).toLocaleString('en-IN')}
                          </p>
                          {associatedCase && (
                            <p>Case: {associatedCase.caseNumber} - {associatedCase.clientName}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      {!alert.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAlertAsRead(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No alerts yet</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setShowCreateAlert(true)}
              >
                <Plus className="mr-2 h-3 w-3" />
                Create First Alert
              </Button>
            </div>
          )}
        </div>

        {/* Alert Summary */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{unreadAlerts.length}</div>
              <p className="text-xs text-muted-foreground">Unread Alerts</p>
            </div>
            <div>
              <div className="text-2xl font-bold">{alerts.length}</div>
              <p className="text-xs text-muted-foreground">Total Alerts</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};