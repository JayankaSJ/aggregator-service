import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";

const API_TIMEOUT = 5000; // 5 seconds timeout

interface ErrorResponse {
  message: string;
  details?: any;
}

export class ApiClient {
  protected axiosInstance: AxiosInstance;

  constructor(
    baseURL: string,
    private defaultHeaders: Record<string, string> = {}
  ) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        ...defaultHeaders,
      },
    });
  }

  private mergeHeaders(
    additionalHeaders?: Record<string, string>
  ): Record<string, string> {
    return {
      ...this.defaultHeaders,
      ...(additionalHeaders || {}),
    };
  }

  // GET request
  async get<T>(
    url: string,
    params?: Record<string, any>,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.get<T>(url, {
        params,
        headers: this.mergeHeaders(additionalHeaders),
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // POST request
  async post<T>(
    url: string,
    data: Record<string, any>,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.post<T>(
        url,
        data,
        {
          headers: this.mergeHeaders(additionalHeaders),
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // PUT request
  async put<T>(
    url: string,
    data: Record<string, any>,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.put<T>(
        url,
        data,
        {
          headers: this.mergeHeaders(additionalHeaders), // Merge default and additional headers
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // DELETE request
  async delete<T>(
    url: string,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.delete<T>(
        url,
        {
          headers: this.mergeHeaders(additionalHeaders), // Merge default and additional headers
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  protected handleError(error: unknown): ErrorResponse {
    const axiosError = error as AxiosError;
    if (axiosError.response) {
      return this.handleResponseError(axiosError.response);
    } else if (axiosError.request) {
      return { message: "Network Error: Unable to reach the server" };
    } else {
      return { message: axiosError.message };
    }
  }

  private handleResponseError(response: AxiosResponse): ErrorResponse {
    const { status, data } = response;
    switch (status) {
      case 400:
        return { message: "Bad Request", details: data };
      case 401:
        return { message: "Unauthorized", details: data };
      case 403:
        return { message: "Forbidden", details: data };
      case 404:
        return { message: "Not Found", details: data };
      case 500:
        return { message: "Internal Server Error", details: data };
      default:
        return { message: `Unexpected error: ${status}`, details: data };
    }
  }
}

// Example of inheriting and adding custom headers
export class GraphQlClient extends ApiClient {
  constructor(baseURL: string) {
    super(baseURL, { Authorization: "Bearer your-auth-token" }); // Set default headers
  }

  // You can override methods or use inherited methods and pass additional headers
  async query<T>(
    url: string,
    query: string,
    variables?: Record<string, any>,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    const data = {
      query,
      variables,
    };

    return this.post<T>(url, data, additionalHeaders); // POST request using GraphQL query
  }
}
