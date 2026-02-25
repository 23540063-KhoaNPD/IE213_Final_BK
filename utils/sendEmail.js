import nodemailer from "nodemailer";
import { google } from "googleapis";
import "dotenv/config";

const OAuth2 = google.auth.OAuth2;

/*
ENV REQUIRED:

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
EMAIL_USER=your@gmail.com
FRONTEND_URL=
*/

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

async function createTransporter() {

  // Gmail API auto generate access token
  const accessToken =
    await oauth2Client.getAccessToken();

  const transporter =
    nodemailer.createTransport({

      service: "gmail",

      auth: {
        type: "OAuth2",

        user: process.env.EMAIL_USER,

        clientId:
          process.env.GOOGLE_CLIENT_ID,

        clientSecret:
          process.env.GOOGLE_CLIENT_SECRET,

        refreshToken:
          process.env.GOOGLE_REFRESH_TOKEN,

        accessToken:
          accessToken?.token,
      },
    });

  // Verify connection once
  await transporter.verify();

  console.log("✅ Gmail ready");

  return transporter;
}

export const sendResetEmail =
async (to, token) => {

  try {

    const transporter =
      await createTransporter();

    const frontendUrl =
      process.env.FRONTEND_URL
      || "http://localhost:5173";

    const resetLink =
      `${frontendUrl}/reset-password?token=${token}`;

    await transporter.sendMail({

      from:
      `"Chat App" <${process.env.EMAIL_USER}>`,

      to,

      subject:
      "Password Reset Request",

      html:`

<div style="font-family:Arial">

<h3>Password Reset</h3>

<p>You requested to reset password.</p>

<a href="${resetLink}"
style="
background:#0084ff;
color:white;
padding:10px 16px;
border-radius:6px;
text-decoration:none;
display:inline-block;
">

Reset Password

</a>

<p style="
font-size:12px;
color:#777;
margin-top:10px">

Expire in 15 minutes.

</p>

</div>

`
    });

    console.log("✅ Reset email sent:", to);

  } catch (err) {

    console.error(
      "❌ Send mail error:",
      err
    );

    throw err;
  }
};