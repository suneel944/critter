import { request, APIRequestContext, APIResponse } from '@playwright/test';
import ConfigManager from '../ConfigManager';

/**
 * ApiClient wraps Playwright's APIRequestContext to make HTTP calls easier.
 *
 * According to Playwright's documentation, an APIRequestContext is responsible
 * for sending HTTP(S) requests, and each context has its own isolated cookie
 * storage.  The `ApiClient` creates a new context
 * per request by default, ensuring that tests remain independent and do not
 * share session state.  Clients can override this behaviour by passing an
 * existing context.
 */
export default class ApiClient {
  private baseUrl: string;

  constructor() {
    const config = ConfigManager.getInstance().getAll();
    this.baseUrl = config.apiUrl;
    if (!this.baseUrl) {
      throw new Error('apiUrl is undefined in environment configuration');
    }
  }

  /**
   * Build the full URL given a relative path.  If the path already contains
   * `http` then it is returned unchanged.
   */
  private buildUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }
    return `${this.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }

  /**
   * Performs a GET request.
   */
  public async get(path: string, options: { headers?: Record<string, string>; context?: APIRequestContext } = {}): Promise<APIResponse> {
    const url = this.buildUrl(path);
    const context = options.context || (await request.newContext());
    const response = await context.get(url, { headers: options.headers });
    return response;
  }

  /**
   * Performs a POST request.
   */
  public async post(path: string, options: { headers?: Record<string, string>; data?: any; context?: APIRequestContext } = {}): Promise<APIResponse> {
    const url = this.buildUrl(path);
    const context = options.context || (await request.newContext());
    const response = await context.post(url, { headers: options.headers, data: options.data });
    return response;
  }

  /**
   * Performs a PUT request.
   */
  public async put(path: string, options: { headers?: Record<string, string>; data?: any; context?: APIRequestContext } = {}): Promise<APIResponse> {
    const url = this.buildUrl(path);
    const context = options.context || (await request.newContext());
    const response = await context.put(url, { headers: options.headers, data: options.data });
    return response;
  }

  /**
   * Performs a DELETE request.
   */
  public async delete(path: string, options: { headers?: Record<string, string>; data?: any; context?: APIRequestContext } = {}): Promise<APIResponse> {
    const url = this.buildUrl(path);
    const context = options.context || (await request.newContext());
    const response = await context.delete(url, { headers: options.headers, data: options.data });
    return response;
  }
}