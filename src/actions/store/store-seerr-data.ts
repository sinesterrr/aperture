import secureLocalStorage from "react-secure-storage";

export type SeerrAuthType = "api-key" | "jellyfin-user" | "local-user";

export interface SeerrAuthData {
  serverUrl: string;
  authType: SeerrAuthType;
  apiKey?: string;
  username?: string;
  password?: string;
}

export class StoreSeerrData {
  private static SEERR_DATA_KEY = "seerr-config";

  static async set(value: SeerrAuthData) {
    secureLocalStorage.setItem(this.SEERR_DATA_KEY, value);
  }

  static async get(): Promise<SeerrAuthData | null> {
    const val = secureLocalStorage.getItem(this.SEERR_DATA_KEY);
    if (!val) return null;

    try {
      const parsed = typeof val === "string" ? JSON.parse(val) : val;
      return parsed as SeerrAuthData;
    } catch {
      return null;
    }
  }

  static async remove() {
    secureLocalStorage.removeItem(this.SEERR_DATA_KEY);
  }
}
