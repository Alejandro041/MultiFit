export const ROLE_PERMISSIONS = {
  SuperAdmin: {
    defaultRoute: "/dashboard",
    limitToAssignedGym: false,
    capabilities: {
      canAccessDashboard: true,
      canManageMembers: true,
      canManageTrainers: true,
      canManagePayments: true,
      canViewPayments: true,
      canManagePlans: true,
      canViewPlans: true,
      canManageGyms: true
    }
  },
  AdminGym: {
    defaultRoute: "/dashboard",
    limitToAssignedGym: true,
    capabilities: {
      canAccessDashboard: true,
      canManageMembers: true,
      canManageTrainers: true,
      canManagePayments: true,
      canViewPayments: true,
      canManagePlans: true,
      canViewPlans: true,
      canManageGyms: false
    }
  },
  Entrenador: {
    defaultRoute: "/miembros",
    limitToAssignedGym: true,
    capabilities: {
      canAccessDashboard: false,
      canManageMembers: true,
      canManageTrainers: false,
      canManagePayments: true,
      canViewPayments: true,
      canManagePlans: true,
      canViewPlans: true,
      canManageGyms: false
    }
  },
  Miembro: {
    defaultRoute: "/planificaciones",
    limitToAssignedGym: true,
    capabilities: {
      canAccessDashboard: false,
      canManageMembers: false,
      canManageTrainers: false,
      canManagePayments: false,
      canViewPayments: true,
      canManagePlans: false,
      canViewPlans: true,
      canManageGyms: false
    }
  }
};

export const ROUTE_ACCESS = {
  "/dashboard": ["SuperAdmin", "AdminGym"],
  "/gimnasio": ["SuperAdmin", "AdminGym"],
  "/miembros": ["SuperAdmin", "AdminGym", "Entrenador"],
  "/planificaciones": ["SuperAdmin", "AdminGym", "Entrenador", "Miembro"],
  "/pagos": ["SuperAdmin", "AdminGym", "Entrenador", "Miembro"]
};

export const getDefaultRouteForRole = (role) =>
  ROLE_PERMISSIONS[role]?.defaultRoute ?? "/planificaciones";

export const getRolePermissions = (role) =>
  ROLE_PERMISSIONS[role] ?? ROLE_PERMISSIONS.Miembro;

export const isRoleAllowedForPath = (role, path) => {
  const allowedRoles = ROUTE_ACCESS[path];
  if (!allowedRoles) {
    return true;
  }
  return allowedRoles.includes(role);
};
