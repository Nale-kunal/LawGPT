import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Database,
  Mail,
  Phone,
  CreditCard,
  Download,
  Upload
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+91 98765 43210',
    barNumber: user?.barNumber || '',
    firm: user?.firm || '',
    address: '',
    bio: ''
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: true,
    pushNotifications: true,
    hearingReminders: true,
    clientUpdates: true,
    billingAlerts: false,
    weeklyReports: true
  });

  // System preferences
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en-IN',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    currency: 'INR'
  });

  // Security settings
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: '30',
    loginNotifications: true
  });

  const handleSaveProfile = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
    });
  };

  const handleSavePreferences = () => {
    toast({
      title: "Preferences Updated",
      description: "Your system preferences have been saved.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your data export is being prepared. You'll receive a download link shortly.",
    });
  };

  const handleImportData = () => {
    toast({
      title: "Import Started",
      description: "Please select the backup file to import your data.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      {/* Profile Settings */}
      <Card className="shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal and professional details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your full name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <Label htmlFor="barNumber">Bar Council Number</Label>
              <Input
                id="barNumber"
                value={profileData.barNumber}
                onChange={(e) => setProfileData(prev => ({ ...prev, barNumber: e.target.value }))}
                placeholder="DL/2018/12345"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="firm">Law Firm/Organization</Label>
            <Input
              id="firm"
              value={profileData.firm}
              onChange={(e) => setProfileData(prev => ({ ...prev, firm: e.target.value }))}
              placeholder="Your law firm name"
            />
          </div>

          <div>
            <Label htmlFor="address">Office Address</Label>
            <Textarea
              id="address"
              value={profileData.address}
              onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Complete office address..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Brief description of your legal expertise..."
              rows={3}
            />
          </div>

          <Button onClick={handleSaveProfile}>
            Save Profile Changes
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure how you want to receive alerts and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailAlerts" className="text-base">Email Alerts</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                id="emailAlerts"
                checked={notifications.emailAlerts}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailAlerts: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="smsAlerts" className="text-base">SMS Alerts</Label>
                <p className="text-sm text-muted-foreground">Receive important notifications via SMS</p>
              </div>
              <Switch
                id="smsAlerts"
                checked={notifications.smsAlerts}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, smsAlerts: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="pushNotifications" className="text-base">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Browser push notifications</p>
              </div>
              <Switch
                id="pushNotifications"
                checked={notifications.pushNotifications}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushNotifications: checked }))}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="hearingReminders" className="text-base">Hearing Reminders</Label>
                <p className="text-sm text-muted-foreground">Automatic reminders for court hearings</p>
              </div>
              <Switch
                id="hearingReminders"
                checked={notifications.hearingReminders}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, hearingReminders: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="clientUpdates" className="text-base">Client Updates</Label>
                <p className="text-sm text-muted-foreground">Notifications about client case updates</p>
              </div>
              <Switch
                id="clientUpdates"
                checked={notifications.clientUpdates}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, clientUpdates: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="billingAlerts" className="text-base">Billing Alerts</Label>
                <p className="text-sm text-muted-foreground">Payment and invoice notifications</p>
              </div>
              <Switch
                id="billingAlerts"
                checked={notifications.billingAlerts}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, billingAlerts: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="weeklyReports" className="text-base">Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Weekly summary of activities</p>
              </div>
              <Switch
                id="weeklyReports"
                checked={notifications.weeklyReports}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReports: checked }))}
              />
            </div>
          </div>

          <Button onClick={handleSaveNotifications}>
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Preferences */}
        <Card className="shadow-card-custom">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              System Preferences
            </CardTitle>
            <CardDescription>
              Customize your application experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select value={preferences.theme} onValueChange={(value) => setPreferences(prev => ({ ...prev, theme: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <Select value={preferences.language} onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-IN">English (India)</SelectItem>
                  <SelectItem value="hi-IN">हिन्दी</SelectItem>
                  <SelectItem value="bn-IN">বাংলা</SelectItem>
                  <SelectItem value="ta-IN">தமிழ்</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={preferences.timezone} onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                  <SelectItem value="Asia/Mumbai">Asia/Mumbai (IST)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select value={preferences.dateFormat} onValueChange={(value) => setPreferences(prev => ({ ...prev, dateFormat: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={preferences.currency} onValueChange={(value) => setPreferences(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                  <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSavePreferences}>
              Save Preferences
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="shadow-card-custom">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Security & Privacy
            </CardTitle>
            <CardDescription>
              Manage your account security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="twoFactor" className="text-base">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch
                id="twoFactor"
                checked={security.twoFactorEnabled}
                onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, twoFactorEnabled: checked }))}
              />
            </div>

            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
              <Select value={security.sessionTimeout} onValueChange={(value) => setSecurity(prev => ({ ...prev, sessionTimeout: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="480">8 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="loginNotifications" className="text-base">Login Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified of account logins</p>
              </div>
              <Switch
                id="loginNotifications"
                checked={security.loginNotifications}
                onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, loginNotifications: checked }))}
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
              <Button variant="outline" className="w-full">
                Download Account Data
              </Button>
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Management */}
      <Card className="shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Data Management
          </CardTitle>
          <CardDescription>
            Backup and restore your legal data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Export Data</h4>
              <p className="text-sm text-muted-foreground">
                Download a complete backup of your cases, clients, and documents
              </p>
              <Button onClick={handleExportData} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export All Data
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Import Data</h4>
              <p className="text-sm text-muted-foreground">
                Restore your data from a previous backup
              </p>
              <Button onClick={handleImportData} variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Import Backup
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;