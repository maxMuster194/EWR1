import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4">
        <h1 className="text-2xl font-bold">Meine Webseite</h1>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 text-white p-4">
          <h2 className="text-lg font-semibold mb-4">Navigation</h2>
          <ul>
            <li className="mb-2"><a href="/" className="hover:text-blue-300">Home</a></li>
            <li className="mb-2"><a href="/about" className="hover:text-blue-300">Über</a></li>
            <li className="mb-2"><a href="/contact" className="hover:text-blue-300">Kontakt</a></li>
          </ul>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 flex gap-4">
          {children ? children : (
            <>
              <section className="flex-1 bg-gray-100 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Bereich 1</h2>
                <p>Hier ist der Inhalt des ersten Body-Bereichs. Dieser Bereich kann Texte, Bilder oder andere Inhalte enthalten.</p>
              </section>
              <section className="flex-1 bg-gray-100 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2">Bereich 2</h2>
                <p>Hier ist der Inhalt des zweiten Body-Bereichs. Beide Bereiche sind nebeneinander angeordnet.</p>
              </section>
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-blue-600 text-white p-4 text-center">
        <p>© 2025 Meine Webseite. Alle Rechte vorbehalten.</p>
      </footer>
    </div>
  );
};

export default Layout;