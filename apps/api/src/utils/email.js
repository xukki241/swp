import nodemailer from "nodemailer";

import config from "../config/environment.js";

import logger from "./logger.js";

/**
 * Create email transporter
 * Configure with your email service credentials
 */
const createTransporter = () => {
  // Try to send real emails if credentials are configured
  // Works in both development and production if SMTP is set up
  const hasValidCredentials =
    config.smtpUser &&
    config.smtpPass &&
    config.smtpUser.trim() !== "" &&
    config.smtpPass.trim() !== "";

  if (hasValidCredentials) {
    return nodemailer.createTransport({
      host: config.smtpHost || "smtp.gmail.com",
      port: config.smtpPort || 587,
      secure: false,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  }

  // Fallback if no credentials - log to console instead of sending real email
  logger.warn(
    "📧 [Email Config] No SMTP credentials found - emails will be logged only"
  );
  return {
    sendMail: async (mailOptions) => {
      logger.info("📧 [DEV MODE] Email would be sent:", {
        to: mailOptions.to,
        subject: mailOptions.subject,
        text: mailOptions.text,
      });
      return { messageId: "dev-mode-email-" + Date.now() };
    },
  };
};

/**
 * Send OTP via email
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @returns {Promise<boolean>} Success status
 */
export const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: config.smtpFrom || "noreply@pharmaflow.com",
      to: email,
      subject: "Password Reset OTP - PharmaFlow",
      text: `Your OTP for password reset is: ${otp}\n\nThis OTP will expire in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>You have requested to reset your password.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1f2937; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
          </div>
          <p>This OTP will expire in <strong>10 minutes</strong>.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">PharmaFlow - Pharmacy Management System</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`OTP email sent to ${email}`);
    return true;
  } catch (error) {
    logger.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

/**
 * Send welcome email after successful registration
 * @param {string} email - Recipient email
 * @param {string} name - User name
 * @returns {Promise<boolean>} Success status
 */
export const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: config.smtpFrom || "noreply@pharmaflow.com",
      to: email,
      subject: "Welcome to PharmaFlow",
      text: `Welcome ${name}!\n\nYour account has been successfully created.\n\nYou can now login to the system.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to PharmaFlow!</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your account has been successfully created.</p>
          <p>You can now login to the system and start using our services.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">PharmaFlow - Pharmacy Management System</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    logger.error("Error sending welcome email:", error);
    // Don't throw error for welcome email - it's not critical
    return false;
  }
};
