import { Outlet } from "react-router-dom";
import logoHJE from "../assets/HJE2.ico";

export default function PublicLayout() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F3F4F6",
        fontFamily: "'Baloo 2', sans-serif"
      }}
    >

      {/* HEADER FIXO EM CIMA */}
      <header
        style={{
          backgroundColor: "white",
          padding: "20px",
          textAlign: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          fontWeight: "800",
          fontSize: "3.0rem",
          color: "#0ea5e9"
        }}
      >
        OdontoGame
      </header>

      {/* CONTEÚDO CENTRAL */}
      <main
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px"
        }}
      >
        <Outlet />
      </main>

      {/* FOOTER FIXO EMBAIXO */}
      <footer
        style={{
          backgroundColor: "white",
          borderTop: "1px solid #e5e7eb",
          padding: "20px",
          textAlign: "center"
        }}
      >
        <div
          style={{
            opacity: 0.6,
            fontSize: "0.8rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            color: "#64748b"
          }}
        >
          <span>Desenvolvido por Healthtech Júnior Einstein</span>
          <img src={logoHJE} alt="HJE" style={{ height: "24px" }} />
        </div>
      </footer>

    </div>
  );
}