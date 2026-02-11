import secureLocalStorage from "react-secure-storage";

interface LoginPreferences {
  username?: string;
  serverUrl?: string;
}

export class StoreLoginPreferences {
  private static KEY = "login-preferences";

  static async set(value: LoginPreferences) {
    secureLocalStorage.setItem(this.KEY, JSON.stringify(value));
  }

  static async get(): Promise<LoginPreferences | null> {
    const raw = secureLocalStorage.getItem(this.KEY);
    if (!raw || typeof raw !== "string") return null;
    try {
      return JSON.parse(raw) as LoginPreferences;
    } catch {
      return null;
    }
  }

  static async remove() {
    secureLocalStorage.removeItem(this.KEY);
  }
}
