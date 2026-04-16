/**
 * API Service Layer
 * 
 * This service layer is designed for future FastAPI backend integration.
 * Currently uses dummy data for development and testing.
 * 
 * To integrate with FastAPI backend:
 * 1. Set API_BASE_URL to your FastAPI server URL
 * 2. Uncomment the fetch calls
 * 3. Remove dummy data returns
 */

import { 
  User, 
  Inspection, 
  Document, 
  Evidence, 
  FinalReport,
  Notification 
} from '@/types';

const API_BASE_URL = 'https://your-fastapi-backend.com/api/v1';

// Mock delay for simulating API calls
const mockDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
    };
  }

  // ==================== AUTH ====================
  
  async login(email: string, password: string): Promise<{ user: User; token: string; refreshToken: string }> {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/auth/login`, {
    //   method: 'POST',
    //   headers: this.getHeaders(),
    //   body: JSON.stringify({ email, password }),
    // });
    // return response.json();

    await mockDelay(1500);
    
    if (email === 'rajesh.kumar@gov.in' && password === 'password123') {
      return {
        user: {
          id: 'officer-001',
          name: 'Inspector Rajesh Kumar',
          email: 'rajesh.kumar@gov.in',
          badgeNumber: 'INS-2024-001',
          department: 'School Inspection Division',
          phone: '+91 98765 43210',
          profileImage: 'https://i.pravatar.cc/150?u=officer-001',
          role: 'officer',
          isActive: true,
          lastLogin: new Date().toISOString(),
        },
        token: 'jwt-token-' + Date.now(),
        refreshToken: 'refresh-token-' + Date.now(),
      };
    }
    throw new Error('Invalid credentials');
  }

  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    //   method: 'POST',
    //   headers: this.getHeaders(),
    //   body: JSON.stringify({ refresh_token: refreshToken }),
    // });
    // return response.json();

    await mockDelay(500);
    return {
      token: 'refreshed-jwt-token-' + Date.now(),
      refreshToken: 'refreshed-refresh-token-' + Date.now(),
    };
  }

  async logout(): Promise<void> {
    // TODO: Replace with actual API call
    // await fetch(`${API_BASE_URL}/auth/logout`, {
    //   method: 'POST',
    //   headers: this.getHeaders(),
    // });

    await mockDelay(500);
    this.clearToken();
  }

  // ==================== INSPECTIONS ====================

  async getInspections(filters?: { status?: string; priority?: string }): Promise<Inspection[]> {
    // TODO: Replace with actual API call
    // const queryParams = new URLSearchParams(filters).toString();
    // const response = await fetch(`${API_BASE_URL}/inspections?${queryParams}`, {
    //   headers: this.getHeaders(),
    // });
    // return response.json();

    await mockDelay(1000);
    // Return from store in actual implementation
    return [];
  }

  async getInspectionById(id: string): Promise<Inspection> {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/inspections/${id}`, {
    //   headers: this.getHeaders(),
    // });
    // return response.json();

    await mockDelay(800);
    throw new Error('Not implemented with dummy data');
  }

  async updateInspectionStatus(id: string, status: string): Promise<Inspection> {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/inspections/${id}/status`, {
    //   method: 'PATCH',
    //   headers: this.getHeaders(),
    //   body: JSON.stringify({ status }),
    // });
    // return response.json();

    await mockDelay(600);
    throw new Error('Not implemented with dummy data');
  }

  // ==================== DOCUMENTS ====================

  async updateDocumentStatus(
    inspectionId: string, 
    documentId: string, 
    status: string, 
    remarks?: string
  ): Promise<Document> {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/inspections/${inspectionId}/documents/${documentId}`, {
    //   method: 'PATCH',
    //   headers: this.getHeaders(),
    //   body: JSON.stringify({ status, remarks }),
    // });
    // return response.json();

    await mockDelay(600);
    throw new Error('Not implemented with dummy data');
  }

  async uploadDocument(inspectionId: string, file: FormData): Promise<Document> {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/inspections/${inspectionId}/documents`, {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${this.token}` },
    //   body: file,
    // });
    // return response.json();

    await mockDelay(2000);
    throw new Error('Not implemented with dummy data');
  }

  // ==================== EVIDENCE ====================

  async uploadEvidence(inspectionId: string, file: FormData): Promise<Evidence> {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/inspections/${inspectionId}/evidence`, {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${this.token}` },
    //   body: file,
    // });
    // return response.json();

    await mockDelay(3000);
    throw new Error('Not implemented with dummy data');
  }

  async deleteEvidence(inspectionId: string, evidenceId: string): Promise<void> {
    // TODO: Replace with actual API call
    // await fetch(`${API_BASE_URL}/inspections/${inspectionId}/evidence/${evidenceId}`, {
    //   method: 'DELETE',
    //   headers: this.getHeaders(),
    // });

    await mockDelay(500);
  }

  // ==================== FINAL REPORT ====================

  async submitFinalReport(inspectionId: string, report: Partial<FinalReport>): Promise<FinalReport> {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/inspections/${inspectionId}/report`, {
    //   method: 'POST',
    //   headers: this.getHeaders(),
    //   body: JSON.stringify(report),
    // });
    // return response.json();

    await mockDelay(1500);
    throw new Error('Not implemented with dummy data');
  }

  // ==================== NOTIFICATIONS ====================

  async getNotifications(): Promise<Notification[]> {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/notifications`, {
    //   headers: this.getHeaders(),
    // });
    // return response.json();

    await mockDelay(800);
    return [];
  }

  async markNotificationAsRead(id: string): Promise<void> {
    // TODO: Replace with actual API call
    // await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    //   method: 'POST',
    //   headers: this.getHeaders(),
    // });

    await mockDelay(300);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    // TODO: Replace with actual API call
    // await fetch(`${API_BASE_URL}/notifications/read-all`, {
    //   method: 'POST',
    //   headers: this.getHeaders(),
    // });

    await mockDelay(500);
  }

  // ==================== SYNC ====================

  async syncData(lastSyncTime?: string): Promise<{
    inspections: Inspection[];
    notifications: Notification[];
    serverTime: string;
  }> {
    // TODO: Replace with actual API call
    // const response = await fetch(`${API_BASE_URL}/sync`, {
    //   method: 'POST',
    //   headers: this.getHeaders(),
    //   body: JSON.stringify({ last_sync_time: lastSyncTime }),
    // });
    // return response.json();

    await mockDelay(2000);
    return {
      inspections: [],
      notifications: [],
      serverTime: new Date().toISOString(),
    };
  }
}

export const apiService = new ApiService();
export default apiService;
