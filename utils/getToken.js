import { google } from "googleapis";

import dotenv from "dotenv";
dotenv.config();

const oauth2Client = new google.auth.OAuth2(
 process.env.GOOGLE_CLIENT_ID,
 process.env.GOOGLE_CLIENT_SECRET,
 "https://developers.google.com/oauthplayground"
);

const scopes = [
 "https://mail.google.com/"
];

const url = oauth2Client.generateAuthUrl({
 access_type: "offline",
 scope: scopes,
 prompt:"consent"
});

console.log(url);