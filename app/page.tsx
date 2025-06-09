'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  
  // TODO: 실제 Supabase 또는 다른 인증 로직으로 교체해야 합니다.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id === 'admin' && password === 'password') {
      alert('로그인 성공!');
      router.push('/dashboard');
    } else {
      alert('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">
            관리자 로그인
          </h1>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="id-input" className="sr-only">
                아이디
              </label>
              <input
                id="id-input"
                name="id"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-jj focus:border-jj focus:z-10 sm:text-sm"
                placeholder="아이디"
                value={id}
                onChange={(e) => setId(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password-input" className="sr-only">
                비밀번호
              </label>
              <input
                id="password-input"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-jj focus:border-jj focus:z-10 sm:text-sm"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-jj hover:bg-opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jj transition-colors"
            >
              로그인
            </button>
          </div>

          <div>
            <button
              onClick={() => router.push('/dashboard')}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-gray-500 hover:bg-opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jj transition-colors"
            >
              (임시) 대시보드로 이동
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}
