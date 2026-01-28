import { StoreSeerrData, type SeerrAuthData } from "./store/store-seerr-data";

export async function testSeerrConnection(
  config?: SeerrAuthData,
): Promise<{ success: boolean; message?: string }> {
  try {
    const data = config || (await StoreSeerrData.get());

    if (!data?.serverUrl) {
      return { success: false, message: "No Server URL configured" };
    }

    const baseUrl = data.serverUrl.replace(/\/$/, "");
    let endpoint = "";
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
    };
    let body: Record<string, any> | undefined;

    switch (data.authType) {
      case "api-key":
        if (!data.apiKey) {
          return { success: false, message: "API Key is missing" };
        }
        endpoint = "/api/v1/auth/me";
        headers["X-Api-Key"] = data.apiKey;
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
        break;

      default:
        return { success: false, message: "Unknown Authentication Type" };
    }

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: body ? "POST" : "GET",
      headers,
      credentials: "include", // Important for sessions
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
