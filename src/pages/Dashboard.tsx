import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Users, 
  Calendar,
  AlertTriangle,
  Clock,
  Gavel,
  TrendingUp,
  IndianRupee
} from 'lucide-react';
import { useLegalData } from '@/contexts/LegalDataContext';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const { cases, clients, alerts } = useLegalData();
  const { user } = useAuth();
  
  const todaysCases = cases.filter(c => {
    const today = new Date();
    const caseDate = new Date(c.hearingDate);
    return caseDate.toDateString() === today.toDateString();
  });

  const urgentCases = cases.filter(c => c.priority === 'urgent');
  const activeCases = cases.filter(c => c.status === 'active');
  const unreadAlerts = alerts.filter(a => !a.isRead);

  const stats = [
    {
      title: "Total Cases",
      value: cases.length,
      description: `${activeCases.length} active`,
      icon: FileText,
      trend: "+12% from last month"
    },
    {
      title: "Clients",
      value: clients.length,
      description: "Total registered",
      icon: Users,
      trend: "+8% from last month"
    },
    {
      title: "Today's Hearings",
      value: todaysCases.length,
      description: "Scheduled for today",
      icon: Calendar,
      trend: urgentCases.length > 0 ? `${urgentCases.length} urgent` : "No urgent cases"
    },
    {
      title: "Pending Alerts",
      value: unreadAlerts.length,
      description: "Require attention",
      icon: AlertTriangle,
      trend: unreadAlerts.length > 0 ? "Action needed" : "All clear"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Good Morning, {user?.name}</h1>
          <p className="text-muted-foreground">Here's your legal practice overview for today</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Today</p>
          <p className="font-semibold">{new Date().toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="shadow-card-custom">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <p className="text-xs text-success mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's Hearings */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Today's Hearings
            </CardTitle>
            <CardDescription>Cases scheduled for today</CardDescription>
          </CardHeader>
          <CardContent>
            {todaysCases.length > 0 ? (
              <div className="space-y-4">
                {todaysCases.slice(0, 3).map((case_) => (
                  <div key={case_.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{case_.caseNumber}</p>
                      <p className="text-sm text-muted-foreground">{case_.clientName}</p>
                      <p className="text-xs text-muted-foreground">{case_.courtName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{case_.hearingTime}</p>
                      <Badge variant={case_.priority === 'urgent' ? 'destructive' : 'secondary'}>
                        {case_.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
                {todaysCases.length > 3 && (
                  <Button variant="outline" className="w-full">
                    View All {todaysCases.length} Hearings
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hearings scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Recent Alerts
            </CardTitle>
            <CardDescription>Important notifications and reminders</CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.slice(0, 4).map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg border ${
                    alert.isRead ? 'bg-muted/50' : 'bg-warning/10 border-warning/20'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {alert.alertTime.toLocaleString('en-IN')}
                        </p>
                      </div>
                      {!alert.isRead && (
                        <Badge variant="destructive" className="ml-2">New</Badge>
                      )}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Alerts
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No recent alerts</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button className="h-20 flex flex-col gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-xs">New Case</span>
              </Button>
              <Button variant="secondary" className="h-20 flex flex-col gap-2">
                <Users className="h-5 w-5" />
                <span className="text-xs">Add Client</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <Calendar className="h-5 w-5" />
                <span className="text-xs">Schedule</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2">
                <IndianRupee className="h-5 w-5" />
                <span className="text-xs">Billing</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Case Status Overview */}
        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Case Status Overview
            </CardTitle>
            <CardDescription>Current case distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Cases</span>
                <Badge variant="default">{activeCases.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending Cases</span>
                <Badge variant="secondary">{cases.filter(c => c.status === 'pending').length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Won Cases</span>
                <Badge variant="outline" className="bg-success text-success-foreground">{cases.filter(c => c.status === 'won').length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Closed Cases</span>
                <Badge variant="outline">{cases.filter(c => c.status === 'closed').length}</Badge>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between font-medium">
                  <span>Total Cases</span>
                  <span>{cases.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;