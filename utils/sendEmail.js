import nodemailer from "nodemailer";
import dns from "dns";

// console.log("EMAIL_USER:", process.env.EMAIL_USER);
// console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  service: "gmail", // Shortcut for Gmail's SMTP settings - see Well-Known Services
  auth: {
    type: "OAuth2",
    user: "23540063@gm.uit.edu.vn",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

// Add this to your mailer file to test the connection immediately
// Using async/await
try {
  await transporter.verify();
  console.log("Server is ready to take our messages");
} catch (err) {
  console.error("Verification failed", err);
}

// Using callbacks
transporter.verify((error, success) => {
  if (error) {
    console.error(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

export const sendResetEmail = async (to, token) => {

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    await transporter.sendMail({
        from: `"Chat App" <${process.env.EMAIL_USER}>`,
        to,
        subject: "Password Reset Request",
        html: `
      <div style="font-family: Arial, sans-serif;">
        <h3>Password Reset</h3>
        <p>You requested to reset your password.</p>
        <p>Click the button below:</p>
        <a 
          href="${resetLink}"
          style="
            display:inline-block;
            padding:10px 16px;
            background:#0084ff;
            color:white;
            text-decoration:none;
            border-radius:6px;
            font-weight:bold;
          "
        >
          Reset Password
        </a>
        <p style="margin-top:15px;font-size:12px;color:#777;">
          This link will expire in 15 minutes.
        </p>
      </div>
    `
    });

    console.log("Reset email sent to:", to);
};