import { useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router";

const apiBase = "http://localhost:3000/api";

export function CheckUser() {
  const user = localStorage.getItem("user");

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

async function postLogin(userName: string) {
  try {
    const response = await fetch(`${apiBase}/users`, {
      method: "POST",
      body: JSON.stringify({ name: userName, role: "researcher" }),
    });

    const result = await response.json();

    return result;
  } catch (error: any) {
    console.error(error.message);
  }
}

export function Login() {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    const user = await postLogin(userName);
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
