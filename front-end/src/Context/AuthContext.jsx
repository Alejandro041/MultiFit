import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { loginWithSupabase, signUpWithSupabase, refreshSupabaseToken, updateSupabasePassword } from "../services/authService";


import { setAuthToken, get, post, put, del } from "../services/apiClient";

const STORAGE_KEY = "multifit.session";

const loadStoredSession = () => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const parseRoleFromNotes = (notes) => {
  if (!notes) return "Miembro";
  try {
    const parsed = JSON.parse(notes);
    if (parsed && typeof parsed.appRole === "string") {
      return parsed.appRole;
    }
  } catch {
    // ignore parse errors
  }
  return notes;
};

const buildMemberList = (personas, miembros, gyms) => {
  return miembros.map((member) => {
    const persona = personas.find((p) => p.id === member.persona_id);
    const fullName = persona ? `${persona.first_name ?? ""} ${persona.last_name ?? ""}`.trim() : "Sin nombre";
    const gym = gyms.find((g) => g.id === (persona?.gym_id ?? null));

    return {
      id: member.id,
      personaId: member.persona_id,
      name: fullName || persona?.email || "Miembro",
      email: persona?.email ?? "",
      phone: persona?.phone ?? "",
      address: persona?.address ?? "",
      role: parseRoleFromNotes(member.notes) ?? "Miembro",
      status: member.membership_status ?? "active",
      sucursalId: persona?.gym_id ?? null,
      sucursalName: gym?.name ?? "Sin sucursal",
      joinDate: member.join_date ?? null
    };
  });
};

const AuthContext = createContext(undefined);

