'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChangeEvent, ClipboardEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

type MfaEnrollment = {
  id: string;
  totp: {
    qr_code: string;
    secret: string;
  };
};

const codeLength = 6;

function cleanQrCodeSrc(qrCode: string) {
  const clean = qrCode.trimEnd();
  return clean.startsWith('data:') ? clean : `data:image/svg+xml;utf-8,${encodeURIComponent(clean)}`;
}

export default function MfaSetupPage() {
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<MfaEnrollment | null>(null);
  const [digits, setDigits] = useState(Array(codeLength).fill(''));
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [alreadyActive, setAlreadyActive] = useState(false);
  const startedRef = useRef(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const prepareEnrollment = async () => {
      if (startedRef.current) return;
      startedRef.current = true;

      setIsLoading(true);
      setError(null);
      setMessage(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error('Anda perlu login terlebih dahulu.');

        const { data: existingFactors, error: listError } = await supabase.auth.mfa.listFactors();
        if (listError) throw listError;

        const existingTotpFactors = existingFactors?.all?.filter((factor) => factor.factor_type === 'totp') || [];
        const verifiedFactor = existingTotpFactors.find((factor) => factor.status === 'verified');

        if (verifiedFactor) {
          setAlreadyActive(true);
          setMessage('Two Factor Authentication sudah aktif untuk akun ini.');
          return;
        }

        await Promise.all(existingTotpFactors.map((factor) => supabase.auth.mfa.unenroll({ factorId: factor.id })));

        const { data, error: enrollError } = await supabase.auth.mfa.enroll({
          factorType: 'totp',
          friendlyName: `My Tax Authenticator ${Date.now()}`,
        });
        if (enrollError) throw enrollError;

        setEnrollment(data);
      } catch (err) {
        const messageText = err instanceof Error ? err.message : 'Gagal menyiapkan aktivasi 2FA.';
        setError(messageText);
      } finally {
        setIsLoading(false);
      }
    };

    void prepareEnrollment();
  }, []);

  const verificationCode = digits.join('');
  const qrCodeSrc = enrollment ? cleanQrCodeSrc(enrollment.totp.qr_code) : '';

  const updateDigit = (index: number, value: string) => {
    const nextDigit = value.replace(/\D/g, '').slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = nextDigit;
    setDigits(nextDigits);

    if (nextDigit && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, codeLength);
    if (!pasted) return;

    event.preventDefault();
    const nextDigits = Array(codeLength)
      .fill('')
      .map((_, index) => pasted[index] || '');
    setDigits(nextDigits);
    inputRefs.current[Math.min(pasted.length, codeLength) - 1]?.focus();
  };

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyMfa = async () => {
    if (!enrollment || verificationCode.length < codeLength) return;

    setIsVerifying(true);
    setError(null);
    setMessage(null);

    try {
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: enrollment.id,
      });
      if (challengeError) throw challengeError;
      if (!challengeData?.id) throw new Error('Challenge 2FA tidak tersedia.');

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: enrollment.id,
        challengeId: challengeData.id,
        code: verificationCode,
      });
      if (verifyError) throw verifyError;

      setMessage('2FA berhasil diaktifkan. Mengarahkan kembali ke pengaturan akun...');
      window.setTimeout(() => router.push('/dashboard/profile'), 900);
    } catch (err) {
      const messageText = err instanceof Error ? err.message : 'Kode 2FA tidak valid.';
      setError(messageText);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-7rem)] px-4 py-10 md:px-8">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/25 bg-blue-500/10 text-blue-200 shadow-2xl shadow-blue-950/30">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10V8a4 4 0 1 1 8 0v2m-9 0h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1Z" />
          </svg>
        </div>

        <p className="text-xs font-black uppercase tracking-[0.24em] text-blue-400">Keamanan Akun</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-white md:text-4xl">
          Verifikasi Two-Factor Authentication (2FA) Diperlukan
        </h1>
        <p className="mt-4 max-w-xl text-sm font-medium leading-relaxed text-slate-400">
          Pindai QR code menggunakan{' '}
          <a
            href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-blue-300 underline decoration-blue-400/40 underline-offset-4 transition hover:text-blue-200"
          >
            Google Authenticator
          </a>{' '}
          atau aplikasi sejenis, lalu masukkan kode 6 digit yang tampil di aplikasi.
        </p>

        <div className="mt-8 w-full rounded-3xl border border-slate-800/70 bg-slate-950/45 p-6 shadow-2xl shadow-blue-950/20 md:p-8">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <p className="mt-4 text-sm font-semibold text-slate-400">Menyiapkan QR code 2FA...</p>
            </div>
          )}

          {!isLoading && alreadyActive && (
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5 text-sm font-semibold text-blue-100">
              {message}
            </div>
          )}

          {!isLoading && error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm font-semibold text-red-300">
              {error}
            </div>
          )}

          {!isLoading && enrollment && (
            <div className="flex flex-col items-center">
              <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                <Image
                  src={qrCodeSrc}
                  alt="QR code aktivasi Two Factor Authentication"
                  width={196}
                  height={196}
                  unoptimized
                  className="h-48 w-48 object-contain"
                />
              </div>

              <div className="mt-6 max-w-md rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 text-left">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Kode Manual</p>
                <code className="mt-2 block break-all text-sm font-bold text-blue-200">{enrollment.totp.secret}</code>
              </div>

              <div className="mt-7 flex justify-center gap-3">
                {digits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    value={digit}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => updateDigit(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={`Digit kode 2FA ${index + 1}`}
                    className="h-14 w-12 rounded-xl border border-slate-700/70 bg-slate-950/70 text-center text-2xl font-bold text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 md:h-16 md:w-14"
                  />
                ))}
              </div>

              {message && (
                <div className="mt-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm font-semibold text-blue-200">
                  {message}
                </div>
              )}

              <button
                type="button"
                onClick={verifyMfa}
                disabled={isVerifying || verificationCode.length < codeLength}
                className="mt-6 w-full max-w-xl rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
              >
                {isVerifying ? 'Memverifikasi...' : 'Verifikasi 2FA'}
              </button>
            </div>
          )}

          <div className="mt-8 flex items-center gap-4 text-slate-600">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs font-bold uppercase tracking-[0.18em]">Atau</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <div className="mt-6 flex flex-col items-center gap-3 text-sm font-semibold sm:flex-row sm:justify-center">
            <Link href="/dashboard/profile" className="text-blue-300 transition hover:text-blue-200">
              Kembali ke Pengaturan Akun
            </Link>
            <span className="hidden text-slate-700 sm:block">/</span>
            <Link href="/dashboard/profile/mfa/help" className="text-slate-400 transition hover:text-white">
              Lihat apa itu 2FA dan cara mengaktifkannya
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
