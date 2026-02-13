import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="public-container">
      <div className="public-card">
        <h2>🦷 OdontoGame</h2>
        <Outlet />
      </div>
    </div>
  );
}
