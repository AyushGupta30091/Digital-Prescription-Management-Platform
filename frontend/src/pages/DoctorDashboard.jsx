// frontend/src/pages/DoctorDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const StatCard = ({ icon, label, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`text-4xl p-3 rounded-xl ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get("/prescriptions");
      setPrescriptions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this prescription?")) return;
    try {
      await api.delete(`/prescriptions/${id}`);
      setPrescriptions((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const filtered = prescriptions.filter((p) => {
    const s = search.toLowerCase();
    return (
      p.patient?.name?.toLowerCase().includes(s) ||
      p.diagnosis?.toLowerCase().includes(s)
    );
  });

  const active = prescriptions.filter((p) => p.status === "active").length;
  const uniquePatients = new Set(prescriptions.map((p) => p.patient?._id)).size;

  const statusColors = {
    active: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome, Dr. {user?.name} 👨‍⚕️
          </h1>
          <p className="text-gray-500 text-sm mt-1">{user?.specialization || "General Practitioner"}</p>
        </div>
        <Link to="/prescriptions/new" className="btn-primary flex items-center gap-2">
          <span>+</span> New Prescription
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard icon="📋" label="Total Prescriptions" value={prescriptions.length} color="bg-blue-50" />
        <StatCard icon="✅" label="Active Prescriptions" value={active} color="bg-green-50" />
        <StatCard icon="👥" label="Unique Patients" value={uniquePatients} color="bg-purple-50" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Prescriptions</h2>
          <input
            type="text"
            placeholder="Search patient or diagnosis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field w-64"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">📄</div>
            <p>No prescriptions found.</p>
            <Link to="/prescriptions/new" className="text-secondary hover:underline text-sm mt-2 inline-block">
              Create your first prescription →
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="pb-3 font-medium">Patient</th>
                  <th className="pb-3 font-medium">Diagnosis</th>
                  <th className="pb-3 font-medium">Medications</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50 transition">
                    <td className="py-3 font-medium">{p.patient?.name}</td>
                    <td className="py-3 text-gray-600">{p.diagnosis}</td>
                    <td className="py-3 text-gray-500">{p.medications?.length} med(s)</td>
                    <td className="py-3 text-gray-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize font-medium ${statusColors[p.status]}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/prescriptions/${p._id}/edit`}
                          className="text-secondary hover:underline text-xs"
                        >
                          Edit
                        </Link>
                        <a
                          href={`${import.meta.env.VITE_API_URL}/pdf/${p._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent hover:underline text-xs"
                        >
                          PDF
                        </a>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="text-red-500 hover:underline text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;