const computeExpiry = (expiresInSeconds) => {
  const seconds = typeof expiresInSeconds === "number" ? expiresInSeconds : 3600;
  return Date.now() + seconds * 1000;
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => loadStoredSession());
  const [user, setUser] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [sucursales, setSucursales] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [miembros, setMiembros] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastCreatedAccount, setLastCreatedAccount] = useState(null);

  const clearSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuthToken(null);
    setSession(null);
    setUser(null);
    setEmpresa(null);
    setSucursales([]);
    setMiembros([]);
    setRoles([]);
    setLastCreatedAccount(null);
  }, []);

  const persistSession = useCallback((data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSession(data);
    setAuthToken(data.accessToken);
  }, []);

  const ensureFreshSession = useCallback(async (current) => {
    if (!current?.accessToken) return null;
    if (!current.expiresAt || current.expiresAt - Date.now() > 60000) {
      setAuthToken(current.accessToken);
      return current;
    }

    const refreshed = await refreshSupabaseToken(current.refreshToken);
    const nextSession = {
      accessToken: refreshed.access_token,
      refreshToken: refreshed.refresh_token ?? current.refreshToken,
      expiresAt: computeExpiry(refreshed.expires_in),
      user: refreshed.user ?? current.user
    };
    persistSession(nextSession);
    return nextSession;
  }, [persistSession]);

  const bootstrapProfile = useCallback(async () => {
    try {
      const response = await post("/api/bootstrap", {});
      return response?.data ?? null;
    } catch (err) {
      console.error("[AuthContext] Bootstrap profile failed", err);
      setError((current) => current ?? err);
      return null;
    }
  }, []);

  const hydrateContext = useCallback(async (activeSession) => {
    if (!activeSession?.accessToken || !activeSession.user) {
      setIsLoading(false);
      return;
    }

    setAuthToken(activeSession.accessToken);
    setIsLoading(true);
    setError(null);

    try {
      await bootstrapProfile();

      const userId = activeSession.user.id;

      const requestData = async (requestFn, { fallback = null, requiredMessage = null } = {}) => {
        try {
          const response = await requestFn();
          return response?.data ?? fallback;
        } catch (requestError) {
          const apiMessage = requestError?.response?.data?.message;
          const message = apiMessage || requestError.message || "No se pudo completar la solicitud";
          console.error("[AuthContext] Request failed", { message });
          if (requiredMessage) {
            throw new Error(requiredMessage);
          }
          setError((current) => current ?? new Error(message));
          return fallback;
        }
      };

      const userRow = await requestData(() => get(`/api/usuarios/${userId}`), {
        fallback: {
          id: userId,
          email: activeSession.user.email,
          persona_id: null
        }
      });

      const [rolesList, userOrgList, orgList, gymsList, personasList, miembrosList] = await Promise.all([
        requestData(() => get("/api/roles"), { fallback: [] }),
        requestData(() => get("/api/usuario-organizations"), { fallback: [] }),
        requestData(() => get("/api/organizations"), { fallback: [] }),
        requestData(() => get("/api/gyms"), { fallback: [] }),
        requestData(() => get("/api/personas"), { fallback: [] }),
        requestData(() => get("/api/miembros"), { fallback: [] })
      ]);

      setRoles(Array.isArray(rolesList) ? rolesList : []);

      let personaRow = null;
      if (userRow?.persona_id) {
        personaRow = await requestData(() => get(`/api/personas/${userRow.persona_id}`), { fallback: null });
      }

      const organizations = Array.isArray(orgList) ? orgList : [];
      const userOrganizations = (Array.isArray(userOrgList) ? userOrgList : []).filter(
        (relation) => relation.user_id === userId && relation.is_active !== false
      );
      const primaryOrgId = userOrganizations[0]?.organization_id ?? organizations[0]?.id ?? null;
      const activeOrg = organizations.find((org) => org.id === primaryOrgId) ?? null;

      setEmpresa(activeOrg);

      const gyms = (Array.isArray(gymsList) ? gymsList : []).filter((gym) => !activeOrg || gym.organization_id === activeOrg.id);
      setSucursales(gyms);

      const personasData = Array.isArray(personasList) ? personasList : [];
      const miembrosData = Array.isArray(miembrosList) ? miembrosList : [];
      setPersonas(personasData);
      setMiembros(buildMemberList(personasData, miembrosData, gyms));

      const roleId = userOrganizations[0]?.rol_id ?? null;
      const roleName = roleId
        ? (Array.isArray(rolesList) ? rolesList : []).find((role) => role.id === roleId)?.name ?? "Usuario"
        : "Usuario";

      setUser({
        id: userRow?.id ?? userId,
        email: userRow?.email ?? activeSession.user.email,
        name: personaRow
          ? `${personaRow.first_name ?? ""} ${personaRow.last_name ?? ""}`.trim() || personaRow.email
          : activeSession.user.email,
        role: roleName
      });
    } catch (err) {
      console.error("Failed to hydrate context", err);
      setError(err);
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, [clearSession, bootstrapProfile]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!session) {
        setIsLoading(false);
        return;
      }

      try {
        const freshSession = await ensureFreshSession(session);
        if (!freshSession) {
          clearSession();
          setIsLoading(false);
          return;
        }
        await hydrateContext(freshSession);
      } catch (err) {
        console.error("Session bootstrap failed", err);
        clearSession();
        setIsLoading(false);
      }
    };

    bootstrap();
  }, [session, ensureFreshSession, hydrateContext, clearSession]);

  const login = useCallback(
    async (email, password) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await loginWithSupabase(email, password);
        const sessionData = {
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          expiresAt: computeExpiry(response.expires_in),
          user: response.user
        };
        persistSession(sessionData);
        await hydrateContext(sessionData);
      } catch (err) {
        setIsLoading(false);
        setError(err);
        throw err;
      }
    },
    [persistSession, hydrateContext]
  );

  const register = useCallback(
    async (email, password, name) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await signUpWithSupabase(email, password, { full_name: name });

        if (response?.access_token) {
          const sessionData = {
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            expiresAt: computeExpiry(response.expires_in),
            user: response.user
          };
          persistSession(sessionData);
          await hydrateContext(sessionData);
          return;
        }

        const registeredUserId = response?.user?.id;

        if (!registeredUserId) {
          throw new Error("No se pudo confirmar el usuario recien creado");
        }

        await post("/auth/confirm-signup", { userId: registeredUserId });

        const loginSession = await loginWithSupabase(email, password);
        const sessionData = {
          accessToken: loginSession.access_token,
          refreshToken: loginSession.refresh_token,
          expiresAt: computeExpiry(loginSession.expires_in),
          user: loginSession.user
        };
        persistSession(sessionData);
        await hydrateContext(sessionData);
      } catch (err) {
        setIsLoading(false);
        setError(err);
        throw err;
      }
    },
    [persistSession, hydrateContext]
  );

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const createEmpresa = useCallback(
    async (name) => {
      if (!name.trim()) throw new Error("Nombre requerido");
      if (!session?.accessToken) throw new Error("Sesion no valida");

      const { data: organization } = await post("/api/organizations", {
        name,
        status: "active"
      });

      const rolesList = roles.length ? roles : (await get("/api/roles")).data ?? [];
      const superAdminRole = rolesList.find((role) => role.name?.toLowerCase() === "superadmin");

      if (superAdminRole && user) {
        await post("/api/usuario-organizations", {
          user_id: user.id,
          organization_id: organization.id,
          rol_id: superAdminRole.id,
          is_active: true
        });
      }

      await hydrateContext(session);
      return organization;
    },
    [hydrateContext, roles, session, user]
  );

  const createSucursal = useCallback(
    async (payload) => {
      if (!empresa) throw new Error("Primero crea una organizacion");

      const { name, code, address, phone } = payload;
      const { data: gym } = await post("/api/gyms", {
        organization_id: empresa.id,
        name,
        code,
        address,
        phone
      });

      await hydrateContext(session);
      return gym;
    },
    [empresa, hydrateContext, session]
  );

  const generateAutoDocumentNumber = () => {
    try {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return `DOC-${crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
      }
    } catch {
      // ignore
    }
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `DOC-${Date.now().toString(36).toUpperCase()}${randomPart}`;
  };

  const createMiembro = useCallback(
    async (payload) => {
      if (!empresa) {
        throw new Error("Primero crea una organizacion");
      }

      const {
        documentNumber,
        name,
        email,
        phone,
        address,
        role: memberRole,
        sucursalId
      } = payload;

      if (!email) {
        throw new Error("Email requerido para generar credenciales");
      }

      const trimmedName = name?.trim() ?? "";
      const [firstName, ...rest] = trimmedName.split(/\s+/);
      const lastName = rest.join(" ") || "SinApellido";

      const resolvedDocumentNumber = (documentNumber ?? "").trim() || generateAutoDocumentNumber();
      const normalizedDocumentNumber = resolvedDocumentNumber.toLowerCase();

      const personaPayload = {
        document_number: resolvedDocumentNumber,
        first_name: firstName || "SinNombre",
        last_name: lastName,
        email,
        phone,
        address,
        gym_id: sucursalId || null
      };

      const findPersonaByDocument = (list) =>
        Array.isArray(list)
          ? list.find(
              (item) => (item?.document_number ?? "").toLowerCase() === normalizedDocumentNumber
            )
          : null;

      const computePersonaUpdates = (current) => {
        if (!current) return {};
        const updates = {};
        ([
          ["document_number", personaPayload.document_number],
          ["first_name", personaPayload.first_name],
          ["last_name", personaPayload.last_name],
          ["email", personaPayload.email],
          ["phone", personaPayload.phone],
          ["address", personaPayload.address],
          ["gym_id", personaPayload.gym_id]
        ]).forEach(([key, value]) => {
          if ((current?.[key] ?? null) !== value) {
            updates[key] = value;
          }
        });
        return updates;
      };

      let persona = findPersonaByDocument(personas);
      let personaWasCreated = false;
      let personaWasUpdated = false;

      let miembroCreado = null;
      let miembroWasCreated = false;

      try {
        if (persona) {
          const updates = computePersonaUpdates(persona);
          if (Object.keys(updates).length > 0) {
            const personaUpdateResponse = await put(`/api/personas/${persona.id}`, updates);
            persona = personaUpdateResponse.data;
            personaWasUpdated = true;
          }
        } else {
          try {
            const personaResponse = await post("/api/personas", personaPayload);
            persona = personaResponse.data;
            personaWasCreated = true;
          } catch (error) {
            const message = error?.response?.data?.message || error.message || "";
            const isDuplicateDocument =
              message.includes("persona_document_number_key") ||
              message.toLowerCase().includes("duplicate key");

            if (!isDuplicateDocument) {
              throw error;
            }

            const personaListResponse = await get("/api/personas");
            const fallbackPersona = findPersonaByDocument(personaListResponse?.data);

            if (!fallbackPersona) {
              throw error;
            }

            const updates = computePersonaUpdates(fallbackPersona);
            if (Object.keys(updates).length > 0) {
              const personaUpdateResponse = await put(`/api/personas/${fallbackPersona.id}`, updates);
              persona = personaUpdateResponse.data;
              personaWasUpdated = true;
            } else {
              persona = fallbackPersona;
            }
          }
        }

        if (!persona) {
          throw new Error("No se pudo resolver la persona");
        }

        setPersonas((current) => {
          const exists = current.some((item) => item.id === persona.id);
          if (personaWasCreated) {
            return [...current, persona];
          }
          if (personaWasUpdated) {
            return exists
              ? current.map((item) => (item.id === persona.id ? persona : item))
              : [...current, persona];
          }
          return exists ? current : [...current, persona];
        });

        const existingMember = miembros.find((member) => member.personaId === persona.id);

        if (existingMember) {
          miembroCreado = existingMember;
        } else {
          const miembroResponse = await post("/api/miembros", {
            persona_id: persona.id,
            membership_status: "active",
            notes: JSON.stringify({ appRole: memberRole || "Miembro" })
          });

          miembroCreado = miembroResponse.data;
          miembroWasCreated = true;
        }

        const accountResponse = await post("/api/member-accounts", {
          personaId: persona.id,
          email,
          organizationId: empresa.id,
          roleSlug: (memberRole || "Miembro").toLowerCase(),
          metadata: {
            fullName: trimmedName,
            displayRole: memberRole || "Miembro",
            sucursalId
          }
        });

        const accountData = accountResponse.data ?? null;

        setLastCreatedAccount({
          persona,
          miembro: miembroCreado,
          account: accountData,
          metadata: {
            fullName: trimmedName,
            role: memberRole || "Miembro",
            email,
            sucursalId
          },
          timestamp: Date.now()
        });

        await hydrateContext(session);

        return {
          persona,
          miembro: miembroCreado,
          account: accountData
        };
      } catch (error) {
        if (miembroWasCreated && miembroCreado?.id) {
          try {
            await del(`/api/miembros/${miembroCreado.id}`);
          } catch {
            // ignorar limpieza fallida
          }
        }

        if (personaWasCreated && persona?.id) {
          try {
            await del(`/api/personas/${persona.id}`);
          } catch {
            // ignorar limpieza fallida
          }
        }

        setLastCreatedAccount(null);
        throw error;
      }
    },
    [empresa, hydrateContext, session, personas, miembros]
  );

  const refreshContext = useCallback(async () => {

    if (!session) return;

    await hydrateContext(session);

  }, [session, hydrateContext]);


  const updatePassword = useCallback(
    async (newPassword) => {
      if (!newPassword || newPassword.length < 8) {
        throw new Error("La nueva contrasena debe tener al menos 8 caracteres");
      }

      try {
        await updateSupabasePassword(newPassword);
      } catch (err) {
        setError((current) => current ?? err);
        throw err;
      }
    },
    []
  );

  const tenantOverview = useMemo(() => {
    if (sucursales.length === 0 && miembros.length === 0) {
      return { gyms: [], trainers: [] };
    }

    const groupedByGym = miembros.reduce((acc, member) => {
      const key = member.sucursalId ?? "sin-sucursal";
      if (!acc[key]) {
        acc[key] = { members: [], trainers: [] };
      }
      if (member.role === "Entrenador") {
        acc[key].trainers.push(member);
      } else {
        acc[key].members.push(member);
      }
      return acc;
    }, {});

    const gymsSummaries = sucursales.map((gym) => {
      const bucket = groupedByGym[gym.id] ?? { members: [], trainers: [] };
      return {
        id: gym.id,
        name: gym.name,
        code: gym.code,
        memberCount: bucket.members.length,
        trainerCount: bucket.trainers.length,
        members: bucket.members,
        trainers: bucket.trainers
      };
    });

    if (groupedByGym["sin-sucursal"]) {
      gymsSummaries.push({
        id: "sin-sucursal",
        name: "Sin sucursal",
        code: "N/A",
        memberCount: groupedByGym["sin-sucursal"].members.length,
        trainerCount: groupedByGym["sin-sucursal"].trainers.length,
        members: groupedByGym["sin-sucursal"].members,
        trainers: groupedByGym["sin-sucursal"].trainers
      });
    }

    const trainerSummaries = miembros
      .filter((member) => member.role === "Entrenador")
      .map((trainer) => {
        const bucket = groupedByGym[trainer.sucursalId ?? "sin-sucursal"] ?? { members: [], trainers: [] };
        const gym = trainer.sucursalId
          ? sucursales.find((sucursal) => sucursal.id === trainer.sucursalId) ?? null
          : null;

        return {
          id: trainer.id,
          name: trainer.name,
          email: trainer.email,
          phone: trainer.phone,
          sucursalId: trainer.sucursalId,
          sucursalName: gym?.name ?? "Sin sucursal",
          memberCount: bucket.members.length,
          members: bucket.members
        };
      });

    return { gyms: gymsSummaries, trainers: trainerSummaries };
  }, [sucursales, miembros]);


  const clearLastCreatedAccount = useCallback(() => {
    setLastCreatedAccount(null);
  }, []);

  const value = {

    user,

    empresa,

    sucursales,

    miembros,

    tenantOverview,

    isLoading,

    error,

    login,

    register,

    logout,

    createEmpresa,

    createSucursal,

    createMiembro,

    updatePassword,

    refreshContext,

    lastCreatedAccount,

    clearLastCreatedAccount

  };



  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};








