import React, { createContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("dpms_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.data.user);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token) fetchMe();
    else setLoading(false);
    // eslint-disable-next-line
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      async loginDoctor(email, password) {
        const res = await api.post("/auth/login", { email, password });
        const t = res.data.data.token;
        if (t) {
          localStorage.setItem("dpms_token", t);
          setToken(t);
        }
        await fetchMe();
      },
      async loginPatient(patientId, password) {
        const res = await api.post("/auth/login-patient", { patientId, password });
        const t = res.data.data.token;
        if (t) {
          localStorage.setItem("dpms_token", t);
          setToken(t);
        }
        await fetchMe();
      },
      async registerDoctor(name, email, password) {
        const res = await api.post("/auth/register-doctor", { name, email, password });
        const t = res.data.data.token;
        if (t) {
          localStorage.setItem("dpms_token", t);
          setToken(t);
        }
        await fetchMe();
      },
      async logout() {
        try { await api.post("/auth/logout"); } catch {}
        localStorage.removeItem("dpms_token");
        setToken(null);
        setUser(null);
      },
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
