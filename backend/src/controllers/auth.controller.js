const { env } = require("../config/env");
const { registerDoctor, loginDoctor, loginPatient, signToken } = require("../services/auth.service");

function sendToken(res, token) {
  if (env.USE_AUTH_COOKIE) {
    res.cookie(env.COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ success: true, data: { token: null, mode: "cookie" } });
  }
  return res.json({ success: true, data: { token, mode: "bearer" } });
}

async function registerDoctorHandler(req, res, next) {
  try {
    const user = await registerDoctor(req.body);
    const token = signToken(user);
    return sendToken(res, token);
  } catch (e) {
    next(e);
  }
}

async function loginDoctorHandler(req, res, next) {
  try {
    const user = await loginDoctor(req.body);
    const token = signToken(user);
    return sendToken(res, token);
  } catch (e) {
    next(e);
  }
}

async function loginPatientHandler(req, res, next) {
  try {
    const { user, patient } = await loginPatient(req.body);
    const token = signToken(user);
    return sendToken(res, token);
  } catch (e) {
    next(e);
  }
}

async function meHandler(req, res) {
  return res.json({ success: true, data: { user: req.user } });
}

async function logoutHandler(req, res) {
  if (env.USE_AUTH_COOKIE) {
    res.clearCookie(env.COOKIE_NAME);
  }
  return res.json({ success: true, data: { ok: true } });
}

module.exports = {
  registerDoctorHandler,
  loginDoctorHandler,
  loginPatientHandler,
  meHandler,
  logoutHandler,
};
