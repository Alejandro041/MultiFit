import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Calendar,
  Building2,
  LogOut,
  Dumbbell
} from "lucide-react";

const Sidebar = () => {
  const { user, empresa, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const menuItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["SuperAdmin", "AdminGym", "Entrenador", "Miembro"] },
    { path: "/miembros", icon: Users, label: "Miembros", roles: ["SuperAdmin", "AdminGym", "Entrenador"] },
    { path: "/pagos", icon: CreditCard, label: "Pagos", roles: ["SuperAdmin", "AdminGym", "Miembro"] },
    { path: "/planificaciones", icon: Calendar, label: "Planificaciones", roles: ["SuperAdmin", "AdminGym", "Entrenador", "Miembro"] },
    { path: "/gimnasio", icon: Building2, label: "Sucursales", roles: ["SuperAdmin"] }
  ];

  const visibleItems = empresa ? menuItems.filter((item) => item.roles.includes(user.role)) : [];
  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-white shadow-lg h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{empresa?.name || "GymApp"}</h2>
            <p className="text-sm text-gray-500">{user.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {!empresa ? (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500">Configura tu organizacion desde el dashboard.</p>
          </div>
        ) : (
          visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })
        )}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="font-medium text-gray-900 text-sm">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar sesion</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
