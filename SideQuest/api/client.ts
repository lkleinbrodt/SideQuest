import { ApiResponse, create } from "apisauce";

import { getApiConfig } from "./config";
import { getToken } from "@/auth/storage";
import humps from "humps";

// Define the structured error format from the backend
export interface ApiError {
  message: string;
  code: string;
}

// Create the apisauce instance
const apiClient = create({
  baseURL: getApiConfig().baseURL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add a request transform to include the auth token
apiClient.addAsyncRequestTransform(async (request) => {
  const token = await getToken();
  if (token && request.headers) {
    request.headers["Authorization"] = `Bearer ${token}`;
  }
  // Convert all outgoing request data keys to snake_case for the backend
  if (request.data) {
    request.data = humps.decamelizeKeys(request.data);
  }
  // Convert outgoing params to snake_case
  if (request.params) {
    request.params = humps.decamelizeKeys(request.params);
  }
});

// Add a response transform to handle the standardized API wrapper
apiClient.addResponseTransform((response: ApiResponse<any>) => {
  // The backend now sends { data: ... } or { error: ... }.
  // If the request was successful, we directly return the content of `response.data.data`.
  // If it failed, we throw a structured error with the content of `response.data.error`.

  if (response.ok && response.data?.data) {
    // Camelize all incoming response data keys
    response.data = humps.camelizeKeys(response.data.data);
  } else {
    // Centralize error handling.
    // If there's a structured error from our API, use that.
    const apiError: ApiError = response.data?.error || {
      message: response.problem || "An unknown error occurred.",
      code: "UNKNOWN_ERROR",
    };
    // By setting response.ok to false and populating response.data with the error,
    // apisauce will treat this as a failure, which we can catch in our services.
    response.ok = false;
    response.data = apiError;
  }
});

// Create a new generic client that throws errors
const client = {
  get: async <T>(url: string, params?: object) => {
    const response = await apiClient.get<T>(url, params);
    if (!response.ok) throw response.data as ApiError;
    return response.data as T;
  },
  post: async <T>(url: string, data?: object) => {
    const response = await apiClient.post<T>(url, data);
    if (!response.ok) throw response.data as ApiError;
    return response.data as T;
  },
  put: async <T>(url: string, data?: object) => {
    const response = await apiClient.put<T>(url, data);
    if (!response.ok) throw response.data as ApiError;
    return response.data as T;
  },
  delete: async <T>(url: string, params?: object) => {
    const response = await apiClient.delete<T>(url, params);
    if (!response.ok) throw response.data as ApiError;
    return response.data as T;
  },
};

export default client;
