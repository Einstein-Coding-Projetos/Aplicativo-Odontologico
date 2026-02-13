import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Questionario from "./pages/Questionario";
import Jogo from "./pages/Jogo";
import Perfil from "./pages/Perfil";
import Register from "./pages/Register";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/questionario" element={<Questionario />} />
          <Route path="/jogo" element={<Jogo />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;


