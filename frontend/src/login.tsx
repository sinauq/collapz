import { useState } from "react";
import { Navigate, Outlet, useNavigate } from "react-router";
import { useFetch } from "./hooks/use-fetch";
import { apiBase } from "./apiRequests";

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

  const { execute } = useFetch();

  async function handleLogin() {
    const user = await execute(`${apiBase}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: userName, role: "researcher" }),
    });

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }
    console.log("got user", user);
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
