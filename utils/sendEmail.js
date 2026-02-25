import nodemailer from "nodemailer";
import dns from "dns";

// console.log("EMAIL_USER:", process.env.EMAIL_USER);
// console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  // 🔥 ép DNS lookup chỉ dùng IPv4
  lookup: (hostname, options, callback) => {
    return dns.lookup(hostname, { family: 4 }, callback);
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