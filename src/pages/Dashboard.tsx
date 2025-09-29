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
  IndianRupee,
  Plus
} from 'lucide-react';
import { useLegalData } from '@/contexts/LegalDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { AlertManager } from '@/components/AlertManager';

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
      title: "Revenue This Month",
      value: "₹2,45,000",
      description: "Billing & payments",
      icon: IndianRupee,
      trend: "+15% from last month"
    }
  ];

  const quickActions = [
    {
      title: "Add New Case",
      description: "Register a new legal case",
      icon: FileText,
      action: () => window.location.href = '/dashboard/cases',
      color: "bg-primary"
    },
    {
      title: "Schedule Hearing",
      description: "Add court appearance",
      icon: Calendar,
      action: () => window.location.href = '/dashboard/calendar',
      color: "bg-secondary"
    },
    {
      title: "Add Client",
      description: "Register new client",
      icon: Users,
      action: () => window.location.href = '/dashboard/clients',
      color: "bg-accent"
    },
    {
      title: "Legal Research",
      description: "Search law database",
      icon: Gavel,
      action: () => window.location.href = '/dashboard/legal-research',
      color: "bg-warning"
    }
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Here's what's happening with your practice today
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => window.location.href = '/dashboard/cases'}
            className="flex-1 sm:flex-initial"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/dashboard/clients'}
            className="flex-1 sm:flex-initial"
          >
            <Users className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="card-gradient shadow-elevated hover:shadow-professional transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <div className="flex items-center pt-1">
                <TrendingUp className="h-3 w-3 text-success mr-1" />
                <span className="text-xs text-success">{stat.trend}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Today's Cases */}
        <div className="lg:col-span-2 xl:col-span-2">
          <Card className="card-gradient shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Today's Hearings ({todaysCases.length})
              </CardTitle>
              <CardDescription>Cases scheduled for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {todaysCases.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No hearings scheduled for today
                  </p>
                ) : (
                  todaysCases.map((case_item) => (
                    <div key={case_item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-muted/20 rounded-lg border">
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="font-medium text-sm">{case_item.caseNumber}</span>
                          <Badge 
                            variant={case_item.priority === 'urgent' ? 'destructive' : 'secondary'}
                            className="w-fit"
                          >
                            {case_item.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{case_item.clientName} vs {case_item.opposingParty}</p>
                        <p className="text-xs text-muted-foreground">
                          {case_item.courtName} • {case_item.hearingTime}
                        </p>
                      </div>
                      <div className="flex gap-2 mt-2 sm:mt-0">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => window.location.href = `/dashboard/cases`}
                        >
                          View
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => window.location.href = `/dashboard/calendar`}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {todaysCases.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/dashboard/calendar'}
                  >
                    View Full Calendar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-6">
          {/* Alerts */}
          <AlertManager />

          {/* Quick Actions */}
          <Card className="card-gradient shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="flex items-center justify-start gap-3 p-3 h-auto text-left"
                    onClick={action.action}
                  >
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{action.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{action.description}</p>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="card-gradient shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-success mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">Case CS/2024/001 hearing scheduled</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">New client registration</p>
                    <p className="text-xs text-muted-foreground">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">Document uploaded for case</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;