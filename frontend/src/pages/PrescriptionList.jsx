// frontend/src/pages/PrescriptionList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

const PrescriptionList = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/prescriptions")
      .then((res) => setPrescriptions(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Prescriptions</h1>
      {prescriptions.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">
          <p>No prescriptions yet.</p>
          {user?.role === "doctor" && (
            <Link to="/prescriptions/new" className="text-secondary hover:underline mt-2 inline-block">
              Create one →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((p) => (
            <div key={p._id} className="card flex justify-between items-center">
              <div>
                <p className="font-medium">{p.diagnosis}</p>
                <p className="text-sm text-gray-500">
                  Patient: {p.patient?.name} | Doctor: Dr. {p.doctor?.name}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(p.createdAt).toLocaleDateString()}
                </p>
              </div>
              <a
                href={`${import.meta.env.VITE_API_URL}/pdf/${p._id}`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary text-sm"
              >
                ⬇ PDF
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrescriptionList;