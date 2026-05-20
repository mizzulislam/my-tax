'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import NotificationCenter from '@/components/NotificationCenter';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Untuk Drawer Mobile
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Untuk Minimize Desktop
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false); // Untuk Dropdown Profil di Header

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      
      setUserEmail(user.email ?? null);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', user.id)
        .maybeSingle();
        
      if (!profile) {
        router.replace('/profile');
        return;
      }

      if (profile) {
        setUserName(profile.full_name ?? null);
      }
      
      setIsChecking(false);
    };
    checkAuthAndProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z"></path></svg>
      )
    },
    {
      name: 'Transaksi Digital',
      href: '/dashboard/transactions',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
      )
    },
    {
      name: 'Simulasi What-If',
      href: '/dashboard/what-if',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z"></path></svg>
      )
    },
    {
      name: 'Berkas Pendukung',
      href: '/dashboard/documents',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
      )
    },
    {
      name: 'Kamus Pajak',
      href: '/dashboard/glossary',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
      )
    },
    {
      name: 'AI Taxologist',
      href: '/dashboard/assistant',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
      )
    }
  ];

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="relative flex justify-center items-center">
          <div className="absolute animate-ping w-16 h-16 rounded-full bg-blue-500/20"></div>
          <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative flex overflow-hidden">
      
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 -right-1/4 w-[1000px] h-[1000px] rounded-full bg-blue-600/5 blur-[150px]" />
        <div className="absolute bottom-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-indigo-600/5 blur-[120px]" />
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
        />
      )}

      {/* SIDEBAR PANEL */}
      <aside 
        className={`fixed inset-y-0 left-0 bg-slate-900/80 backdrop-blur-xl border-r border-slate-800/80 py-6 flex flex-col justify-between z-50 transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebarCollapsed ? 'w-20 px-3' : 'w-72 px-6'}`}
      >
        <div>
          {/* Logo & Brand */}
          <div className={`flex items-center gap-3 py-4 mb-8 overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'justify-center px-0' : 'px-2'}`}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
              <svg className="w-5 h-5 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            
            <div className={`flex flex-col transition-all duration-300 origin-left ${sidebarCollapsed ? 'w-0 opacity-0 scale-90 max-w-0 pointer-events-none' : 'w-auto opacity-100 scale-100 max-w-[200px]'}`}>
              <span className="text-lg font-black text-white tracking-wider block whitespace-nowrap">TAX FEYMENTS</span>
              <span className="text-[10px] text-blue-400 font-bold tracking-widest uppercase whitespace-nowrap">Dashboard Panel</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 overflow-hidden">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  title={sidebarCollapsed ? item.name : undefined}
                  className={`flex items-center rounded-xl text-sm font-semibold transition-all duration-300 ease-in-out group ${sidebarCollapsed ? 'px-3 py-3.5 justify-center' : 'px-4 py-3.5 gap-3.5'} ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/15' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                >
                  <span className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} flex-shrink-0 transition-colors duration-200`}>
                    {item.icon}
                  </span>
                  
                  <span className={`transition-all duration-300 ease-in-out origin-left truncate ${sidebarCollapsed ? 'w-0 opacity-0 scale-90 max-w-0 pointer-events-none ml-0' : 'w-auto opacity-100 scale-100 max-w-[150px]'}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Build Status */}
        <div className={`pt-6 border-t border-slate-800/80 text-center ${sidebarCollapsed ? 'text-[9px]' : 'text-xs'} text-slate-600 font-semibold tracking-wider uppercase font-mono`}>
          {!sidebarCollapsed ? 'Tax Feyments v2.0.26' : 'v2.0'}
        </div>
      </aside>

      {/* MAIN VIEW AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen relative z-10">
        
        {/* HEADER BAR */}
        <header className="sticky top-0 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/80 py-4 px-6 md:px-12 flex items-center justify-between z-30">
          
          <div className="flex items-center gap-4">
            {/* Hamburger Button for Mobile Drawer AND Desktop Minimize */}
            <button
              onClick={() => {
                if (window.innerWidth >= 1024) {
                  setSidebarCollapsed(!sidebarCollapsed);
                } else {
                  setSidebarOpen(true);
                }
              }}
              className="p-2.5 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 transition-all duration-200 focus:outline-none flex items-center justify-center shadow-lg cursor-pointer"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              aria-label="Toggle Sidebar"
            >
              {sidebarCollapsed ? (
                /* Icon Menu Garis 3 Biasa ketika Minimize */
                <svg className="w-5 h-5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                /* Icon Menu Kustom dengan Panah Lipat ketika Maximize */
                <svg className="w-5 h-5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12H10m0 0l4-4m-4 4l4 4M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <NotificationCenter />
            
            {/* GLOWING PROFILE DROPDOWN */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 p-1.5 px-3 bg-slate-900 rounded-xl hover:bg-slate-800 transition-all duration-200 outline-none cursor-pointer select-none"
                aria-label="Menu Wajib Pajak"
              >
                {/* Initials Circle */}
                <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-xs font-black text-blue-400 uppercase flex-shrink-0">
                  {userName ? userName.substring(0, 2) : (userEmail ? userEmail.substring(0, 2) : 'US')}
                </div>

                {/* User Full Name & Email Stacked */}
                <div className="flex flex-col text-left hidden sm:flex">
                  <span className="text-xs font-extrabold text-white leading-tight truncate max-w-[130px]">
                    {userName || 'Wajib Pajak'}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold block truncate max-w-[130px] mt-0.5 leading-none">
                    {userEmail}
                  </span>
                </div>

                {/* Dynamic Chevron */}
                <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform duration-200" style={{ transform: profileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
              </button>

              {profileDropdownOpen && (
                <>
                  <div 
                    onClick={() => setProfileDropdownOpen(false)}
                    className="fixed inset-0 z-40 bg-transparent"
                  />
                  <div className="absolute right-0 mt-3 w-64 bg-slate-950/95 backdrop-blur-2xl border-0 rounded-2xl shadow-2xl z-50 p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="border-b border-slate-900 pb-3">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Wajib Pajak Aktif</span>
                      <span className="text-xs font-bold text-white block mt-0.5 truncate" title={userName || userEmail || ''}>
                        {userName || userEmail}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-slate-350 hover:text-white hover:bg-slate-900 rounded-lg transition-all"
                      >
                        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        Profil Saya
                      </Link>
                      
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all text-left cursor-pointer border border-transparent hover:border-red-500/10"
                      >
                        <svg className="w-4 h-4 text-red-500/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Keluar Sesi
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 p-6 md:p-12">
          {children}
        </main>
      </div>

    </div>
  );
}
