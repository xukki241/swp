import { eq } from "drizzle-orm";
import nodemailer from "nodemailer";

import config from "../config/environment.js";
import { db } from "../db/index.js";
import { users } from "../db/schema/index.js";

import logger from "./logger.js";

/**
 * Create email transporter
 */
const createTransporter = () => {
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

  logger.warn(
    "📧 [Email Config] No SMTP credentials found - emails will be logged only"
  );
  return {
    sendMail: async (mailOptions) => {
      logger.info("📧 [DEV MODE] Email would be sent:", {
        to: mailOptions.to,
        subject: mailOptions.subject,
      });
      return { messageId: "dev-mode-email-" + Date.now() };
    },
  };
};

/**
 * Get owner email from database
 * @returns {Promise<string|null>} Owner email
 */
export const getOwnerEmail = async () => {
  try {
    const [owner] = await db
      .select({ email: users.email })
      .from(users)
      .where(eq(users.role, "owner"))
      .limit(1);

    return owner?.email || null;
  } catch (error) {
    logger.error("Error fetching owner email:", error);
    return null;
  }
};

/**
 * Send user registration notification to owner
 * @param {Object} registrationData - Registration data
 * @param {string} registrationData.name - User name
 * @param {string} registrationData.email - User email
 * @param {string} registrationData.phone - User phone
 * @param {string} registrationData.address - User address
 * @returns {Promise<boolean>} Success status
 */
export const sendRegistrationNotificationToOwner = async (registrationData) => {
  try {
    const ownerEmail = await getOwnerEmail();

    if (!ownerEmail) {
      logger.warn("No owner email found, registration notification not sent");
      return false;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: config.smtpFrom || "noreply@pharmaflow.com",
      to: ownerEmail,
      subject: `📝 New User Registration Request - ${registrationData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New User Registration Request</h2>
          <p>A new user has submitted a registration request. Please review the details below:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600; width: 150px;">Name:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${registrationData.name}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600; width: 150px;">Email:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
                  <a href="mailto:${registrationData.email}" style="color: #2563eb; text-decoration: none;">
                    ${registrationData.email}
                  </a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-weight: 600; width: 150px;">Phone:</td>
                <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">${registrationData.phone}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: 600; width: 150px;">Address:</td>
                <td style="padding: 10px;">${registrationData.address}</td>
              </tr>
            </table>
          </div>

          <p>Please log in to the PharmaFlow system to approve or reject this registration request.</p>

          <div style="margin: 30px 0; padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
            <p style="margin: 0; color: #92400e; font-weight: 600;">⏰ Action Required</p>
            <p style="margin: 5px 0 0 0; color: #92400e; font-size: 14px;">
              You have new registration requests pending approval. Visit the admin dashboard to manage them.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">PharmaFlow - Pharmacy Management System</p>
          <p style="color: #9ca3af; font-size: 12px;">Sent on ${new Date().toLocaleString("vi-VN")}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Registration notification email sent to owner: ${ownerEmail}`);
    return true;
  } catch (error) {
    logger.error("Error sending registration notification to owner:", error);
    throw new Error("Failed to send registration notification email");
  }
};

/**
 * Send registration approval notification to candidate
 * @param {Object} userData - User data
 * @param {string} userData.name - User name
 * @param {string} userData.email - User email
 * @param {string} userData.role - Assigned role
 * @returns {Promise<boolean>} Success status
 */
export const sendRegistrationApprovalEmail = async (userData) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: config.smtpFrom || "noreply@pharmaflow.com",
      to: userData.email,
      subject: "✅ Registration Approved - Welcome to PharmaFlow",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Registration Approved! 🎉</h2>
          
          <p>Hi <strong>${userData.name}</strong>,</p>
          
          <p>Great news! Your registration request has been <strong>approved</strong> by the system administrator.</p>

          <div style="background-color: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3 style="color: #15803d; margin-top: 0;">Your Account Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px; font-weight: 600; width: 120px;">Username:</td>
                <td style="padding: 8px;">${userData.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: 600;">Role:</td>
                <td style="padding: 8px; text-transform: capitalize;">
                  <span style="background-color: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-weight: 600;">
                    ${userData.role}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px; font-weight: 600;">Status:</td>
                <td style="padding: 8px; color: #16a34a; font-weight: 600;">Active</td>
              </tr>
            </table>
          </div>

          <p>You can now log in to the PharmaFlow system using your email and password.</p>

          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.APP_URL || "http://localhost:5173"}/login" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              🔐 Go to Login
            </a>
          </div>

          <div style="margin: 20px 0; padding: 15px; background-color: #eff6ff; border-radius: 6px; border-left: 4px solid #2563eb;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              <strong>💡 Tip:</strong> Keep your login credentials secure and never share them with others.
            </p>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            If you have any questions or need assistance, please contact the system administrator.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">PharmaFlow - Pharmacy Management System</p>
          <p style="color: #9ca3af; font-size: 12px;">Sent on ${new Date().toLocaleString("vi-VN")}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Registration approval email sent to ${userData.email}`);
    return true;
  } catch (error) {
    logger.error("Error sending registration approval email:", error);
    throw new Error("Failed to send registration approval email");
  }
};

/**
 * Send registration rejection notification to candidate
 * @param {Object} registrationData - Registration data
 * @param {string} registrationData.name - User name
 * @param {string} registrationData.email - User email
 * @param {string} [reason] - Rejection reason (optional)
 * @returns {Promise<boolean>} Success status
 */
export const sendRegistrationRejectionEmail = async (
  registrationData,
  reason = null
) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: config.smtpFrom || "noreply@pharmaflow.com",
      to: registrationData.email,
      subject: "Registration Update - PharmaFlow",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Registration Update</h2>
          
          <p>Hi <strong>${registrationData.name}</strong>,</p>
          
          <p>We regret to inform you that your registration request has been <strong>rejected</strong> by the system administrator.</p>

          <div style="background-color: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="color: #991b1b; margin-top: 0;">Rejection Details</h3>
            <p style="margin: 0; color: #7f1d1d;">
              ${reason ? `<strong>Reason:</strong> ${reason}` : "Your registration request could not be approved at this time."}
            </p>
          </div>

          <p>
            If you believe this is a mistake or would like to reapply, please contact the system administrator or 
            submit a new registration request.
          </p>

          <div style="margin: 30px 0; text-align: center;">
            <a href="${process.env.APP_URL || "http://localhost:5173"}/register" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              📝 Submit New Request
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px;">
            For assistance, please contact the system administrator.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">PharmaFlow - Pharmacy Management System</p>
          <p style="color: #9ca3af; font-size: 12px;">Sent on ${new Date().toLocaleString("vi-VN")}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    logger.info(
      `Registration rejection email sent to ${registrationData.email}`
    );
    return true;
  } catch (error) {
    logger.error("Error sending registration rejection email:", error);
    throw new Error("Failed to send registration rejection email");
  }
};
