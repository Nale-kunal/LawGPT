import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, AlertTriangle, CheckCircle, Plus, X, Trash2 } from 'lucide-react';
import { useLegalData, Alert } from '@/contexts/LegalDataContext';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

export const AlertManager = () => {
  const { cases, alerts, addAlert, markAlertAsRead, deleteAlert } = useLegalData();
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [isActionBusy, setIsActionBusy] = useState(false);
  const { toast } = useToast();

  // Form state for creating alerts
  const [alertForm, setAlertForm] = useState({
    caseId: '',
    type: 'hearing' as Alert['type'],
    message: '',
    alertTime: ''
  });

  // Removed auto-generation to avoid duplicate/regression behavior. Consider backend scheduler if needed.

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
  const recentAlerts = [...alerts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <Card className="shadow-elevated lg:sticky lg:top-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
            {unreadAlerts.length > 0 && (
              <Badge variant="destructive">
                {unreadAlerts.length} new
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <Dialog open={showCreateAlert} onOpenChange={setShowCreateAlert}>
            <DialogTrigger asChild>
                <Button size="sm" className="whitespace-nowrap">
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
        </div>
        
        <CardDescription>
          Manage notifications and reminders for your cases
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {recentAlerts.length > 0 ? (
            recentAlerts.map((alert) => {
              const associatedCase = cases.find(c => c.id === alert.caseId);
              const isUpcoming = new Date(alert.alertTime) > new Date();
              
              return (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-lg border transition-colors overflow-hidden ${
                    alert.isRead ? 'bg-muted/30' : 'bg-primary/5 border-primary/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium break-words truncate">{alert.message}</p>
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
                          onClick={async () => { if (isActionBusy) return; setIsActionBusy(true); await markAlertAsRead(alert.id); setIsActionBusy(false); }}
                          disabled={isActionBusy}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => { if (isActionBusy) return; setIsActionBusy(true); await deleteAlert(alert.id); setIsActionBusy(false); }}
                        disabled={isActionBusy}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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