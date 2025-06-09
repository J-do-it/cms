import React from 'react';
import Logo from './Logo';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white text-black z-50 border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Link href="/">
              <Logo className="h-10" />
            </Link>
        </div>
      </div>
    </header>
  );
};

export default Header; 