import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [empresa, setEmpresa] = useState(null);
  const [sucursales, setSucursales] = useState([]);
  const [miembros, setMiembros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserContext = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const savedUser = localStorage.getItem('user');
      const savedEmpresa = localStorage.getItem('empresa');
      const savedSucursales = localStorage.getItem('sucursales');
      const savedMiembros = localStorage.getItem('miembros');
      
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      
      if (savedEmpresa) {
        setEmpresa(JSON.parse(savedEmpresa));
      }
      
      if (savedSucursales) {
        setSucursales(JSON.parse(savedSucursales));
      }

      if (savedMiembros) {
        setMiembros(JSON.parse(savedMiembros));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserContext();
  }, []);

  const login = async (email, password) => {
    // Simulate login API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = {
      id: '1',
      email,
      name: 'Usuario Demo',
      role: 'SuperAdmin'
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const register = async (email, password, name) => {
    // Simulate register API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = {
      id: '1',
      email,
      name,
      role: 'SuperAdmin'
    };
    
    setUser(mockUser);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    setEmpresa(null);
    setSucursales([]);
    setMiembros([]);
    localStorage.removeItem('user');
    localStorage.removeItem('empresa');
    localStorage.removeItem('sucursales');
    localStorage.removeItem('miembros');
  };

  const createEmpresa = async (name) => {
    const newEmpresa = {
      id: '1',
      name,
      createdAt: new Date()
    };
    
    setEmpresa(newEmpresa);
    localStorage.setItem('empresa', JSON.stringify(newEmpresa));
  };

  const createSucursal = async (sucursalData) => {
    const newSucursal = {
      ...sucursalData,
      id: Date.now().toString(),
      empresaId: empresa?.id || '1'
    };
    
    const updatedSucursales = [...sucursales, newSucursal];
    setSucursales(updatedSucursales);
    localStorage.setItem('sucursales', JSON.stringify(updatedSucursales));
  };

  const createMiembro = async (miembroData) => {
    const newMiembro = {
      ...miembroData,
      id: Date.now().toString(),
      empresaId: empresa?.id || '1',
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    
    const updatedMiembros = [...miembros, newMiembro];
    setMiembros(updatedMiembros);
    localStorage.setItem('miembros', JSON.stringify(updatedMiembros));
  };

  const refreshContext = async () => {
    await loadUserContext();
  };

  return (
    <AuthContext.Provider value={{
      user,
      empresa,
      sucursales,
      miembros,
      isLoading,
      login,
      register,
      logout,
      createEmpresa,
      createSucursal,
      createMiembro,
      refreshContext
    }}>
      {children}
    </AuthContext.Provider>
  );
};