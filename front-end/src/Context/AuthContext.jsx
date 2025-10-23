import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { loginWithSupabase, signUpWithSupabase, refreshSupabaseToken, updateSupabasePassword } from "../services/authService";


import { setAuthToken, get, post, put, del } from "../services/apiClient";
import { getRolePermissions } from "../constants/accessControl";

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
      documentNumber: persona?.document_number ?? "",
      name: fullName || persona?.email || "Miembro",
      email: persona?.email ?? "",
      phone: persona?.phone ?? "",
      address: persona?.address ?? "",
      role: parseRoleFromNotes(member.notes) ?? "Miembro",
      notes: member.notes ?? null,
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
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [currentMember, setCurrentMember] = useState(null);
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
    setMembershipPlans([]);
    setPayments([]);
    setCurrentMember(null);
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

      const [
        rolesList,
        userOrgList,
        orgList,
        gymsList,
        personasList,
        miembrosList,
        pagosList,
        membershipTypesList
      ] = await Promise.all([
        requestData(() => get("/api/roles"), { fallback: [] }),
        requestData(() => get("/api/usuario-organizations"), { fallback: [] }),
        requestData(() => get("/api/organizations"), { fallback: [] }),
        requestData(() => get("/api/gyms"), { fallback: [] }),
        requestData(() => get("/api/personas"), { fallback: [] }),
        requestData(() => get("/api/miembros"), { fallback: [] }),
        requestData(() => get("/api/pagos"), { fallback: [] }),
        requestData(() => get("/api/tipos-membresia"), { fallback: [] })
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
      const primaryOrgId = userOrganizations[0]?.organization_id ?? null;
      const activeOrg =
        primaryOrgId ? organizations.find((org) => org.id === primaryOrgId) ?? null : null;

      setEmpresa(activeOrg);

      const gyms = activeOrg
        ? (Array.isArray(gymsList) ? gymsList : []).filter(
            (gym) => gym.organization_id === activeOrg.id
          )
        : [];

      const personasData = activeOrg ? (Array.isArray(personasList) ? personasList : []) : [];
      const miembrosData = activeOrg ? (Array.isArray(miembrosList) ? miembrosList : []) : [];
      setPersonas(personasData);

      const combinedMembers = activeOrg ? buildMemberList(personasData, miembrosData, gyms) : [];
      const membershipTypesAll = Array.isArray(membershipTypesList) ? membershipTypesList : [];
      const membershipTypes = activeOrg
        ? membershipTypesAll.filter((plan) => gyms.some((gym) => gym.id === plan.gym_id))
        : [];
      setMembershipPlans(membershipTypes);

      const memberMap = new Map(combinedMembers.map((member) => [member.id, member]));
      const membershipTypeMap = new Map(membershipTypes.map((plan) => [plan.id, plan]));
      const paymentsSource = Array.isArray(pagosList) ? pagosList : [];
      const paymentsData = activeOrg
        ? paymentsSource.filter((payment) => memberMap.has(payment.miembro_id))
        : [];

      const ownMember =
        personaRow && combinedMembers.length > 0
          ? combinedMembers.find((member) => member.personaId === personaRow.id) ?? null
          : null;

      const metadataRoleRaw =
        typeof activeSession.user?.user_metadata?.appRole === "string"
          ? activeSession.user.user_metadata.appRole.trim()
          : "";
      const metadataRoleFromCatalog =
        metadataRoleRaw && Array.isArray(rolesList)
          ? rolesList.find(
              (role) =>
                typeof role?.name === "string" &&
                role.name.trim().toLowerCase() === metadataRoleRaw.toLowerCase()
            )?.name ?? null
          : null;
      const fallbackRoleName =
        metadataRoleFromCatalog || (metadataRoleRaw ? metadataRoleRaw : "SuperAdmin");

      let roleName;
      if (!userOrganizations.length) {
        roleName = fallbackRoleName || "SuperAdmin";
      } else {
        const roleId = userOrganizations[0]?.rol_id ?? null;
        roleName = roleId
          ? (Array.isArray(rolesList) ? rolesList : []).find((role) => role.id === roleId)?.name ?? null
          : null;

        if (!roleName || roleName.toLowerCase() === "miembro") {
          roleName = fallbackRoleName || "Miembro";
        }
      }

      const roleDetails = getRolePermissions(roleName);
      const personaGymId = personaRow?.gym_id ?? null;

      const accessibleGyms =
        roleDetails.limitToAssignedGym && personaGymId
          ? gyms.filter((gym) => gym.id === personaGymId)
          : roleDetails.limitToAssignedGym
          ? []
          : gyms;

      setSucursales(accessibleGyms);

      const visibleMembers =
        roleDetails.limitToAssignedGym && personaGymId
          ? combinedMembers.filter((member) => member.sucursalId === personaGymId)
          : roleDetails.limitToAssignedGym
          ? []
          : combinedMembers;

      setMiembros(visibleMembers);
      setCurrentMember(ownMember);

      const parseAmount = (value) => {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : 0;
      };

      const timeValue = (value) => {
        if (!value) return 0;
        const timestamp = Date.parse(value);
        return Number.isFinite(timestamp) ? timestamp : 0;
      };

      let visiblePayments =
        roleDetails.capabilities?.canViewPayments !== false
          ? paymentsData
              .map((payment) => {
                const member = memberMap.get(payment.miembro_id);
                if (!member) {
                  return null;
                }

                const plan = payment.membership_type_id
                  ? membershipTypeMap.get(payment.membership_type_id) ?? null
                  : null;

                const status = (payment.status ?? "pending").toLowerCase();

                return {
                  id: payment.id,
                  memberId: payment.miembro_id,
                  memberName: member.name,
                  memberEmail: member.email,
                  memberDocument: member.documentNumber,
                  sucursalId: member.sucursalId,
                  sucursalName: member.sucursalName,
                  membershipTypeId: payment.membership_type_id ?? null,
                  type: plan?.name ?? "Pago de membresia",
                  amount: parseAmount(payment.amount),
                  status,
                  paymentDate: payment.payment_date ?? null,
                  dueDate: payment.due_date ?? null,
                  method: payment.payment_method ?? "No especificado",
                  transactionId: payment.transaction_id ?? null,
                  notes: payment.notes ?? null
                };
              })
              .filter(Boolean)
          : [];

      if (roleName === "Miembro") {
        visiblePayments = ownMember
          ? visiblePayments.filter((payment) => payment.memberId === ownMember.id)
          : [];
      } else if (roleDetails.limitToAssignedGym) {
        visiblePayments = personaGymId
          ? visiblePayments.filter((payment) => payment.sucursalId === personaGymId)
          : [];
      }

      visiblePayments.sort((a, b) => {
        const aTime = timeValue(a.paymentDate ?? a.dueDate);
        const bTime = timeValue(b.paymentDate ?? b.dueDate);
        return bTime - aTime;
      });

      setPayments(visiblePayments);

      const assignedGym = accessibleGyms.find((gym) => gym.id === personaGymId) ?? null;

      setUser({
        id: userRow?.id ?? userId,
        email: userRow?.email ?? activeSession.user.email,
        name: personaRow
          ? `${personaRow.first_name ?? ""} ${personaRow.last_name ?? ""}`.trim() || personaRow.email
          : activeSession.user.email,
        role: roleName,
        gymId: personaGymId,
        gymName: assignedGym?.name ?? null,
        permissions: roleDetails.capabilities,
        limitToAssignedGym: roleDetails.limitToAssignedGym
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
        const response = await signUpWithSupabase(email, password, {
          full_name: name,
          appRole: "SuperAdmin"
        });

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

  const createMembershipPlan = useCallback(
    async (payload) => {
      if (!empresa) {
        throw new Error("Primero crea una organizacion");
      }

      const {
        name,
        description = null,
        price,
        duration_days,
        features = null,
        gym_id
      } = payload;

      if (!gym_id) {
        throw new Error("Selecciona una sucursal para asignar el plan");
      }

      const planPayload = {
        name,
        description,
        price,
        duration_days,
        gym_id,
        features
      };

      try {
        const response = await post("/api/tipos-membresia", planPayload);
        await hydrateContext(session);
        return response?.data ?? null;
      } catch (err) {
        setError((current) => current ?? err);
        throw err;
      }
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
        sucursalId,
        status: requestedStatus
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
            membership_status: (requestedStatus ?? "active").toLowerCase(),
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

  const updateMiembro = useCallback(
    async (memberId, updates = {}) => {
      if (!memberId) {
        throw new Error("Identificador de miembro requerido");
      }

      const member = miembros.find((item) => item.id === memberId);
      if (!member) {
        throw new Error("Miembro no encontrado");
      }

      const persona = personas.find((item) => item.id === member.personaId);
      if (!persona) {
        throw new Error("No se encontro la persona asociada al miembro");
      }

      const trimmedName = (updates.name ?? member.name ?? "").trim();
      const [firstNameRaw, ...restName] = trimmedName.length > 0 ? trimmedName.split(/\s+/) : [];
      const firstName = firstNameRaw || persona.first_name || "SinNombre";
      const lastName = restName.join(" ") || persona.last_name || "SinApellido";

      const resolvedDocument =
        (updates.documentNumber ?? member.documentNumber ?? persona.document_number ?? "").trim();

      if (!resolvedDocument) {
        throw new Error("El documento es obligatorio");
      }

      const resolveGymId = () => {
        if (updates.sucursalId === "") return null;
        if (updates.sucursalId !== undefined) return updates.sucursalId || null;
        if (member.sucursalId === "") return null;
        return member.sucursalId ?? persona.gym_id ?? null;
      };

      const personaPayload = {
        document_number: resolvedDocument,
        first_name: firstName,
        last_name: lastName,
        email: (updates.email ?? persona.email ?? "").trim(),
        phone: updates.phone ?? persona.phone ?? "",
        address: updates.address ?? persona.address ?? "",
        gym_id: resolveGymId()
      };

      let baseNotes = {};
      if (typeof member.notes === "string" && member.notes.trim().length > 0) {
        try {
          const parsed = JSON.parse(member.notes);
          if (parsed && typeof parsed === "object") {
            baseNotes = parsed;
          }
        } catch {
          baseNotes = {};
        }
      }
      baseNotes.appRole = updates.role ?? member.role ?? "Miembro";

      const memberPayload = {
        membership_status: (updates.status ?? member.status ?? "active").toLowerCase(),
        notes: JSON.stringify(baseNotes)
      };

      try {
        await put(`/api/personas/${persona.id}`, personaPayload);
        await put(`/api/miembros/${memberId}`, memberPayload);
        await hydrateContext(session);
      } catch (err) {
        setError((current) => current ?? err);
        throw err;
      }
    },
    [miembros, personas, hydrateContext, session]
  );

  const deleteMiembro = useCallback(
    async (memberId) => {
      if (!memberId) {
        throw new Error("Identificador de miembro requerido");
      }
      try {
        await del(`/api/miembros/${memberId}`);
        setMiembros((current) => current.filter((member) => member.id !== memberId)); // FIX: Refresca la lista local sin esperar al rehydrate.
        await hydrateContext(session);
      } catch (err) {
        setError((current) => current ?? err);
        throw err;
      }
    },
    [hydrateContext, session]
  );

  const recordPayment = useCallback(
    async ({
      miembroId,
      membershipTypeId = null,
      amount = 0,
      paymentMethod = null,
      status = "completed",
      dueDate = null,
      notes = null,
      transactionId = null
    }) => {
      if (!miembroId) {
        throw new Error("Miembro requerido para registrar el pago");
      }

      const numericAmount = Number(amount ?? 0);
      const resolvedAmount = Number.isFinite(numericAmount) ? numericAmount : 0;

      const toIsoString = (value, fallback) => {
        if (!value) return fallback;
        if (value instanceof Date) {
          return value.toISOString();
        }
        if (typeof value === "string") {
          const parsed = Date.parse(value);
          if (Number.isFinite(parsed)) {
            return new Date(parsed).toISOString();
          }
          return value;
        }
        const parsed = Date.parse(value);
        if (Number.isFinite(parsed)) {
          return new Date(parsed).toISOString();
        }
        return fallback;
      };

      const nowIso = new Date().toISOString();
      const payload = {
        miembro_id: miembroId,
        membership_type_id: membershipTypeId,
        amount: resolvedAmount.toFixed(2),
        payment_method: paymentMethod,
        status: (status ?? "completed").toLowerCase(),
        payment_date: nowIso,
        due_date: toIsoString(dueDate, nowIso),
        notes,
        transaction_id: transactionId
      };

      try {
        const response = await post("/api/pagos", payload);
        await hydrateContext(session);
        return response?.data ?? null;
      } catch (err) {
        setError((current) => current ?? err);
        throw err;
      }
    },
    [hydrateContext, session]
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

    membershipPlans,

    payments,

    currentMember,

    tenantOverview,

    isLoading,

    error,

    login,

    register,

    logout,

    createEmpresa,

    createSucursal,

    createMiembro,

    createMembershipPlan,

    updateMiembro,

    deleteMiembro,

    recordPayment,

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








