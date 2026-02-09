const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { env } = require("../config/env");
const User = require("../models/User");
const Patient = require("../models/Patient");

function signToken(user) {
  return jwt.sign(
    { 
      role: user.userType, 
      name: user.name,
      email: user.email,
      linkedPatientId: user.linkedPatientId || null 
    },
    env.JWT_SECRET,
    { subject: user._id.toString(), expiresIn: env.JWT_EXPIRES_IN }
  );
}

async function registerDoctor({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("Email already registered");
    err.statusCode = 409;
    throw err;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, passwordHash, userType: "doctor" });
  return user;
}

async function loginDoctor({ email, password }) {
  const user = await User.findOne({ email, userType: "doctor" }).select("+passwordHash");
  if (!user) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }
  return user;
}

async function loginPatient({ patientId, password }) {
  const patient = await Patient.findOne({ patientId });
  if (!patient) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }
  const user = await User.findOne({ userType: "patient", linkedPatientId: patient._id }).select("+passwordHash");
  if (!user) {
    const err = new Error("Patient login not enabled");
    err.statusCode = 404;
    throw err;
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const err = new Error("Invalid credentials");
    err.statusCode = 401;
    throw err;
  }
  return { user, patient };
}

module.exports = { registerDoctor, loginDoctor, loginPatient, signToken };
