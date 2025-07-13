'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
  }, []);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };
  return (
    <nav className="bg-gray-900 text-white px-4 py-3 shadow flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-purple-400">
        PriceTrace
      </Link>
      <div className="flex gap-4 text-sm">
        <Link href="/add-product" className="hover:text-purple-300">Add Product</Link>
        <Link href="/dashboard" className="hover:text-purple-300">Dashboard</Link>
        {!user ? (
          <>
            <Link href="/login" className="hover:text-green-400">Login</Link>
            <Link href="/signup" className="hover:text-blue-400">Signup</Link>
          </>
        ) : (
          <button onClick={handleLogout} className="hover:text-red-400">
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
