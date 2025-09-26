import { Issue, CreateIssueData } from '../types/issue';

// Mock data for demonstration
const MOCK_ISSUES: Issue[] = [
  {
    id: '1',
    title: 'Pothole on Main Street causing traffic disruption',
    description: 'Large pothole near the intersection of Main Street and Oak Avenue. Multiple vehicles have been damaged. Urgent repair needed.',
    department: 'PWD',
    status: 'Open',
    location: {
      latitude: 10.8505,
      longitude: 76.2711,
      address: 'Main Street, Thiruvananthapuram'
    },
    images: [],
    upvotes: 23,
    reporterId: '1',
    reporterEmail: 'citizen@example.com',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z')
  },
  {
    id: '2',
    title: 'Street light not working - safety concern',
    description: 'The street light on Park Road has been non-functional for over a week. This is creating safety issues for pedestrians and vehicles during night time.',
    department: 'KSEB',
    status: 'In Progress',
    location: {
      latitude: 10.8505,
      longitude: 76.2711,
      address: 'Park Road, Thiruvananthapuram'
    },
    images: [],
    upvotes: 18,
    reporterId: '1',
    reporterEmail: 'citizen@example.com',
    createdAt: new Date('2024-01-14T15:45:00Z'),
    updatedAt: new Date('2024-01-16T09:20:00Z')
  },
  {
    id: '3',
    title: 'Water supply disruption in residential area',
    description: 'No water supply for the past 3 days in Sector 12. Multiple households affected. Need immediate attention.',
    department: 'Water',
    status: 'Open',
    location: {
      latitude: 10.8505,
      longitude: 76.2711,
      address: 'Sector 12, Thiruvananthapuram'
    },
    images: [],
    upvotes: 31,
    reporterId: '1',
    reporterEmail: 'citizen@example.com',
    createdAt: new Date('2024-01-13T08:15:00Z'),
    updatedAt: new Date('2024-01-13T08:15:00Z')
  }
];

class IssuesService {
  private storageKey = 'localeyes_issues';
  private upvotesKey = 'localeyes_upvotes';

  getIssues(): Issue[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      const issues = stored ? JSON.parse(stored) : MOCK_ISSUES;
      
      // Convert date strings back to Date objects
      return issues.map((issue: any) => ({
        ...issue,
        createdAt: new Date(issue.createdAt),
        updatedAt: new Date(issue.updatedAt)
      }));
    } catch {
      return MOCK_ISSUES;
    }
  }

  getIssuesByDepartment(department: string): Issue[] {
    return this.getIssues()
      .filter(issue => issue.department === department && issue.status !== 'Resolved')
      .sort((a, b) => b.upvotes - a.upvotes);
  }

  getIssuesByUser(userId: string): Issue[] {
    return this.getIssues()
      .filter(issue => issue.reporterId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  getUserUpvotes(userId: string): Set<string> {
    try {
      const stored = localStorage.getItem(`${this.upvotesKey}_${userId}`);
      return new Set(stored ? JSON.parse(stored) : []);
    } catch {
      return new Set();
    }
  }

  createIssue(userId: string, userEmail: string, data: CreateIssueData): Issue {
    const issues = this.getIssues();
    
    const newIssue: Issue = {
      id: Date.now().toString(),
      ...data,
      status: 'Open',
      upvotes: 0,
      reporterId: userId,
      reporterEmail: userEmail,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    issues.unshift(newIssue);
    this.saveIssues(issues);
    
    return newIssue;
  }

  upvoteIssue(issueId: string, userId: string): boolean {
    const issues = this.getIssues();
    const userUpvotes = this.getUserUpvotes(userId);
    
    if (userUpvotes.has(issueId)) {
      return false; // Already upvoted
    }

    const issueIndex = issues.findIndex(issue => issue.id === issueId);
    if (issueIndex === -1) {
      return false;
    }

    issues[issueIndex].upvotes += 1;
    userUpvotes.add(issueId);

    this.saveIssues(issues);
    this.saveUserUpvotes(userId, userUpvotes);
    
    return true;
  }

  updateIssueStatus(issueId: string, status: Issue['status']): boolean {
    const issues = this.getIssues();
    const issueIndex = issues.findIndex(issue => issue.id === issueId);
    
    if (issueIndex === -1) {
      return false;
    }

    issues[issueIndex].status = status;
    issues[issueIndex].updatedAt = new Date();
    
    this.saveIssues(issues);
    return true;
  }

  private saveIssues(issues: Issue[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(issues));
  }

  private saveUserUpvotes(userId: string, upvotes: Set<string>): void {
    localStorage.setItem(`${this.upvotesKey}_${userId}`, JSON.stringify([...upvotes]));
  }
}

export const issuesService = new IssuesService();