// app/mandrill-email-content/[id]/layout.tsx
export default function EmailContentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ height: '100vh', width: '100vw', padding: 0, margin: 0 }}>
      {children}
    </div>
  );
}