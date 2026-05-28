interface MaskedTaxDataProps {
  encryptedValue: string | null | undefined;
  type: 'nik' | 'npwp';
  userId: string;
}

export const MaskedTaxData: React.FC<MaskedTaxDataProps> = ({ encryptedValue, type, userId }) => {
  const getMaskedPlaceholder = () => {
    if (!encryptedValue) return 'Belum diisi';
    return type === 'nik' 
      ? '3273***********' 
      : '01.***.***.*-***.***';
  };

  return (
    <div className="flex items-center gap-2 font-mono text-sm">
      <span
        className="tracking-wider text-slate-300 bg-slate-950/70 border border-slate-800 px-2 py-1 rounded-lg"
        title={`Data ${type.toUpperCase()} disamarkan untuk user ${userId}`}
      >
        {getMaskedPlaceholder()}
      </span>
      {encryptedValue && (
        <span
          className="px-2 py-1 text-[10px] rounded-lg font-sans font-black uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/20"
          title="Fitur lihat data lengkap sementara dinonaktifkan sampai consent dan audit siap."
        >
          Masked
        </span>
      )}
    </div>
  );
};
