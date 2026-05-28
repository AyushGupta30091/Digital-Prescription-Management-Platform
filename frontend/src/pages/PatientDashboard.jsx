// frontend/src/pages/PatientDashboard.jsx
import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const PatientDashboard = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "", startDate: "", endDate: "", search: "" });

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.startDate) params.startDate = filter.startDate;
      if (filter.endDate) params.endDate = filter.endDate;
      if (filter.search) params.search = filter.search;
      const res = await api.get("/prescriptions", { params });
      setPrescriptions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) =>
    setFilter({ ...filter, [e.target.name]: e.target.value });

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPrescriptions();
  };

  const filtered = prescriptions;

  const statusColors = {
    active: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Prescriptions 🏥</h1>
        <p className="text-gray-500 text-sm mt-1">Hello, {user?.name}. Here's your prescription history.</p>
      </div>

      <div className="card mb-6">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-40">
            <label className="label">Search</label>
            <input
              type="text"
              name="search"
              value={filter.search}
              onChange={handleFilterChange}
              placeholder="Doctor name or diagnosis..."
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              name="status"
              value={filter.status}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="label">From</label>
            <input
              type="date"
              name="startDate"
              value={filter.startDate}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">To</label>
            <input
              type="date"
              name="endDate"
              value={filter.endDate}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>
          <button type="submit" className="btn-primary">
            Filter
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <div className="text-5xl mb-3">💊</div>
          <p>No prescriptions found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => (
            <div key={p._id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-800">{p.diagnosis}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${statusColors[p.status]}`}>
                      {p.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-1">
                    👨‍⚕️ Dr. {p.doctor?.name}
                    {p.doctor?.specialization && ` — ${p.doctor.specialization}`}
                  </p>
                  <p className="text-sm text-gray-400">
                    📅 {new Date(p.createdAt).toLocaleDateString()}
                    {p.followUpDate && (
                      <span className="ml-3">
                        🔁 Follow-up: {new Date(p.followUpDate).toLocaleDateString()}
                      </span>
                    )}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.medications?.map((med, i) => (
                      <span key={i} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                        💊 {med.name} — {med.dosage}
                      </span>
                    ))}
                  </div>

                  {p.notes && (
                    <p className="text-sm text-gray-500 mt-2 italic">📝 {p.notes}</p>
                  )}
                </div>

                <a
                  href={`${import.meta.env.VITE_API_URL}/pdf/${p._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-4 btn-primary text-sm flex items-center gap-1 whitespace-nowrap"
                >
                  ⬇ Download PDF
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;