import { derived, writable } from 'svelte/store';

// src/ui/auth-store.ts
var DEFAULT_ENDPOINTS = {
  login: "/auth/login",
  register: "/auth/register",
  logout: "/auth/logout",
  session: "/auth/session",
  updateProfile: "/auth/profile"
};
var isBrowser = typeof window !== "undefined";
var mergeHeaders = (base, extra) => ({
  ...base,
  ...extra || {}
});
function createAuthStore(options = {}) {
  const {
    baseUrl = "",
    endpoints = {},
    publishableApiKey = null,
    fetcher = fetch,
    autoCheck = true
  } = options;
  const resolvedEndpoints = { ...DEFAULT_ENDPOINTS, ...endpoints };
  const { subscribe, set, update } = writable({
    user: null,
    session: null,
    isAuthenticated: false,
    loading: false,
    error: null
  });
  const buildHeaders = (extra) => {
    const base = publishableApiKey ? { "x-publishable-api-key": publishableApiKey } : {};
    return mergeHeaders(base, extra);
  };
  const applyAuthSuccess = (result) => {
    const user2 = result["customer"] || result["user"] || null;
    update((state) => ({
      ...state,
      user: user2,
      session: result["session"] || null,
      isAuthenticated: true,
      loading: false
    }));
    return { success: true, user: user2 };
  };
  const applyAuthFailure = (error) => {
    const message = typeof error === "string" ? error : error?.message || "Request failed";
    update((state) => ({ ...state, loading: false, error: message }));
    return { success: false, error: message };
  };
  const postAuth = async (path, payload) => {
    const response = await fetcher(`${baseUrl}${path}`, {
      method: "POST",
      headers: buildHeaders({ "Content-Type": "application/json" }),
      credentials: "include",
      body: payload ? JSON.stringify(payload) : null
    });
    try {
      return await response.json();
    } catch {
      return { success: response.ok };
    }
  };
  const api = {
    subscribe,
    async login(email, password) {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        const result = await postAuth(resolvedEndpoints.login, { email, password });
        if (result.twoFactorRequired) {
          update((state) => ({ ...state, loading: false }));
          return { success: true, mfaRequired: true };
        }
        if (!result.success) {
          return applyAuthFailure(result.error || "Login failed");
        }
        return applyAuthSuccess(result);
      } catch (error) {
        return applyAuthFailure(error?.message || "Login failed");
      }
    },
    async register(data) {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        let registrationData;
        if (typeof data === "object" && !data["name"]) {
          const { first_name, last_name, email, password, phone } = data;
          registrationData = { email, password, first_name, last_name, phone };
        } else if (typeof data === "object") {
          registrationData = data;
        } else {
          const email = arguments[0];
          const password = arguments[1];
          const name = arguments[2];
          registrationData = { email, password, name };
        }
        const result = await postAuth(resolvedEndpoints.register, registrationData);
        if (!result.success) {
          return applyAuthFailure(result.error || "Registration failed");
        }
        return applyAuthSuccess(result);
      } catch (error) {
        return applyAuthFailure(error?.message || "Registration failed");
      }
    },
    async logout() {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        const result = await postAuth(resolvedEndpoints.logout);
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          loading: false,
          error: null
        });
        return { success: result.success || true };
      } catch {
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          loading: false,
          error: null
        });
        return { success: true };
      }
    },
    async checkSession() {
      if (!isBrowser) return;
      update((state) => ({ ...state, loading: true }));
      try {
        const response = await fetcher(`${baseUrl}${resolvedEndpoints.session}`, {
          method: "GET",
          headers: buildHeaders(),
          credentials: "include"
        });
        if (response.status === 204 || !response.ok) {
          update((state) => ({ ...state, loading: false }));
          return;
        }
        const result = await response.json();
        if (result["success"] && result["user"]) {
          update((state) => ({
            ...state,
            user: result["user"],
            session: result["session"] || null,
            isAuthenticated: true,
            loading: false
          }));
        } else {
          update((state) => ({ ...state, loading: false }));
        }
      } catch {
        update((state) => ({ ...state, loading: false }));
      }
    },
    async updateProfile(data) {
      update((state) => ({ ...state, loading: true, error: null }));
      try {
        const response = await fetcher(`${baseUrl}${resolvedEndpoints.updateProfile}`, {
          method: "POST",
          headers: buildHeaders({ "Content-Type": "application/json" }),
          credentials: "include",
          body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!result["success"]) {
          update((state) => ({
            ...state,
            loading: false,
            error: result["error"] || "Profile update failed"
          }));
          return { success: false, error: result["error"] || "Profile update failed" };
        }
        update((state) => ({
          ...state,
          user: { ...state["user"] ?? {}, ...result["user"] },
          loading: false
        }));
        return { success: true, user: result["user"] };
      } catch (error) {
        const message = error?.message || "Profile update failed";
        update((state) => ({ ...state, loading: false, error: message }));
        return { success: false, error: message };
      }
    },
    async refreshSession() {
      return this.checkSession();
    }
  };
  if (isBrowser && autoCheck) {
    api.checkSession();
  }
  return api;
}
var auth = createAuthStore();
var isAuthenticated = derived(auth, ($auth) => $auth.isAuthenticated);
var user = derived(auth, ($auth) => $auth.user);

export { auth, createAuthStore, isAuthenticated, user };
