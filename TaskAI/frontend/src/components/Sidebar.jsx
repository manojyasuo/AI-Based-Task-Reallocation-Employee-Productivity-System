import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard, Users, CheckSquare, BarChart2,
  Award, Bell, LogOut, Zap, CalendarDays
} from 'lucide-react';


const avatarColors = ['#3b82f6','#8b5cf6','#ec4899','#10b981','#f59e0b','#06b6d4'];
const getColor = (name='') => avatarColors[name.charCodeAt(0) % avatarColors.length];

const Sidebar = ({ role }) => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const adminLinks = [
    { path: '/admin',             icon: <LayoutDashboard size={18}/>, label: 'Overview',      end: true },
    { path: '/admin/employees',   icon: <Users size={18}/>,           label: 'Employees'            },
    { path: '/admin/tasks',       icon: <CheckSquare size={18}/>,     label: 'Tasks'                },
    { path: '/admin/analytics',   icon: <BarChart2 size={18}/>,       label: 'Analytics'            },
    { path: '/admin/leaderboard', icon: <Award size={18}/>,           label: 'Leaderboard'          },
    { path: '/admin/leave',       icon: <CalendarDays size={18}/>,    label: 'Leave Requests'       },
    { path: '/admin/notifications',icon: <Bell size={18}/>,           label: 'Notifications'        },
    { path: '/admin/calendar', icon: <CalendarDays size={18}/>, label: 'Calendar' },
  ];
  const employeeLinks = [
    { path: '/employee',              icon: <LayoutDashboard size={18}/>, label: 'My Dashboard', end: true },
    { path: '/employee/tasks',        icon: <CheckSquare size={18}/>,     label: 'My Tasks'           },
    { path: '/employee/leaderboard',  icon: <Award size={18}/>,           label: 'Leaderboard'        },
    { path: '/employee/leave',        icon: <CalendarDays size={18}/>,    label: 'Request Leave'      },
    { path: '/employee/notifications',icon: <Bell size={18}/>,            label: 'Notifications'      },
  ];
  const links = role === 'ADMIN' ? adminLinks : employeeLinks;

  const displayName = user?.email?.split('@')[0] || (role === 'ADMIN' ? 'Admin User' : 'Employee');
  const displayRole = role === 'ADMIN' ? 'Admin' : 'Employee';

  return (
    <div style={{
      width: 240, minHeight: '100vh', background: '#090A0F',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      padding: '0', borderRight: '1px solid rgba(255,255,255,0.05)',
      position: 'relative', zIndex: 100
    }}>
     {/* Logo */}
<div style={{ padding: '32px 24px 24px' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
   <div style={{
  width: 40,
  height: 40,
  borderRadius: 10,
  overflow: 'hidden',
  boxShadow: '0 0 10px rgba(255, 165, 0, 0.5)'
}}>
      <img 
        src="/images/robot.png" 
        alt="logo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </div>

    <span style={{
      color: '#fff',
      fontWeight: 800,
      fontSize: '1.4rem',
      letterSpacing: '-0.5px'
    }}>
      TaskAI
    </span>
    

  </div>
</div>


      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.end || false}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', borderRadius: 12, textDecoration: 'none',
              fontWeight: isActive ? 600 : 500, fontSize: '0.9rem', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              background: isActive ? 'var(--accent-light)' : 'transparent',
              color: isActive ? 'var(--accent)' : '#94a3b8',
              boxShadow: isActive ? 'inset 0 0 0 1px rgba(0, 210, 255, 0.2)' : 'none',
            })}
          >
            <span style={{ transition: 'transform 0.3s' }}>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User profile */}
      <div style={{
        margin: '16px', padding: '16px', borderRadius: 16,
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: getColor(displayName),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: '1rem', flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          {displayName[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName.charAt(0).toUpperCase() + displayName.slice(1)}</div>
          <div style={{ color: 'var(--accent)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{displayRole}</div>
        </div>
      </div>

      <button onClick={handleLogout} style={{
        margin: '0 16px 24px', display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 16px', borderRadius: 12, border: 'none',
        background: 'transparent', color: '#64748b', cursor: 'pointer',
        fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.3s'
      }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#ef4444'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
      >
        <LogOut size={18}/> Sign Out
      </button>
    </div>
  );
};

export default Sidebar;
