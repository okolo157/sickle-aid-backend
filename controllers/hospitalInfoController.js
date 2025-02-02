const express = require("express");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const HospitalInfo = require("../models/HospitalInfo"); // Import the HospitalInfo model
const User = require("../models/User"); // Import the User model
const nodemailer = require("nodemailer"); // Import nodemailer for email sending

const router = express.Router();

exports.addHospital = [
  body("userId").notEmpty().withMessage("User ID is required"),
  body("hospitalName").notEmpty().withMessage("Hospital name is required"),
  body("hospitalAddress")
    .notEmpty()
    .withMessage("Hospital address is required"),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, hospitalName, hospitalAddress, patientId, hospitalNumber } =
      req.body;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const hospitalInfo = new HospitalInfo({
        userId,
        hospitalName,
        hospitalAddress,
        patientId: patientId || null,
        hospitalNumber: hospitalNumber || null,
      });

      await hospitalInfo.save();
      res.status(201).json({
        message: "Hospital information saved successfully",
        hospitalInfo,
      });
    } catch (error) {
      console.error("Error saving hospital info:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

exports.updateHospital = [
  body("userId").notEmpty().withMessage("User ID is required"),
  body("hospitalName").notEmpty().withMessage("Hospital name is required"),
  body("hospitalAddress")
    .notEmpty()
    .withMessage("Hospital address is required"),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, hospitalName, hospitalAddress, patientId, hospitalNumber } =
      req.body;

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let hospitalInfo = await HospitalInfo.findOne({ userId });

      if (!hospitalInfo) {
        return res
          .status(404)
          .json({ message: "No hospital information found for this user" });
      }

      hospitalInfo.hospitalName = hospitalName;
      hospitalInfo.hospitalAddress = hospitalAddress;
      hospitalInfo.patientId = patientId || hospitalInfo.patientId;
      hospitalInfo.hospitalNumber =
        hospitalNumber || hospitalInfo.hospitalNumber;
      hospitalInfo.updatedAt = Date.now();

      await hospitalInfo.save();
      res.status(200).json({
        message: "Hospital information updated successfully",
        hospitalInfo,
        userId,
      });
    } catch (error) {
      console.error("Error updating hospital info:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];

exports.getHospital = [
  async (req, res) => {
    const { userId } = req.params;

    try {
      const hospitalInfo = await HospitalInfo.findOne({ userId });

      if (!hospitalInfo) {
        return res
          .status(404)
          .json({ message: "Hospital information not found" });
      }

      return res.status(200).json(hospitalInfo);
    } catch (error) {
      console.error("Error fetching hospital information:", error);
      return res.status(500).json({
        message: "There was an error fetching the hospital information.",
      });
    }
  },
];

exports.sendSOSAlert = [
  async (req, res) => {
    const { userId } = req.params;

    try {
      // Retrieve user data using the userId
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const hospitalInfo = await HospitalInfo.findOne({ userId });
      if (!hospitalInfo) {
        return res
          .status(404)
          .json({ message: "Hospital information not found" });
      }

      // Sending the SOS alert email to the hospital
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const hospitalEmail = "luxestridesfootwear@gmail.com";

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: hospitalEmail,
        subject: "SOS Alert: Prepare for Incoming Patient",
        text: `Dear ${
          hospitalInfo.hospitalName
        } Team,\n\nAn emergency alert has been triggered by the following patient:\n\nPatient Name: ${
          user.username || "N/A"
        }\nPatient Email: ${user.email}\nPatient Phone: ${
          user.phoneNumber || "N/A"
        }\nPatient Blood Group: ${
          user.bloodGroup || "N/A"
        }\nPatient Allergies: ${user.allergies || "N/A"}\nPatient Medication: ${
          user.medication || "N/A"
        }\n\nHospital Information:\nHospital Name: ${
          hospitalInfo.hospitalName || "N/A"
        }\nHospital Address: ${
          hospitalInfo.hospitalAddress || "N/A"
        }\nHospital Contact: ${
          hospitalInfo.hospitalNumber || "N/A"
        }\n\nPlease prepare accordingly to attend to this patient immediately at the hospital's location: ${
          hospitalInfo.hospitalAddress
        }. You may try to contact the patient at their phone number ${
          user.phoneNumber || "N/A"
        }.\n\nBest Regards,\nSickle Aid Team`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("Error sending email: ", error);
          return res.status(500).json({ message: "Error sending email" });
        } else {
          console.log("Email sent: " + info.response);
          return res
            .status(200)
            .json({ message: "SOS alert sent successfully" });
        }
      });
    } catch (error) {
      console.error("Error triggering SOS alert:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
];
