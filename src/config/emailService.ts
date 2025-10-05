import nodemailer from "nodemailer";
import type {Transporter} from "nodemailer";

// Create a transporter (this is what sends emails)
const transporter: Transporter = nodemailer.createTransport({
  service: "gmail", // You can use other services too
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASSWORD, // App-specific password (NOT your regular password)
  },
});

/**
 * Sends a password reset email
 * @param toEmail - Recipient's email address
 * @param resetToken - The unique reset token
 * @param userName - User's name for personalization
 * @returns Promise that resolves when email is sent
 */
export async function sendPasswordResetEmail(
  toEmail: string,
  resetToken: string,
  userName: string
): Promise<{success: boolean}> {
  // Construct the reset URL
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Password Reset Request - Workout App",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${userName},</p>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; 
                  color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #6B7280; word-break: break-all;">${resetUrl}</p>
        <p><strong>This link will expire in 1 hour.</strong></p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #E5E7EB;">
        <p style="color: #9CA3AF; font-size: 12px;">
          This is an automated email, please do not reply.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully");
    return {success: true};
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send password reset email");
  }
}
