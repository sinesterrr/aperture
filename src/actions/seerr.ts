import { StoreSeerrData, type SeerrAuthData } from "./store/store-seerr-data";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import { isTauri } from "@tauri-apps/api/core";

export async function testSeerrConnection(
  config?: SeerrAuthData,
): Promise<{ success: boolean; message?: string }> {
  try {
    const data = config || (await StoreSeerrData.get());

    if (!data?.serverUrl) {
      return { success: false, message: "No Server URL configured" };
    }

    // Normalize URL: remove trailing slashes and ensure protocol
    let baseUrl = data.serverUrl.replace(/\/+$/, "");
    if (!/^https?:\/\//i.test(baseUrl)) {
      baseUrl = `https://${baseUrl}`;
    }

    let endpoint = "";
    let method = "GET";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
    };

    // In web development mode, use the standalone Hono proxy to bypass CORS
    // The proxy runs on port 3001 and expects the target URL in the header
    if (!isTauri()) {
      console.debug("Using Hono proxy for Seerr API");
      headers["X-Proxy-Target"] = baseUrl;
      baseUrl = import.meta.env.VITE_PROXY_URL || "http://localhost:3001";
    }
    let body: Record<string, any> | undefined;

    switch (data.authType) {
      case "api-key":
        if (!data.apiKey) {
          return { success: false, message: "API Key is missing" };
        }
        endpoint = "/api/v1/auth/me";
        headers["X-Api-Key"] = data.apiKey;
        method = "GET";
        break;

      case "local-user":
        if (!data.username || !data.password) {
          return { success: false, message: "Username or Password missing" };
        }
        endpoint = "/api/v1/auth/local";
        body = {
          email: data.username,
          password: data.password,
        };
        method = "POST";
        break;

      case "jellyfin-user":
        if (!data.username || !data.password) {
          return {
            success: false,
            message:
              "Jellyfin Credentials missing (Username/Password required for initial link)",
          };
        }
        endpoint = "/api/v1/auth/jellyfin";
        body = {
          username: data.username,
          password: data.password,
        };
        method = "POST";
        break;

      default:
        return { success: false, message: "Unknown Authentication Type" };
    }

    const fullUrl = `${baseUrl}${endpoint}`;
    console.debug(`[Seerr] Testing connection: ${method} ${fullUrl}`, {
      authType: data.authType,
      env: isTauri() ? "Tauri" : "Web",
    });

    const fetchFn = isTauri() ? tauriFetch : fetch;

    const response = await fetchFn(fullUrl, {
      method,
      headers,
      // @ts-ignore
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
