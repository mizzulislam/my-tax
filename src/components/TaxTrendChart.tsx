'use client';

import { useState } from 'react';

interface Report {
  id: string;
  tax_year: number;
  tax_period: string;
  gross_income: number;
  tax_payable: number;
  status: string;
  created_at: string;
}

interface TaxTrendChartProps {
  data: Report[];
}

export default function TaxTrendChart({ data }: TaxTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 1. Agregasi data per tahun
  const yearMap: Record<number, { gross: number; tax: number }> = {};
  
  // Mengisi default data agar chart tetap tampil cantik meskipun user baru memiliki 1-2 data
  const defaultYears = [2024, 2025, 2026];
  defaultYears.forEach(y => {
    yearMap[y] = { gross: 0, tax: 0 };
  });

  data.forEach((r) => {
    const yr = Number(r.tax_year);
    if (!isNaN(yr)) {
      if (!yearMap[yr]) {
        yearMap[yr] = { gross: 0, tax: 0 };
      }
      yearMap[yr].gross += r.gross_income;
      yearMap[yr].tax += r.tax_payable;
    }
  });

  // Urutkan tahun secara kronologis
  const sortedYears = Object.keys(yearMap)
    .map(Number)
    .sort((a, b) => a - b);

  const chartData = sortedYears.map((yr) => ({
    year: yr,
    gross: yearMap[yr].gross,
    tax: yearMap[yr].tax,
  }));

  // Jika semua data bernilai 0, kita berikan data visual simulasi sebagai panduan tren awal
  const isAllZero = chartData.every(d => d.gross === 0 && d.tax === 0);
  const displayData = isAllZero 
    ? [
        { year: 2024, gross: 120000000, tax: 6000000 },
        { year: 2025, gross: 180000000, tax: 12000000 },
        { year: 2026, gross: 240000000, tax: 21000000 }
      ]
    : chartData;

  // 2. Kalkulasi Dimensi SVG
  const width = 600;
  const height = 240;
  const paddingLeft = 60;
  const paddingRight = 30;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Max value untuk y-axis scaling
  const maxGross = Math.max(...displayData.map((d) => d.gross));
  const maxTax = Math.max(...displayData.map((d) => d.tax));
  const maxVal = Math.max(maxGross, maxTax, 10000000) * 1.15; // Beri ruang 15% di atas

  // Koordinat titik
  const points = displayData.map((d, index) => {
    const x = paddingLeft + (index / (displayData.length - 1)) * chartWidth;
    const yGross = paddingTop + chartHeight - (d.gross / maxVal) * chartHeight;
    const yTax = paddingTop + chartHeight - (d.tax / maxVal) * chartHeight;
    return { x, yGross, yTax, year: d.year, gross: d.gross, tax: d.tax };
  });

  // Generate SVG Line Paths
  const grossPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yGross}`).join(' ');
  const taxPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.yTax}`).join(' ');

  // Generate SVG Area Path untuk Bruto
  const grossAreaPath = points.length > 0
    ? `${grossPath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  return (
    <div className="relative p-[1px] rounded-3xl overflow-hidden group shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 via-indigo-500/5 to-transparent opacity-50"></div>
      
      <div className="relative bg-slate-900/85 backdrop-blur-2xl p-6 md:p-8 rounded-[23px] space-y-6">
        
        {/* Header Grafik */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              <h3 className="text-lg font-bold text-white tracking-tight">Tren Analisis Perpajakan</h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isAllZero ? 'Visualisasi Data Simulasi Wajib Pajak OP' : 'Perbandingan Komparatif Riwayat Pajak Anda'}
            </p>
          </div>

          {/* Legenda Grafik */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
              <span className="text-slate-300">Pendapatan Bruto</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
              <span className="text-slate-300">PPh Terutang</span>
            </div>
          </div>
        </div>

        {/* CONTAINER SVG UTAMA */}
        <div className="relative overflow-x-auto custom-scrollbar pt-2">
          <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full min-w-[500px] h-auto overflow-visible select-none"
          >
            {/* Gradients */}
            <defs>
              <linearGradient id="grossGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const y = paddingTop + ratio * chartHeight;
              const val = maxVal * (1 - ratio);
              return (
                <g key={index} className="opacity-40">
                  <line 
                    x1={paddingLeft} 
                    y1={y} 
                    x2={width - paddingRight} 
                    y2={y} 
                    stroke="#1e293b" 
                    strokeWidth="1" 
                    strokeDasharray="4 4"
                  />
                  <text 
                    x={paddingLeft - 12} 
                    y={y + 4} 
                    fill="#64748b" 
                    className="text-[9px] font-bold font-mono text-right"
                    textAnchor="end"
                  >
                    Rp {(val / 1000000).toFixed(0)}M
                  </text>
                </g>
              );
            })}

            {/* X-Axis labels */}
            {points.map((p, index) => (
              <text
                key={index}
                x={p.x}
                y={height - 12}
                fill="#64748b"
                className="text-[10px] font-bold font-mono"
                textAnchor="middle"
              >
                {p.year}
              </text>
            ))}

            {/* Area Path (Gross Income) */}
            {grossAreaPath && (
              <path 
                d={grossAreaPath} 
                fill="url(#grossGradient)" 
                className="transition-all duration-300"
              />
            )}

            {/* Line Path - Pendapatan Bruto */}
            <path 
              d={grossPath} 
              fill="none" 
              stroke="#3b82f6" 
              strokeWidth="3.5" 
              strokeLinecap="round"
              className="transition-all duration-300 drop-shadow-[0_2px_8px_rgba(59,130,246,0.3)]"
            />

            {/* Line Path - PPh Terutang */}
            <path 
              d={taxPath} 
              fill="none" 
              stroke="#f43f5e" 
              strokeWidth="3.5" 
              strokeLinecap="round"
              className="transition-all duration-300 drop-shadow-[0_2px_8px_rgba(244,63,94,0.3)]"
            />

            {/* Interactive Hover Vertical Bar & Interactive Dots */}
            {points.map((p, index) => {
              const isHovered = hoveredIndex === index;
              return (
                <g key={index}>
                  {/* Invisible broad column for hover detection */}
                  <rect
                    x={p.x - chartWidth / (displayData.length * 2)}
                    y={paddingTop}
                    width={chartWidth / displayData.length}
                    height={chartHeight}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />

                  {/* Hover Guide Line */}
                  {isHovered && (
                    <line
                      x1={p.x}
                      y1={paddingTop}
                      x2={p.x}
                      y2={paddingTop + chartHeight}
                      stroke="#475569"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Gross Dot */}
                  <circle
                    cx={p.x}
                    cy={p.yGross}
                    r={isHovered ? 6 : 4}
                    fill="#3b82f6"
                    stroke="#1e293b"
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    className="transition-all duration-200"
                  />

                  {/* Tax Dot */}
                  <circle
                    cx={p.x}
                    cy={p.yTax}
                    r={isHovered ? 6 : 4}
                    fill="#f43f5e"
                    stroke="#1e293b"
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    className="transition-all duration-200"
                  />
                </g>
              );
            })}
          </svg>

          {/* Interactive Floating Tooltip (Glassmorphism card) */}
          <div 
            className={`absolute top-4 left-[64px] bg-slate-950/90 backdrop-blur-md border border-slate-800 p-4.5 rounded-2xl shadow-xl transition-all duration-300 space-y-2.5 w-60 pointer-events-none ${hoveredIndex !== null ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
          >
            {hoveredIndex !== null && (
              <>
                <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tahun Laporan</span>
                  <span className="text-xs font-black text-white font-mono">{displayData[hoveredIndex].year}</span>
                </div>
                
                <div className="space-y-1.5 text-xs font-semibold">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Bruto:</span>
                    <span className="text-blue-400 font-mono">Rp {displayData[hoveredIndex].gross.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">PPh:</span>
                    <span className="text-rose-400 font-mono">Rp {displayData[hoveredIndex].tax.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
