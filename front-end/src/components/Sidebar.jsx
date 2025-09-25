import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Users, 
  CreditCard, 
  Calendar, 
  User 
} from 'lucide-react'
;

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || (path === '/dashboard' && location.pathname === '/');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/gimnasio', label: 'Gimnasio', icon: Dumbbell },
    { path: '/miembros', label: 'Miembros', icon: Users },
    { path: '/pagos', label: 'Pagos', icon: CreditCard },
    { path: '/planificaciones', label: 'Planificaciones', icon: Calendar },
    { path: '/perfil', label: 'Perfil', icon: User }
  ];

  return (
    <div className="sidebar">
      <Nav className="flex-column">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <LinkContainer key={item.path} to={item.path}>
              <Nav.Link className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}>
                <IconComponent size={20} className="me-3" />
                {item.label}
              </Nav.Link>
            </LinkContainer>
          );
        })}
      </Nav>
    </div>
  );
};

export default Sidebar;