import DecryptedText from '@/components/DecryptedText'

/** Label kecil bergaya terminal: "01 / LAYANAN" dengan efek dekripsi saat terlihat. */
export default function Eyebrow({ no, children, dark = false }: { no?: string; children: string; dark?: boolean }) {
  return (
    <p className={`font-mono text-xs tracking-[0.22em] uppercase ${dark ? 'text-sky-300' : 'text-brand-600'}`}>
      {no && <span className={dark ? 'text-white/40' : 'text-slate-400'}>{no} /&nbsp;</span>}
      <DecryptedText
        text={children}
        animateOn="view"
        sequential
        speed={45}
        maxIterations={10}
        characters="01<>/_#"
        encryptedClassName={dark ? 'text-white/30' : 'text-slate-300'}
      />
    </p>
  )
}
