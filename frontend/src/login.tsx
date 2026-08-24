import { useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router";
import { postLogin, useFetch } from "./api";

export function CheckUser() {
  const user = localStorage.getItem("user");

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export function Login() {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    const [user] = useFetch(postLogin(userName));

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
    navigate("/notes");
  }

  return (
    <div>
      <h1>Login</h1>
      <input
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        placeholder="Your Name"
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
