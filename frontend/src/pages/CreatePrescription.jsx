// frontend/src/pages/CreatePrescription.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosInstance";

const emptyMed = { name: "", dosage: "", frequency: "", duration: "", instructions: "" };

const CreatePrescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patient: "",
    diagnosis: "",
    medications: [{ ...emptyMed }],
    notes: "",
    followUpDate: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPatients();
    if (isEdit) fetchPrescription();
  }, [id]);

  const fetchPatients = async () => {
    try {
      const res = await api.get("/auth/patients");
      setPatients(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPrescription = async () => {
    try {
      const res = await api.get(`/prescriptions/${id}`);
      const p = res.data;
      setForm({
        patient: p.patient?._id || "",
        diagnosis: p.diagnosis || "",
        medications: p.medications || [],
        notes: p.notes || "",
        followUpDate: p.followUpDate?.split("T")[0] || "",
        status: p.status || "active",
      });
    } catch (err) {
      setError("Failed to load prescription.");
    }
  };

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleMedChange = (index, e) => {
    const updated = form.medications.map((m, i) =>
      i === index ? { ...m, [e.target.name]: e.target.value } : m
    );
    setForm({ ...form, medications: updated });
  };

  const addMedication = () =>
    setForm({ ...form, medications: [...form.medications, { ...emptyMed }] });

  const removeMedication = (index) =>
    setForm({
      ...form,
      medications: form.medications.filter((_, i) => i !== index),
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.medications.length === 0) {
      return setError("Add at least one medication.");
    }
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/prescriptions/${id}`, form);
      } else {
        await api.post("/prescriptions", form);
      }
      navigate("/doctor");
    } catch (err) {
      setError(err.response?.data?.message || "Save failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? "✏️ Edit Prescription" : "📋 New Prescription"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {isEdit ? "Update the prescription details below." : "Fill in the prescription details."}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700">Patient & Diagnosis</h2>
          <div>
            <label className="label">Select Patient</label>
            <select
              name="patient"
              value={form.patient}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">-- Select Patient --</option>
              {patients.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Diagnosis</label>
            <input
              type="text"
              name="diagnosis"
              value={form.diagnosis}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. Hypertension Stage 1"
              required
            />
          </div>
          {isEdit && (
            <div>
              <label className="label">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          )}
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700">Medications</h2>
            <button
              type="button"
              onClick={addMedication}
              className="text-sm text-secondary hover:underline"
            >
              + Add Medication
            </button>
          </div>

          {form.medications.map((med, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Medication #{i + 1}
                </span>
                {form.medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedication(i)}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Medicine Name</label>
                  <input
                    type="text"
                    name="name"
                    value={med.name}
                    onChange={(e) => handleMedChange(i, e)}
                    className="input-field"
                    placeholder="e.g. Metformin"
                    required
                  />
                </div>
                <div>
                  <label className="label">Dosage</label>
                  <input
                    type="text"
                    name="dosage"
                    value={med.dosage}
                    onChange={(e) => handleMedChange(i, e)}
                    className="input-field"
                    placeholder="e.g. 500mg"
                    required
                  />
                </div>
                <div>
                  <label className="label">Frequency</label>
                  <input
                    type="text"
                    name="frequency"
                    value={med.frequency}
                    onChange={(e) => handleMedChange(i, e)}
                    className="input-field"
                    placeholder="e.g. Twice daily"
                    required
                  />
                </div>
                <div>
                  <label className="label">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={med.duration}
                    onChange={(e) => handleMedChange(i, e)}
                    className="input-field"
                    placeholder="e.g. 30 days"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="label">Special Instructions</label>
                <input
                  type="text"
                  name="instructions"
                  value={med.instructions}
                  onChange={(e) => handleMedChange(i, e)}
                  className="input-field"
                  placeholder="e.g. Take after meals"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700">Additional Info</h2>
          <div>
            <label className="label">Doctor's Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="input-field h-24 resize-none"
              placeholder="Any additional notes or advice..."
            />
          </div>
          <div>
            <label className="label">Follow-up Date</label>
            <input
              type="date"
              name="followUpDate"
              value={form.followUpDate}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading && (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
            )}
            {loading ? "Saving..." : isEdit ? "Update Prescription" : "Create Prescription"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/doctor")}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePrescription;