import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { issuesService } from '../lib/issues';
import { Issue, CreateIssueData, DEPARTMENTS } from '../types/issue';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../components/ui/sheet';
import { ArrowUp, MapPin, Plus, User, LogOut, Clock, Calendar } from 'lucide-react';
import { toast } from '../hooks/use-toast';

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [myIssues, setMyIssues] = useState<Issue[]>([]);
  const [userUpvotes, setUserUpvotes] = useState<Set<string>>(new Set());
  const [showReportForm, setShowReportForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportForm, setReportForm] = useState<Omit<CreateIssueData, 'location'>>({
    title: '',
    description: '',
    department: 'PWD',
    images: []
  });

  useEffect(() => {
    loadIssues();
  }, [user]);

  const loadIssues = () => {
    if (!user) return;
    
    const allIssues = issuesService.getIssues();
    const userIssues = issuesService.getIssuesByUser(user.id);
    const upvotes = issuesService.getUserUpvotes(user.id);
    
    // Add upvote status to issues
    const issuesWithUpvoteStatus = allIssues.map(issue => ({
      ...issue,
      hasUserUpvoted: upvotes.has(issue.id)
    }));
    
    setIssues(issuesWithUpvoteStatus.sort((a, b) => b.upvotes - a.upvotes));
    setMyIssues(userIssues);
    setUserUpvotes(upvotes);
  };

  const handleUpvote = async (issueId: string) => {
    if (!user) return;
    
    const success = issuesService.upvoteIssue(issueId, user.id);
    if (success) {
      loadIssues();
      toast({
        title: "Issue upvoted!",
        description: "Your vote helps prioritize this issue."
      });
    }
  };

  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      });
    });
  };

  const handleSubmitReport = async () => {
    if (!user || !reportForm.title.trim() || !reportForm.description.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const position = await getCurrentLocation();
      
      const issueData: CreateIssueData = {
        ...reportForm,
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          address: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
        }
      };
      
      issuesService.createIssue(user.id, user.email, issueData);
      
      setReportForm({
        title: '',
        description: '',
        department: 'PWD',
        images: []
      });
      setShowReportForm(false);
      loadIssues();
      
      toast({
        title: "Issue reported successfully!",
        description: "Your report has been submitted and authorities have been notified."
      });
    } catch (error) {
      toast({
        title: "Location access required",
        description: "Please allow location access to report issues with precise location data.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'Open':
        return 'bg-accent text-accent-foreground';
      case 'In Progress':
        return 'bg-warning text-warning-foreground';
      case 'Resolved':
        return 'bg-success text-success-foreground';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">LOCALEYES</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.name || user?.email}</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    My Issues ({myIssues.length})
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>My Reported Issues</SheetTitle>
                    <SheetDescription>
                      Track the status of issues you've reported
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {myIssues.length > 0 ? (
                      myIssues.map((issue) => (
                        <Card key={issue.id} className="text-sm">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-medium line-clamp-2">{issue.title}</h4>
                                <p className="text-muted-foreground mt-1">
                                  {issue.department} • {formatDate(issue.createdAt)}
                                </p>
                              </div>
                              <Badge className={getStatusColor(issue.status)}>
                                {issue.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        You haven't reported any issues yet
                      </p>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
              
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Issues Feed */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold">Community Issues</h2>
                <p className="text-muted-foreground">
                  Issues reported by the community, sorted by popularity
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              {issues.map((issue) => (
                <Card key={issue.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Upvote Section */}
                      <div className="flex flex-col items-center gap-2 min-w-0">
                        <Button
                          variant={issue.hasUserUpvoted ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleUpvote(issue.id)}
                          disabled={issue.hasUserUpvoted}
                          className="h-auto p-2"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <span className="font-medium text-sm">{issue.upvotes}</span>
                      </div>

                      {/* Issue Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-semibold text-lg leading-tight">{issue.title}</h3>
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status}
                          </Badge>
                        </div>
                        
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {issue.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Badge variant="secondary">{issue.department}</Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>{issue.location.address}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(issue.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Report Button */}
      <Dialog open={showReportForm} onOpenChange={setShowReportForm}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg shadow-primary/30 z-50"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Report New Issue</DialogTitle>
            <DialogDescription>
              Report a local issue that needs attention from authorities.
              Your location will be automatically captured.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Issue Title *</label>
              <Input
                placeholder="Brief description of the issue"
                value={reportForm.title}
                onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Department *</label>
              <Select 
                value={reportForm.department} 
                onValueChange={(value) => setReportForm(prev => ({ ...prev, department: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                placeholder="Provide detailed information about the issue..."
                value={reportForm.description}
                onChange={(e) => setReportForm(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowReportForm(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReport} 
              disabled={isSubmitting}
              className="shadow-primary"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}