
import React from 'react';

const Layout = ({ children }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif',
      width: '100vw',
      margin: 0,
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#2563eb', // Tailwind bg-blue-600
        color: 'white',
        padding: '16px', // Tailwind p-4
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Meine Webseite</h1>
      </header>

      <div style={{
        display: 'flex',
        flex: 1,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Sidebar */}
        <aside style={{
          width: '256px', // Tailwind w-64
          backgroundColor: '#1f2937', // Tailwind bg-gray-800
          color: 'white',
          padding: '16px', // Tailwind p-4
          boxSizing: 'border-box'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Navigation</h2>
          <ul>
            <li style={{ marginBottom: '8px' }}>
              <a href="#" style={{ color: 'white', textDecoration: 'none' }} onMouseOver={e => e.target.style.color = '#93c5fd'} onMouseOut={e => e.target.style.color = 'white'}>Home</a>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <a href="#" style={{ color: 'white', textDecoration: 'none' }} onMouseOver={e => e.target.style.color = '#93c5fd'} onMouseOut={e => e.target.style.color = 'white'}>Über</a>
            </li>
            <li style={{ marginBottom: '8px' }}>
              <a href="#" style={{ color: 'white', textDecoration: 'none' }} onMouseOver={e => e.target.style.color = '#93c5fd'} onMouseOut={e => e.target.style.color = 'white'}>Kontakt</a>
            </li>
          </ul>
        </aside>

        {/* Main Content */}
        <main style={{
          flex: 1,
          padding: '16px', // Tailwind p-4
          display: 'flex',
          gap: '16px', // Tailwind gap-4
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {children ? children : (
            <>
              <section style={{
                flex: 1,
                backgroundColor: '#f3f4f6', // Tailwind bg-gray-100
                padding: '16px', // Tailwind p-4
                borderRadius: '8px' // Tailwind rounded-lg
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Bereich 1</h2>
                <p>Hier ist der Inhalt des ersten Body-Bereichs. Dieser Bereich kann Texte, Bilder oder andere Inhalte enthalten.</p>
              </section>
              <section style={{
                flex: 1,
                backgroundColor: '#f3f4f6', // Tailwind bg-gray-100
                padding: '16px', // Tailwind p-4
                borderRadius: '8px' // Tailwind rounded-lg
              }}>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Bereich 2</h2>
                <p>Hier ist der Inhalt des zweiten Body-Bereichs. Beide Bereiche sind nebeneinander angeordnet.</p>
              </section>
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#2563eb', // Tailwind bg-blue-600
        color: 'white',
        padding: '16px', // Tailwind p-4
        textAlign: 'center',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <p>© 2025 Meine Webseite. Alle Rechte vorbehalten.</p>
      </footer>
    </div>
  );
};

export default Layout;
