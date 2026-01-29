import { StoreSeerrData, type SeerrAuthData } from "./store/store-seerr-data";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { isTauri } from "@tauri-apps/api/core";

function normalizeServerUrl(url: string): string {
  let baseUrl = url.replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(baseUrl)) {
    baseUrl = `https://${baseUrl}`;
  }
  return baseUrl;
}

function configureProxy(
  baseUrl: string,
  headers: Record<string, string>,
): string {
  if (!isTauri()) {
    console.debug("Using Proxy for Seerr API");
    headers["X-Proxy-Target"] = baseUrl;
    return import.meta.env.VITE_PROXY_URL || "http://localhost:3001";
  }
  return baseUrl;
}

function buildRequestConfig(data: SeerrAuthData): {
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  body?: Record<string, any>;
  error?: string;
} {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json, text/plain, */*",
  };
  let endpoint = "";
  let method = "GET";
  let body: Record<string, any> | undefined;

  switch (data.authType) {
    case "api-key":
      if (!data.apiKey)
        return { endpoint, method, headers, error: "API Key is missing" };
      endpoint = "/api/v1/auth/me";
      headers["X-Api-Key"] = data.apiKey;
      break;

    case "local-user":
      if (!data.username || !data.password)
        return {
          endpoint,
          method,
          headers,
          error: "Username or Password missing",
        };
      endpoint = "/api/v1/auth/local";
      body = { email: data.username, password: data.password };
      method = "POST";
      break;

    case "jellyfin-user":
      if (!data.username || !data.password)
        return {
          endpoint,
          method,
          headers,
          error: "Jellyfin Credentials missing (Username/Password required)",
        };
      endpoint = "/api/v1/auth/jellyfin";
      body = { username: data.username, password: data.password };
      method = "POST";
      break;

    default:
      return {
        endpoint,
        method,
        headers,
        error: "Unknown Authentication Type",
      };
  }

  return { endpoint, method, headers, body };
}

export async function testSeerrConnection(
  config?: SeerrAuthData,
): Promise<{ success: boolean; message?: string }> {
  try {
    const data = config || (await StoreSeerrData.get());
    if (!data?.serverUrl) {
      return { success: false, message: "No Server URL configured" };
    }

    const { endpoint, method, headers, body, error } = buildRequestConfig(data);
    if (error) return { success: false, message: error };

    let baseUrl = normalizeServerUrl(data.serverUrl);
    baseUrl = configureProxy(baseUrl, headers);

    const fullUrl = `${baseUrl}${endpoint}`;
    console.debug(`[Seerr] Testing connection: ${method} ${fullUrl}`, {
      authType: data.authType,
      env: isTauri() ? "Tauri" : "Web",
    });

    const fetchFn = isTauri() ? tauriFetch : fetch;
    const response = await fetchFn(fullUrl, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.ok) {
      return {
        success: true,
        message: `Connection successful via ${data.authType.replace("-", " ")}`,
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        message: "Authentication failed: Invalid credentials",
      };
    }

    return {
      success: false,
      message: `Connection failed: ${response.status} ${response.statusText}`,
    };
  } catch (error) {
    console.error("Seerr Connection Error:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Network error or unreachable host",
    };
  }
}
