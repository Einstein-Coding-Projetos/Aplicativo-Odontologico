import React from "react";
import { useNavigate } from "react-router-dom";

export default function ModeSelectPage() {
  const navigate = useNavigate();
  const [welcome, setWelcome] = React.useState("");

  React.useEffect(() => {
    const raw = localStorage.getItem("odonto_session");
    if (!raw) return;
    const s = JSON.parse(raw);
    if (s?.welcome) {
      setWelcome(s.welcome);
      // limpa a mensagem para não reaparecer
      const { welcome, ...rest } = s;
      localStorage.setItem("odonto_session", JSON.stringify(rest));
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("odonto_session");
    navigate("/login", { replace: true });
  }

  return (
    <div style={{ padding: 24 }}>
      {welcome && (
        <div
          role="status"
          aria-live="polite"
          style={{
            marginBottom: 16,
            padding: "10px 12px",
            borderRadius: 12,
            background: "#E9F2F9",
            border: "1px solid #2C76A3",
            color: "#1d2230",
            fontWeight: 600,
          }}
        >
          {welcome}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: 0 }}>O que você quer fazer hoje?</h1>
        <button
          onClick={handleLogout}
          aria-label="Sair e voltar ao login"
          style={{
            height: 40, padding: "0 14px", borderRadius: 12,
            border: "1px solid #d1d5db", background: "white",
            color: "#1d2230", fontWeight: 600, cursor: "pointer"
          }}
        >
          Sair
        </button>
      </div>

      {/* resto da Home */}
    </div>
  );
}