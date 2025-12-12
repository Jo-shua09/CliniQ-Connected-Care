const API_BASE_URL = "http://cliniq2.pythonanywhere.com";

export interface User {
  username: string;
  first_name: string;
  surname: string;
  email: string;
  phone_number?: string;
  age: string;
  gender: string;
  subscription: "standard" | "premium";
  diet_summary?: string;
  mental_health_summary?: string;
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

export interface SimpleLoginResponse {
  success: boolean;
  message?: string;
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

// FIXED: Changed from email to username
export interface SetPremiumRequest {
  username: string;
  value: string; // According to spec, should be "true" or "false"
}

export interface IsPremiumRequest {
  username: string;
}

export interface SetDeviceIdRequest {
  username: string;
  device_id: string;
}

export interface HasDeviceRequest {
  username: string;
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
    const params = new URLSearchParams(data as any);
    return this.request<SignupResponse>(`/signup?${params.toString()}`, {
      method: "GET",
    });
  }

  async login(data: LoginData): Promise<LoginResponse> {
    const params = new URLSearchParams(data as any);

    const loginResult = await this.request<SimpleLoginResponse>(`/login?${params.toString()}`, {
      method: "GET",
    });

    if (!loginResult.success) {
      throw new Error(loginResult.message || "Invalid username or password");
    }

    // After successful login, fetch user profile to get complete data
    try {
      const userProfile = await this.getUserProfile(data.username);
      const token = `user_${data.username}_${Date.now()}`;

      // Store the user data in localStorage
      localStorage.setItem("cliniq_user", JSON.stringify(userProfile));
      setAuthToken(token);

      return {
        user: userProfile,
        token: token,
      };
    } catch (error) {
      // If profile fetch fails, create minimal user
      const minimalUser: User = {
        username: data.username,
        first_name: data.username,
        surname: "",
        email: "",
        age: "0",
        gender: "unknown",
        subscription: "standard",
      };

      const token = `user_${data.username}_${Date.now()}`;
      localStorage.setItem("cliniq_user", JSON.stringify(minimalUser));
      setAuthToken(token);

      return {
        user: minimalUser,
        token: token,
      };
    }
  }

  async getUserProfile(username: string): Promise<User> {
    const params = new URLSearchParams({ username });
    return this.request<User>(`/user_profile?${params.toString()}`, {
      method: "GET",
    });
  }

  async updateUserProfile(data: Partial<User>): Promise<User> {
    const params = new URLSearchParams(data as any);
    return this.request<User>(`/update_user_profile?${params.toString()}`, {
      method: "GET",
    });
  }

  async createConnection(data: CreateConnectionRequest): Promise<ApiResponse> {
    const params = new URLSearchParams(data as any);
    return this.request<ApiResponse>(`/create_connection?${params.toString()}`, {
      method: "GET",
    });
  }

  async getConnections(username: string): Promise<GetConnectionsResponse> {
    const params = new URLSearchParams({ username });
    return this.request<GetConnectionsResponse>(`/get_connections?${params.toString()}`, {
      method: "GET",
    });
  }

  async acceptConnection(data: AcceptCancelConnectionRequest): Promise<ApiResponse> {
    const params = new URLSearchParams(data as any);
    return this.request<ApiResponse>(`/accept_connection?${params.toString()}`, {
      method: "GET",
    });
  }

  async cancelConnection(data: AcceptCancelConnectionRequest): Promise<ApiResponse> {
    const params = new URLSearchParams(data as any);
    return this.request<ApiResponse>(`/cancel_connection?${params.toString()}`, {
      method: "GET",
    });
  }

  async setDeviceId(data: SetDeviceIdRequest): Promise<ApiResponse> {
    const params = new URLSearchParams(data as any);
    return this.request<ApiResponse>(`/set_device_id?${params.toString()}`, {
      method: "GET",
    });
  }

  async hasDevice(data: HasDeviceRequest): Promise<ApiResponse> {
    const params = new URLSearchParams(data as any);
    return this.request<ApiResponse>(`/has_device?${params.toString()}`, {
      method: "GET",
    });
  }

  async setPremium(data: SetPremiumRequest): Promise<ApiResponse> {
    const params = new URLSearchParams(data as any);
    return this.request<ApiResponse>(`/set_premium?${params.toString()}`, {
      method: "GET",
    });
  }

  async isPremium(data: IsPremiumRequest): Promise<ApiResponse> {
    const params = new URLSearchParams(data as any);
    return this.request<ApiResponse>(`/is_premium?${params.toString()}`, {
      method: "GET",
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
