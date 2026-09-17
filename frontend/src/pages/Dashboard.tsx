import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Dashboard</h1>
      <p>You're logged in.</p>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
}