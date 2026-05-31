'use client';

import { useState, useEffect } from 'react';
import { Joyride, Step, TooltipRenderProps, EventData, ACTIONS, EVENTS, STATUS } from 'react-joyride';
import { useRouter, usePathname } from 'next/navigation';

export type CustomStep = Step & { route?: string };

function CustomTooltip({
  index,
  step,
  backProps,
  closeProps,
  primaryProps,
  tooltipProps,
  isLastStep,
}: TooltipRenderProps) {
  return (
    <div {...tooltipProps} style={{ border: 'none', outline: 'none' }} className="bg-white rounded-2xl p-5 w-80 max-w-sm shadow-2xl border-none outline-none">
      <div className="space-y-2">
        {step.content}
      </div>
      <div className="flex items-center justify-between mt-6">
        <div>
          {index > 0 && (
            <button {...backProps} style={{ border: 'none', outline: 'none' }} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors border-none outline-none bg-transparent">
              Kembali
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {!isLastStep && (
            <button {...closeProps} style={{ border: 'none', outline: 'none' }} className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors border-none outline-none bg-transparent">
              Lewati
            </button>
          )}
          <button {...primaryProps} style={{ border: 'none', outline: 'none' }} className="text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg transition-colors shadow-md shadow-blue-500/20 border-none outline-none ring-0">
            {isLastStep ? 'Selesai' : 'Lanjut'}
          </button>
        </div>
      </div>
    </div>
  );
}

const TOUR_STEPS: CustomStep[] = [
  {
    target: 'body',
    placement: 'center',
    route: '/dashboard',
    content: (
      <>
        <h3 className="font-bold text-lg text-slate-800">Selamat Datang di Dasbor My Tax! 🎉</h3>
        <p className="text-sm text-slate-600">Mari kita jelajahi seluruh fitur cerdas aplikasi ini agar pengelolaan pajak Anda menjadi sangat mudah.</p>
      </>
    )
  },
  {
    target: '.tour-target-sidebar',
    route: '/dashboard',
    placement: 'right',
    content: (
      <>
        <h3 className="font-bold text-lg text-slate-800 mb-2">Navigasi Utama</h3>
        <p className="text-sm text-slate-600">Ini adalah menu navigasi Anda. Dari sini Anda bisa berpindah ke modul Penghasilan, Aset, Dokumen, hingga Asisten AI secara instan.</p>
      </>
    )
  },
  {
    target: '.tour-target-ai-highlight',
    route: '/dashboard',
    placement: 'bottom',
    content: (
      <>
        <h3 className="font-bold text-lg text-slate-800 mb-2">✨ Sorotan Ajaib AI (Baru!)</h3>
        <p className="text-sm text-slate-600">Aktifkan mode ini, lalu <strong>blok/sorot teks apa pun</strong> di layar. Gemini AI akan langsung melayang di bawah teks tersebut siap untuk menjelaskannya kepada Anda!</p>
      </>
    )
  },
  {
    target: '.tour-target-readiness',
    route: '/dashboard',
    placement: 'bottom',
    content: (
      <>
        <h3 className="font-bold text-lg text-slate-800 mb-2">Panel Kesiapan Pajak</h3>
        <p className="text-sm text-slate-600">Indikator utama kelengkapan data Anda. Capai 100% di sini untuk memastikan Anda aman dari denda DJP.</p>
      </>
    )
  },
  {
    target: '.tour-target-status-kelengkapan',
    route: '/dashboard',
    placement: 'bottom',
    content: (
      <p className="text-sm text-slate-600">Card ini menunjukkan status dokumen administratif Anda secara real-time berdasarkan input di modul-modul lain.</p>
    )
  },
  {
    target: '.tour-target-langkah-selanjutnya',
    route: '/dashboard',
    placement: 'bottom',
    content: (
      <p className="text-sm text-slate-600">Sistem cerdas kami akan selalu menyarankan tindakan spesifik yang perlu Anda lakukan selanjutnya pada card ini.</p>
    )
  },
  {
    target: '.tour-target-dashboard-stats',
    route: '/dashboard',
    placement: 'top',
    content: (
      <>
        <h3 className="font-bold text-lg text-slate-800 mb-2">Statistik Esensial</h3>
        <p className="text-sm text-slate-600">Pantau sekilas jumlah berkas pajak Anda dan persentase tarif pajak efektif (ETR) Anda yang dihitung secara matematis.</p>
      </>
    )
  },
  {
    target: '.tour-target-trend-chart',
    route: '/dashboard',
    placement: 'top',
    content: (
      <p className="text-sm text-slate-600">Grafik interaktif ini memvisualisasikan tren kewajiban pajak Anda bulan demi bulan sehingga mudah dianalisis.</p>
    )
  },
  {
    target: '.tour-target-dashboard-tabs',
    route: '/dashboard',
    placement: 'bottom',
    content: (
      <p className="text-sm text-slate-600">Anda juga dapat mengganti tab ini untuk melihat Analitik Lanjutan, Riwayat Transaksi lengkap, dan Kalender Pajak.</p>
    )
  },
  {
    target: '.tour-target-income-form',
    route: '/dashboard/income',
    placement: 'bottom',
    content: (
      <>
        <h3 className="font-bold text-lg text-slate-800 mb-2">Penghasilan & Transaksi</h3>
        <p className="text-sm text-slate-600">Gunakan form ini untuk mencatat aliran dana Anda. Sistem otomatis membedakan Pajak Final dan Non-Final sesuai aturan.</p>
      </>
    )
  },
  {
    target: '.tour-target-income-list',
    route: '/dashboard/income',
    placement: 'top',
    content: (
      <p className="text-sm text-slate-600">Seluruh riwayat penghasilan yang telah Anda simpan akan tersusun rapi di tabel ini.</p>
    )
  },
  {
    target: '.tour-target-asset-form',
    route: '/dashboard/assets',
    placement: 'bottom',
    content: (
      <>
        <h3 className="font-bold text-lg text-slate-800 mb-2">Manajemen Harta & Aset</h3>
        <p className="text-sm text-slate-600">Penting untuk pelaporan SPT Tahunan! Catat semua aset baru Anda (rumah, kendaraan, saham) melalui form di sini.</p>
      </>
    )
  },
  {
    target: '.tour-target-asset-list',
    route: '/dashboard/assets',
    placement: 'top',
    content: (
      <p className="text-sm text-slate-600">Rekapitulasi nilai total aset Anda akan dipetakan dan dijumlahkan secara otomatis di area ini.</p>
    )
  },
  {
    target: '.tour-target-document-upload',
    route: '/dashboard/documents',
    placement: 'bottom',
    content: (
      <>
        <h3 className="font-bold text-lg text-slate-800 mb-2">Brankas Dokumen</h3>
        <p className="text-sm text-slate-600">Unggah dan simpan bukti potong bupot, NPWP, atau e-FIN Anda dengan aman di brankas digital terenkripsi ini.</p>
      </>
    )
  },
  {
    target: '.tour-target-calculator-form',
    route: '/dashboard/kalkulator',
    placement: 'right',
    content: (
      <>
        <h3 className="font-bold text-lg text-slate-800 mb-2">Simulasi Kalkulator</h3>
        <p className="text-sm text-slate-600">Pusat perhitungan presisi. Masukkan angka Anda di form ini, dan algoritma kami akan menghitung pajaknya berdasarkan UU HPP.</p>
      </>
    )
  },
  {
    target: '.tax-type-chip',
    route: '/dashboard/kalkulator',
    placement: 'bottom',
    content: (
      <p className="text-sm text-slate-600">Jangan lupa, Anda bisa mengubah mode perhitungan dengan memilih jenis pajak (PPh 21, PPN, dll) di bagian ini.</p>
    )
  },
  {
    target: '.tour-target-assistant-chat',
    route: '/dashboard/assistant',
    placement: 'left',
    content: (
      <>
        <h3 className="font-bold text-lg text-slate-800 mb-2">Asisten AI Pajak</h3>
        <p className="text-sm text-slate-600">Ruang obrolan pribadi Anda dengan Gemini AI. Tanya apa saja soal regulasi atau cara lapor, ia akan menjawab layaknya konsultan profesional. Selesai!</p>
      </>
    )
  },
];

export default function TourGuide() {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
    const hasSeenTour = localStorage.getItem('myTax_tour_completed');
    
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setRun(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: EventData) => {
    const { action, index, status, type } = data;

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      setRun(false);
      localStorage.setItem('myTax_tour_completed', 'true');
      window.dispatchEvent(new Event('tour_completed'));
      
      if (pathname !== '/dashboard') {
         router.push('/dashboard');
      }
    } else if (([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND] as string[]).includes(type)) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);
      const nextStep = TOUR_STEPS[nextStepIndex];
      const currentStep = TOUR_STEPS[index];
      
      if (nextStep && nextStep.route && currentStep.route && nextStep.route !== currentStep.route) {
        // Halaman berbeda, navigasi dulu
        router.push(nextStep.route);
        // Delay agar DOM halaman baru sempat dirender
        setTimeout(() => setStepIndex(nextStepIndex), 1000);
      } else {
        // Halaman yang sama
        setStepIndex(nextStepIndex);
      }
    }
  };

  if (!isMounted) return null;

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      stepIndex={stepIndex}
      continuous
      scrollToFirstStep
      onEvent={handleJoyrideCallback}
      tooltipComponent={CustomTooltip}
      options={{
        overlayColor: 'rgba(15, 23, 42, 0.75)',
        zIndex: 1000,
        arrowColor: '#ffffff',
      }}
    />
  );
}
