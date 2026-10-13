import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar.tsx';
import { Sidebar } from '../components/Sidebar.tsx';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
