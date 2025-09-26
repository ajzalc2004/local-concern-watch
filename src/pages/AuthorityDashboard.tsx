import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { issuesService } from '../lib/issues';
import { Issue } from '../types/issue';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { MapPin, Clock, User, LogOut, CheckCircle, PlayCircle, AlertTriangle, Calendar } from 'lucide-react';
import { toast } from '../hooks/use-toast';

export default function AuthorityDashboard() {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);

  useEffect(() => {
    loadIssues();
  }, [user]);

  const loadIssues = () => {
    if (!user?.department) return;
    
    const departmentIssues = issuesService.getIssuesByDepartment(user.department);
    setIssues(departmentIssues);
  };

  const handleStatusUpdate = (issueId: string, newStatus: Issue['status']) => {
    const success = issuesService.updateIssueStatus(issueId, newStatus);
    if (success) {
      loadIssues();
      setShowStatusDialog(false);
      setSelectedIssue(null);
      
      const statusMessage = newStatus === 'Resolved' 
        ? 'Issue marked as resolved!'
        : `Issue status updated to ${newStatus}`;
        
      toast({
        title: statusMessage,
        description: "Citizens will be notified of this update."
      });
    }
  };

  const getStatusIcon = (status: Issue['status']) => {
    switch (status) {
      case 'Open':
        return <AlertTriangle className="h-4 w-4 text-accent" />;
      case 'In Progress':
        return <PlayCircle className="h-4 w-4 text-warning" />;
      case 'Resolved':
        return <CheckCircle className="h-4 w-4 text-success" />;
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusCounts = () => {
    return {
      open: issues.filter(i => i.status === 'Open').length,
      inProgress: issues.filter(i => i.status === 'In Progress').length,
      total: issues.length
    };
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">LOCALEYES Authority</h1>
              <p className="text-sm text-muted-foreground">
                {user?.department} Department • {user?.name || user?.email}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Stats */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent-light rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Open Issues</p>
                  <p className="text-2xl font-bold">{statusCounts.open}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <PlayCircle className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{statusCounts.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-light rounded-lg">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Issues</p>
                  <p className="text-2xl font-bold">{statusCounts.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Issues List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">{user?.department} Issues</h2>
              <p className="text-muted-foreground">
                Issues assigned to your department, sorted by priority (upvotes)
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {issues.length > 0 ? (
              issues.map((issue) => (
                <Card key={issue.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Priority Score */}
                      <div className="flex flex-col items-center gap-1 min-w-0">
                        <div className="bg-primary text-primary-foreground rounded-lg p-2 font-bold text-sm">
                          {issue.upvotes}
                        </div>
                        <span className="text-xs text-muted-foreground">votes</span>
                      </div>

                      {/* Issue Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-semibold text-lg leading-tight">{issue.title}</h3>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(issue.status)}
                            <Badge className={getStatusColor(issue.status)}>
                              {issue.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-4">
                          {issue.description}
                        </p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>Reported by {issue.reporterEmail}</span>
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

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedIssue(issue);
                              setShowStatusDialog(true);
                            }}
                          >
                            Update Status
                          </Button>
                          
                          {issue.status === 'Open' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleStatusUpdate(issue.id, 'In Progress')}
                              className="shadow-primary"
                            >
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Start Work
                            </Button>
                          )}
                          
                          {issue.status === 'In Progress' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleStatusUpdate(issue.id, 'Resolved')}
                              className="bg-success hover:bg-success/90 shadow-success"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Resolved
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Open Issues</h3>
                  <p className="text-muted-foreground">
                    Great work! There are currently no open issues for the {user?.department} department.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Issue Status</DialogTitle>
            <DialogDescription>
              Change the status of "{selectedIssue?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => selectedIssue && handleStatusUpdate(selectedIssue.id, 'Open')}
                disabled={selectedIssue?.status === 'Open'}
              >
                <AlertTriangle className="h-5 w-5 text-accent mr-3" />
                <div className="text-left">
                  <div className="font-medium">Open</div>
                  <div className="text-sm text-muted-foreground">Issue is reported and pending action</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => selectedIssue && handleStatusUpdate(selectedIssue.id, 'In Progress')}
                disabled={selectedIssue?.status === 'In Progress'}
              >
                <PlayCircle className="h-5 w-5 text-warning mr-3" />
                <div className="text-left">
                  <div className="font-medium">In Progress</div>
                  <div className="text-sm text-muted-foreground">Work has started on this issue</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => selectedIssue && handleStatusUpdate(selectedIssue.id, 'Resolved')}
                disabled={selectedIssue?.status === 'Resolved'}
              >
                <CheckCircle className="h-5 w-5 text-success mr-3" />
                <div className="text-left">
                  <div className="font-medium">Resolved</div>
                  <div className="text-sm text-muted-foreground">Issue has been fixed</div>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}