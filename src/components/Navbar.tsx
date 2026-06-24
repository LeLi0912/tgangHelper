'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: '首页', icon: '🏠' },
    { href: '/records', label: '训练记录', icon: '📋' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-emerald-100/50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🧘</span>
          <span className="font-extrabold text-lg text-gray-800 tracking-tight">
            提肛<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">助手</span>
          </span>
        </Link>

        <div className="flex gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                <span className={`flex items-center gap-1.5 ${active ? 'text-emerald-700' : 'text-gray-500 hover:text-gray-700'}`}>
                  <span className="text-xs">{link.icon}</span>
                  {link.label}
                </span>
                {active && (
                  <motion.div
                    layoutId="navbar-active"
                    className="absolute inset-0 bg-emerald-100/80 rounded-lg -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
