import { useNavigate } from "react-router-dom";

export default function ModeSelectPage() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("odonto_session");
    navigate("/login", { replace: true });
  }

  return (
    <div>
      {/* ...seu conteúdo da Home... */}
      <button onClick={handleLogout}>Sair</button>
    </div>
  );
}