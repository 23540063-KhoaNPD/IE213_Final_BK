import { google } from "googleapis";
import "dotenv/config";

/*
ENV REQUIRED

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
EMAIL_USER=
FRONTEND_URL=
*/

const oauth2Client =
  new google.auth.OAuth2(

    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,

    "https://developers.google.com/oauthplayground"
  );

oauth2Client.setCredentials({

  refresh_token:
    process.env.GOOGLE_REFRESH_TOKEN

});

const gmail =
  google.gmail({

    version: "v1",
    auth: oauth2Client

  });


// encode email → Gmail API format
function makeBody(message) {

  return Buffer
    .from(message)

    .toString("base64")

    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}



export const sendResetEmail =
  async (to, token) => {

    try {

      const frontendUrl =
        process.env.FRONTEND_URL
        || "http://localhost:5173";

      const resetLink =
        `${frontendUrl}/reset-password?token=${token}`;


      const html = `

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

`;


      const message = [

        `From: Chat App <${process.env.EMAIL_USER}>`,
        `To:${to}`,
        `Subject:Password Reset Request`,
        "MIME-Version: 1.0",
        "Content-Type:text/html;charset=utf-8",

        "",
        html

      ].join("\n");


      const raw = makeBody(message);


      await gmail.users.messages.send({

        userId: "me",

        requestBody: {

          raw

        }

      });

      console.log("✅ Reset email sent:", to);

    }
    catch (err) {

      console.error("❌ Gmail API error:", err);

      throw err;

    }

  };