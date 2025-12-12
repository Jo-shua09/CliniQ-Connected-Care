const API_BASE_URL = "https://cliniq2.pythonanywhere.com";

export interface User {
  username: string;
  first_name: string;
  surname: string;
  email: string;
  phone_number?: string;
  age: string;
  gender: string;
  subscription: "standard" | "premium";
}

export interface SignupData {
  username: string;
  first_name: string;
  surname: string;
  email: string;
  phone_number?: string;
  age: string;
  gender: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface SignupResponse {
  success: boolean;
}

export interface ApiError {
  message: string;
  status: number;
}

export interface ConnectionUser {
  username: string;
  email: string;
  id: number;
}

export interface PendingRequest {
  id: number;
  name: string;
  email: string;
  gender: string;
  contact: string;
  avatar: string;
  requestType: string;
  requestedData: string[];
}

export interface GetConnectionsResponse {
  monitored: ConnectionUser[];
  monitored_by: ConnectionUser[];
  pending_requests: PendingRequest[];
}

export interface CreateConnectionRequest {
  monitored: string;
  monitored_by: string;
}

export interface AcceptCancelConnectionRequest {
  id: number;
}

export interface SetPremiumRequest {
  email: string;
  value: string;
}

export interface IsPremiumRequest {
  email: string;
}

export interface ApiResponse {
  success: boolean;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "An error occurred" }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error occurred");
    }
  }

  async signup(data: SignupData): Promise<SignupResponse> {
    return this.request<SignupResponse>("/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<LoginResponse> {
    return this.request<LoginResponse>("/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getUserProfile(token: string): Promise<User> {
    return this.request<User>("/user_profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateUserProfile(token: string, data: Partial<User>): Promise<User> {
    return this.request<User>("/user_profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  async createConnection(token: string, data: CreateConnectionRequest): Promise<ApiResponse> {
    return this.request<ApiResponse>("/create_connection", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  async getConnections(token: string, username: string): Promise<GetConnectionsResponse> {
    return this.request<GetConnectionsResponse>("/get_connections", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username }),
    });
  }

  async acceptConnection(token: string, data: AcceptCancelConnectionRequest): Promise<ApiResponse> {
    return this.request<ApiResponse>("/accept_connection", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  async cancelConnection(token: string, data: AcceptCancelConnectionRequest): Promise<ApiResponse> {
    return this.request<ApiResponse>("/cancel_connection", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
  }

  async setPremium(data: SetPremiumRequest): Promise<ApiResponse> {
    return this.request<ApiResponse>("/set_premium", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async isPremium(data: IsPremiumRequest): Promise<ApiResponse> {
    return this.request<ApiResponse>("/is_premium", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

export const setAuthToken = (token: string) => {
  localStorage.setItem("auth_token", token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const removeAuthToken = () => {
  localStorage.removeItem("auth_token");
};
