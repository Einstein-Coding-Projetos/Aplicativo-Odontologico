import { Outlet } from "react-router-dom";
import logoHJE from "../assets/HJE2.ico";

export default function PublicLayout() {
  return (
    <div className="public-container">
      <div className="public-card">
        <h2>🦷 OdontoGame</h2>
        <Outlet />
      </div>

      <footer style={{ marginTop: "20px", textAlign: "center", color: "#666", fontSize: "0.8rem", opacity: 0.8 }}>
         <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span>Desenvolvido por Healthtech Júnior Einstein</span>
            <img src={logoHJE} alt="HJE" style={{ height: "20px", opacity: 0.8 }} />
         </div>
      </footer>
    </div>
  );
}
