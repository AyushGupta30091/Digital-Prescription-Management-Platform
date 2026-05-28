// backend/routes/pdfRoutes.js
const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const Prescription = require("../models/Prescription");
const { protect } = require("../middleware/auth");

// @GET /api/pdf/:id  — streams a PDF of the prescription
router.get("/:id", protect, async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate("doctor", "name email specialization phone")
      .populate("patient", "name email phone");

    if (!prescription)
      return res.status(404).json({ message: "Prescription not found" });

    const isDoctor =
      req.user?.role === "doctor" &&
      prescription.doctor._id.toString() === req.user._id.toString();
    const isPatient =
      req.user?.role === "patient" &&
      prescription.patient._id.toString() === req.user._id.toString();

    if (!isDoctor && !isPatient)
      return res.status(403).json({ message: "Access denied" });

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=prescription_${prescription._id}.pdf`
    );

    doc.pipe(res);

    // Header
    doc
      .fontSize(22)
      .fillColor("#1a5276")
      .text("Digital Prescription", { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .fillColor("#555")
      .text(`Issued on: ${new Date(prescription.createdAt).toLocaleDateString()}`, {
        align: "center",
      });
    doc.moveDown(1);

    // Divider
    doc.moveTo(50, doc.y).lineTo(560, doc.y).strokeColor("#aaaaaa").stroke();
    doc.moveDown(1);

    // Doctor Info
    doc.fontSize(13).fillColor("#1a5276").text("Doctor Information");
    doc.moveDown(0.3);
    doc
      .fontSize(11)
      .fillColor("#333")
      .text(`Name: Dr. ${prescription.doctor.name}`)
      .text(`Specialization: ${prescription.doctor.specialization || "General"}`)
      .text(`Email: ${prescription.doctor.email}`)
      .text(`Phone: ${prescription.doctor.phone || "N/A"}`);
    doc.moveDown(1);

    // Patient Info
    doc.fontSize(13).fillColor("#1a5276").text("Patient Information");
    doc.moveDown(0.3);
    doc
      .fontSize(11)
      .fillColor("#333")
      .text(`Name: ${prescription.patient.name}`)
      .text(`Email: ${prescription.patient.email}`)
      .text(`Phone: ${prescription.patient.phone || "N/A"}`);
    doc.moveDown(1);

    // Diagnosis
    doc.fontSize(13).fillColor("#1a5276").text("Diagnosis");
    doc.moveDown(0.3);
    doc.fontSize(11).fillColor("#333").text(prescription.diagnosis);
    doc.moveDown(1);

    // Medications
    doc.fontSize(13).fillColor("#1a5276").text("Medications");
    doc.moveDown(0.3);

    prescription.medications.forEach((med, i) => {
      doc
        .fontSize(11)
        .fillColor("#222")
        .text(`${i + 1}. ${med.name}`, { continued: false });
      doc
        .fontSize(10)
        .fillColor("#555")
        .text(`   Dosage: ${med.dosage}  |  Frequency: ${med.frequency}  |  Duration: ${med.duration}`);
      if (med.instructions)
        doc.text(`   Instructions: ${med.instructions}`);
      doc.moveDown(0.3);
    });

    // Notes
    if (prescription.notes) {
      doc.moveDown(0.5);
      doc.fontSize(13).fillColor("#1a5276").text("Doctor's Notes");
      doc.moveDown(0.3);
      doc.fontSize(11).fillColor("#333").text(prescription.notes);
    }

    // Follow Up
    if (prescription.followUpDate) {
      doc.moveDown(0.5);
      doc.fontSize(13).fillColor("#1a5276").text("Follow-up Date");
      doc.moveDown(0.3);
      doc
        .fontSize(11)
        .fillColor("#333")
        .text(new Date(prescription.followUpDate).toLocaleDateString());
    }

    doc.moveDown(2);
    doc
      .fontSize(10)
      .fillColor("#aaa")
      .text("This is a digitally generated prescription.", { align: "center" });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;