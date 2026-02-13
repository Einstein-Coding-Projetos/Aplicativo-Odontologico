import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function PrivateRoute() {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <p>Carregando...</p>;

    return user ? <Outlet /> : <Navigate to="/" />;

}
