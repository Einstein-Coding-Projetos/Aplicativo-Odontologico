import { Outlet, Link } from "react-router-dom";

export default function PrivateLayout() {
  return (
    <div className="private-wrapper">

      <header className="private-header">
        🦷 OdontoGame
      </header>

      <div className="private-body">

        <aside className="sidebar">
          <Link to="/home">🏠 Home</Link>
          <Link to="/questionario">📋 Questionário</Link>
          <Link to="/jogo">🎮 Jogo</Link>
          <Link to="/perfil">👤 Perfil</Link>
        </aside>

        <main className="private-content">
          <Outlet />
        </main>

      </div>
    </div>
  );
}

