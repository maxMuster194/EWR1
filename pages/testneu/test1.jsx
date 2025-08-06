"use client";

import React from "react";

const App = () => {
  console.log("Component loaded, checking for icons...");
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
        crossOrigin="anonymous"
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "#f0f4f8",
          fontFamily: '"Manrope", "Noto Sans", sans-serif"',
          margin: 0,
          padding: 0,
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "1rem",
            backgroundColor: "#4372b7",
            color: "white",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            borderBottom: "2px solid #905fa4",
            position: "sticky",
            top: 0,
            zIndex: 1000,
          }}
        >
          <img
            src="/logo-placeholder.png"
            alt="Lewis Jeans Logo"
            style={{
              maxWidth: "100%",
              height: "auto",
              maxHeight: "60px",
              objectFit: "contain",
            }}
          />
        </header>

        <div
          style={{
            display: "flex",
            flex: "1",
            width: "100%",
          }}
        >
          <aside
            style={{
              width: "64px",
              backgroundColor: "#4372b7",
              color: "white",
              boxShadow: "2px 0 4px rgba(0, 0, 0, 0.1)",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "0.5rem",
            }}
          >
            <nav
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
                width: "100%",
              }}
            >
              {[
                { href: "/home", icon: "fa-home", label: "Home" },
                { href: "/preise", icon: "fa-dollar-sign", label: "Preise" },
                { href: "/rechner", icon: "fa-calculator", label: "Rechner" },
                { href: "/details-rechner", icon: "fa-list", label: "Details" },
                { href: "/hilfe", icon: "fa-question-circle", label: "Hilfe" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.5rem",
                    borderRadius: "0.5rem",
                    color: "white",
                    textDecoration: "none",
                    transition: "background-color 0.3s",
                    width: "100%",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#905fa4")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <i className={`fas ${item.icon}`} style={{ fontSize: "20px" }}></i>
                  <span style={{ fontSize: "0.75rem", fontWeight: "500" }}>
                    {item.label}
                  </span>
                </a>
              ))}
            </nav>
          </aside>

          <main
            style={{
              flex: "1",
              padding: "1.5rem",
              backgroundColor: "#ffffff",
              borderRadius: "0.5rem",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              border: "1px solid #4372b7",
              margin: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            <h1>Willkommen!</h1>
            <p>Hier ist dein Hauptinhalt.</p>
          </main>
        </div>

        <footer
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "1rem 1.5rem",
            backgroundColor: "#4372b7",
            color: "white",
            boxShadow: "0 -2px 4px rgba(0, 0, 0, 0.1)",
            borderTop: "2px solid #905fa4",
          }}
        >
          <p style={{ fontSize: "0.875rem" }}>© 2025 Energiemanager</p>
        </footer>

        <style>
          {`
            * {
              box-sizing: border-box;
            }
            body {
              margin: 0;
            }
            @media (max-width: 768px) {
              aside {
                display: none;
              }
              main {
                margin: 0;
                border-radius: 0;
                border: none;
                box-shadow: none;
              }
            }
          `}
        </style>
      </div>
    </>
  );
};

export default App;
