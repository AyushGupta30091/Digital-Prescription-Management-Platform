// frontend/src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
          <span>💊</span>
          <span>RxPlatform</span>
        </Link>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm">
              {user.name}{" "}
              <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full capitalize ml-1">
                {user.role}
              </span>
            </span>
            {user.role === "doctor" && (
              <>
                <Link to="/doctor" className="text-sm hover:text-blue-200 transition">Dashboard</Link>
                <Link to="/prescriptions/new" className="text-sm hover:text-blue-200 transition">New Rx</Link>
              </>
            )}
            {user.role === "patient" && (
              <Link to="/patient" className="text-sm hover:text-blue-200 transition">My Prescriptions</Link>
            )}
            <button
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-sm px-3 py-1.5 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;