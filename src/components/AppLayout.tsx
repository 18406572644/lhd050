import { AppShell, Text } from '@mantine/core';
import { NavLink as RouterNavLink, Outlet } from 'react-router-dom';
import { FlaskConical, BookOpen, Clock, BookMarked } from 'lucide-react';

const navItems = [
  { label: '工作台', icon: FlaskConical, path: '/' },
  { label: '配方管理', icon: BookOpen, path: '/recipes' },
  { label: '香材百科', icon: BookMarked, path: '/encyclopedia' },
  { label: '历史记录', icon: Clock, path: '/history' },
];

export default function AppLayout() {
  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 220, breakpoint: 0 }}
    >
      <AppShell.Header
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: 'linear-gradient(180deg, #F5F1EB 0%, #E8E4E0 100%)',
        }}
      >
        <Text
          style={{
            fontFamily: '"Noto Serif SC", serif',
            fontSize: 22,
            fontWeight: 700,
            color: '#8B6F4E',
            paddingLeft: 24,
            letterSpacing: 2,
          }}
        >
          香材称量与配比模拟器
        </Text>
        <div
          style={{
            height: 2,
            background: 'linear-gradient(90deg, #C4A882 0%, #8B6F4E 50%, #C4A882 100%)',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          }}
        />
      </AppShell.Header>

      <AppShell.Navbar style={{ backgroundColor: '#E8E4E0' }}>
        <div style={{ padding: '12px 8px' }}>
          {navItems.map((item) => (
            <RouterNavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                textDecoration: 'none',
                color: isActive ? '#5A3E2B' : '#8B6F4E',
                backgroundColor: isActive ? '#C4A882' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                borderRadius: 8,
                marginBottom: 4,
                fontSize: 14,
                transition: 'background-color 0.2s',
              })}
            >
              <item.icon size={18} strokeWidth={1.8} />
              <span>{item.label}</span>
            </RouterNavLink>
          ))}
        </div>
      </AppShell.Navbar>

      <AppShell.Main style={{ backgroundColor: '#F5F1EB', minHeight: 'calc(100vh - 60px)' }}>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
