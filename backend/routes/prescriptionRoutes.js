// backend/routes/prescriptionRoutes.js
const express = require("express");
const router = express.Router();
const Prescription = require("../models/Prescription");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/roles");

// @POST /api/prescriptions  (doctor only)
router.post("/", protect, authorizeRoles("doctor"), async (req, res) => {
  const { patient, diagnosis, medications, notes, followUpDate } = req.body;
  try {
    const prescription = await Prescription.create({
      doctor: req.user._id,
      patient,
      diagnosis,
      medications,
      notes,
      followUpDate,
    });
    const populated = await prescription.populate([
      { path: "doctor", select: "name email specialization" },
      { path: "patient", select: "name email phone" },
    ]);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/prescriptions  (doctor sees all theirs; patient sees own)
router.get("/", protect, async (req, res) => {
  try {
    const { search, status, startDate, endDate } = req.query;
    let query = {};

    if (req.user.role === "doctor") {
      query.doctor = req.user._id;
    } else {
      query.patient = req.user._id;
    }

    if (status) query.status = status;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      const matchingUsers = await User.find({
        name: { $regex: search, $options: "i" },
      }).select("_id");
      const userIds = matchingUsers.map((u) => u._id);

      query.$or = [
        { diagnosis: { $regex: search, $options: "i" } },
        { doctor: { $in: userIds } },
        { patient: { $in: userIds } },
      ];
    }

    let prescriptions = await Prescription.find(query)
      .populate("doctor", "name email specialization")
      .populate("patient", "name email phone")
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @GET /api/prescriptions/:id
router.get("/:id", protect, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("doctor", "name email specialization phone")
      .populate("patient", "name email phone");

    if (!prescription)
      return res.status(404).json({ message: "Prescription not found" });

    const isDoctor =
      req.user.role === "doctor" &&
      prescription.doctor._id.toString() === req.user._id.toString();
    const isPatient =
      req.user.role === "patient" &&
      prescription.patient._id.toString() === req.user._id.toString();

    if (!isDoctor && !isPatient)
      return res.status(403).json({ message: "Access denied" });

    res.json(prescription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @PUT /api/prescriptions/:id  (doctor only)
router.put("/:id", protect, authorizeRoles("doctor"), async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription)
      return res.status(404).json({ message: "Prescription not found" });

    if (prescription.doctor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your prescription" });

    const { diagnosis, medications, notes, followUpDate, status } = req.body;
    if (diagnosis) prescription.diagnosis = diagnosis;
    if (medications) prescription.medications = medications;
    if (notes !== undefined) prescription.notes = notes;
    if (followUpDate) prescription.followUpDate = followUpDate;
    if (status) prescription.status = status;

    await prescription.save();
    const updated = await prescription.populate([
      { path: "doctor", select: "name email specialization" },
      { path: "patient", select: "name email phone" },
    ]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @DELETE /api/prescriptions/:id  (doctor only)
router.delete("/:id", protect, authorizeRoles("doctor"), async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id);
    if (!prescription)
      return res.status(404).json({ message: "Prescription not found" });

    if (prescription.doctor.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your prescription" });

    await prescription.deleteOne();
    res.json({ message: "Prescription deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;