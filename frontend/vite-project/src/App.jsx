import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Questionario from "./pages/Questionario";
import Jogo from "./pages/Jogo";
import Perfil from "./pages/Perfil";
import Register from "./pages/Register";

import PublicLayout from "./components/PublicLayout";
import PrivateLayout from "./components/PrivateLayout";

function App() {
  return (
    <AuthProvider>
      <Routes>

        {/* ROTAS PÚBLICAS */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* ROTAS PRIVADAS */}
        <Route element={<PrivateRoute />}>
          <Route element={<PrivateLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/questionario" element={<Questionario />} />
            <Route path="/jogo" element={<Jogo />} />
            <Route path="/perfil" element={<Perfil />} />
          </Route>
        </Route>

      </Routes>
    </AuthProvider>
  );
}

export default App;

