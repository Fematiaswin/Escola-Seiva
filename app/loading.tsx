export default function Loading() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--seiva-cream)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          border: '3px solid var(--seiva-light)',
          borderTopColor: 'var(--seiva-medium)',
          animation: 'spin 0.7s linear infinite',
        }} />
        <p style={{ color: 'var(--seiva-muted)', fontSize: '0.9375rem', fontWeight: 500 }}>
          Carregando...
        </p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
