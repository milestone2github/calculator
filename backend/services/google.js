const { google } = require('googleapis');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const SCOPES = [
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/user.phonenumbers.read"
];

const authClient = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

const generateAuthUrl = () => {
  return authClient.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
};

const getAccessToken = async (code) => {
  const { tokens } = await authClient.getToken(code);
  authClient.setCredentials(tokens);
  return tokens;
};

const getUserInfo = async (tokens) => {
  authClient.setCredentials(tokens);
  const oauth2 = google.oauth2({ auth: authClient, version: 'v2' });
  const userInfo = await oauth2.userinfo.get();
  return userInfo.data;
};

const getRefreshedTokens = async (refreshToken) => {
  authClient.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await authClient.refreshAccessToken();
  return credentials;
};

const getAuthenticatedClient = () => {
  return authClient;
};

// Fetch user phone number from Google People API
const getUserPhoneNumber = async (accessToken) => {//debug
  const url = 'https://people.googleapis.com/v1/people/me?personFields=phoneNumbers';

  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.data.phoneNumbers && response.data.phoneNumbers.length > 0) {
    return response.data.phoneNumbers[0].value; // Return the first phone number
  }
  return null; // No phone number available
};


module.exports = {
  generateAuthUrl,
  getAccessToken,
  getUserInfo,
  getRefreshedTokens,
  getAuthenticatedClient,
  getUserPhoneNumber
};
