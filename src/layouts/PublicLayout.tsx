import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar.tsx';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
