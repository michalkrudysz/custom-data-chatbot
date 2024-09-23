import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard!</p>
      <button onClick={handleLogout}>Wyloguj</button>
    </div>
  );
}
