"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.discordCallback = exports.discordLogin = void 0;
const error_handler_1 = require("../utils/error-handler");
const http_status_1 = require("../constants/http-status");
const axios_1 = __importDefault(require("axios"));
exports.discordLogin = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const url = process.env.DISCORD_AUTHORIZE_URL || "https://discord.com";
    // Redirecting to the Discord OAuth2 URL
    return res.status(http_status_1.HTTP_STATUS.OK).redirect(url);
});
exports.discordCallback = (0, error_handler_1.catchAsync)(async (req, res, next) => {
    const { code } = req.query;
    const params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID || "your-client-id",
        client_secret: process.env.DISCORD_CLIENT_SECRET || "your-client-secret",
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.DISCORD_CALLBACK_URL ||
            "http://localhost:4000/api/auth/discord/callback",
    });
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "application/x-www-form-urlencoded",
    };
    const response = await axios_1.default.post("https://discord.com/api/oauth2/token", params, { headers });
    const accessToken = response.data
        .access_token;
    console.log("Access Token:", accessToken);
    const userResponse = await axios_1.default.get("https://discord.com/api/users/@me", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });
    const userData = {
        success: true,
        user: {
            id: userResponse.data.id,
            name: userResponse.data.global_name,
            email: userResponse.data.email,
            picture: userResponse.data.avatar,
        },
    };
    const user = userResponse.data;
    // Create deep link URL for the mobile app
    const deepLinkData = encodeURIComponent(JSON.stringify(userData));
    const deepLinkUrl = `${process.env.APP_SCHEMA_LINK}?data=${deepLinkData}`;
    // Render an HTML page with user details and a button to return to the app
    const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Authentication Successful</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .profile {
          text-align: center;
          margin-bottom: 30px;
        }
        .profile-img {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 10px;
          border: 3px solid #4285F4;
        }
        .user-info {
          background: #f7f7f7;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .btn-return {
          display: block;
          background: #4285F4;
          color: white;
          text-decoration: none;
          padding: 12px 20px;
          border-radius: 4px;
          text-align: center;
          font-weight: bold;
          margin-top: 20px;
          border: none;
          cursor: pointer;
          font-size: 16px;
          width: 100%;
        }
        h1 {
          color: #4285F4;
        }
      </style>
    </head>
    <body>
      <div class="profile">
        <h1>Authentication Successful</h1>
        ${user.avatar
        ? `<img src="${user.avatar}" alt="Profile" class="profile-img">`
        : ""}
        <h2>${user.global_name}</h2>
      </div>
      
      <div class="user-info">
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>User ID:</strong> ${user.id}</p>
      </div>
      
      <a href="${deepLinkUrl}" class="btn-return">Return to App</a>
    </body>
  </html>
`;
    res.setHeader("Content-Type", "text/html");
    res.send(html);
    // ---- Optionally, you can redirect to the deep link URL directly ----
    // console.log('Deep Linking URL:', deepLinkUrl);
    // return res.status(HTTP_STATUS.OK).redirect(deepLinkUrl);
});
//# sourceMappingURL=discordAuthController.js.map