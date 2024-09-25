import classes from "./Dashboard.module.scss";
import { useNavigate } from "react-router-dom";
import Chat from "../components/Chat";
import Footer from "../components/Footer";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className={classes.dashboard}>
      <button onClick={handleLogout} className={classes.logout}>
        Wyloguj
      </button>
      <div className={classes["settings-container"]}></div>
      <div className={classes["test-chat"]}>
        <Chat />
      </div>
      <Footer />
    </div>
  );
}
