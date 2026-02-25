import nodemailer from "nodemailer";

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendResetEmail = async (to, token) => {

    // 🔥 Fallback nếu không có FRONTEND_URL
    const frontendUrl =
        process.env.FRONTEND_URL || "http://localhost:5173";

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