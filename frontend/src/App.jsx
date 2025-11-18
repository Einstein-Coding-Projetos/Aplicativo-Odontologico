import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import ModeSelectPage from "./pages/ModeSelectPage";
import GamePage from "./pages/GamePage";
import QuizPage from "./pages/QuizPage";
import ProfilePage from "./pages/ProfilePage";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Routes>

          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<ModeSelectPage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/profile" element={<ProfilePage />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
}
