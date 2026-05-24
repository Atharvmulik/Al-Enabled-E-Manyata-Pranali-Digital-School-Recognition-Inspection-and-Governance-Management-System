import { getAuthData } from '@/lib/authStorage';

export const API_BASE_URL = "https://dinner-prescribed-integrated-liked.trycloudflare.com";

class ApiClient {
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async getHeaders(isFormData = false): Promise<Record<string, string>> {
    const { token } = await getAuthData();

    const headers: Record<string, string> = {};

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async request(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      body?: any;
      params?: Record<string, any>;
      headers?: Record<string, string>;
    } = {}
  ) {
    const {
      method = 'GET',
      body,
      params,
      headers: customHeaders = {},
    } = options;

    const isFormData = body instanceof FormData;
    const url = this.buildUrl(endpoint, params);

    const headers = {
      ...(await this.getHeaders(isFormData)),
      ...customHeaders,
    };

    const response = await fetch(url, {
      method,
      headers,
      body: body
        ? isFormData
          ? body
          : JSON.stringify(body)
        : undefined,
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw {
        response: {
          status: response.status,
          data: responseData,
        },
      };
    }

    return { data: responseData };
  }

  async get(endpoint: string, options?: { params?: Record<string, any> }) {
    return this.request(endpoint, {
      method: 'GET',
      params: options?.params,
    });
  }

  async post(
    endpoint: string,
    data?: any,
    options?: { headers?: Record<string, string> }
  ) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
      headers: options?.headers,
    });
  }

  async put(
    endpoint: string,
    data?: any,
    options?: { headers?: Record<string, string> }
  ) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
      headers: options?.headers,
    });
  }

  async patch(
    endpoint: string,
    data?: any,
    options?: { headers?: Record<string, string> }
  ) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data,
      headers: options?.headers,
    });
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export default new ApiClient();