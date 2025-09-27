// Frontend email service that calls backend API
export interface IssueResolutionEmailData {
  reporterEmail: string;
  reporterName?: string;
  issueTitle: string;
  issueDescription: string;
  issueLocation: string;
  department: string;
  resolvedDate: string;
}

class FrontendEmailService {
  private apiUrl: string;

  constructor() {
    // In Vite, environment variables are accessed via import.meta.env
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  }

  async sendIssueResolutionEmail(data: IssueResolutionEmailData): Promise<boolean> {
    try {
      console.log('📧 Sending email via backend API...');
      
      const response = await fetch(`${this.apiUrl}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log(`✅ Email sent successfully to ${data.reporterEmail}`);
        return true;
      } else {
        console.error('❌ Failed to send email:', result.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Email API error:', error);
      return false;
    }
  }

  // Test email configuration
  async testEmailConfiguration(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/test-email`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();
      return response.ok && result.success;
    } catch (error) {
      console.error('❌ Email test error:', error);
      return false;
    }
  }
}

export const gmailSMTPEmailService = new FrontendEmailService();
