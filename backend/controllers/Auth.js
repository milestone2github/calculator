const axios = require('axios');
const OTP = require('../models/Otp');
const { default: mongoose } = require('mongoose');
const sendEmail = require('../utils/sendEmail');
const { generateAuthUrl, getAccessToken, getUserInfo, getUserPhoneNumber } = require('../services/google');
const qs = require('node:querystring');
const { camelCaseToTitleCase } = require('../utils/stringFormats');

const API_KEY = process.env.TWO_FACTOR_API_KEY;

// Send OTP via SMS and save to DB
const sendOtp = async (req, res) => {
  const { phoneNumber } = req.body;

  // Validate the input
  if (!phoneNumber || !/^\+\d{10,15}$/.test(phoneNumber)) {
    return res.status(400).json({ message: 'Invalid phone number format' });
  }

  try {
    // Generate a random 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const templateName = "mverify";

    // Send OTP using 2Factor API
    const response = await axios.get(`https://2factor.in/API/V1/${API_KEY}/SMS/${encodeURIComponent(phoneNumber)}/${encodeURIComponent(otp)}/${encodeURIComponent(templateName)}`);

    if (response.data.Status !== 'Success') {
      return res.status(500).json({ message: 'Failed to send OTP', error: response.data });
    }

    // Save OTP to the database
    await OTP.findOneAndUpdate(
      {phoneNumber},
      {otp},
      {upsert: true, new: true}
    )

    return res.status(200).json({ message: 'OTP sent successfully', data: response.data });
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Validate OTP
const validateOtp = async (req, res) => {
  const { phoneNumber, otp, formData } = req.body;

  // Validate input
  if (!phoneNumber || !otp) {
    return res.status(400).json({ message: 'Phone number and OTP are required' });
  }

  try {
    // Find the OTP record in the database
    const otpRecord = await OTP.findOne({ phoneNumber, otp });

    // Check if OTP exists and is valid
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid OTP or phone number' });
    }

    // Check if OTP is expired (handled by TTL index in schema)
    const isExpired = new Date() - new Date(otpRecord.createdAt) > 300000; // 5 minutes in milliseconds
    if (isExpired) {
      await OTP.deleteOne({ _id: otpRecord._id }); // Cleanup expired OTP
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Mark the OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // check if existing or new user 
    const userExist = await checkUserExists({ phoneNumber });
    if (userExist) {
      // send email notifying existing user used calculator 
      console.log('Existing user');
      await sendEmail({
        toAddress: 'calculator@niveshonline.com',
        subject: 'Retirement Calculator usage detail',
        body: `
        <p>User <strong>${phoneNumber}</strong> used Retirement Savings Calculator on the web portal.</p>
        <p>Form Data:</p>
        <p>
          ${Object.entries(formData)
            .map(([key, value]) => `${camelCaseToTitleCase(key)}: ${value}`)
            .join('<br>')}
        </p>
      `,
      })
    }
    else {
      // send email notifying new user used calculator
      console.log('new user')
      await insertFreshClientData({ phoneNumber });
    }

    const encryptedPhone = btoa(phoneNumber);
    res.cookie("phoneNumber", encryptedPhone, {
      // httpOnly: true, // Prevent JavaScript access for security
      secure: true,   // Send only over HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
      sameSite: 'Strict', // Prevent CSRF attacks
    });
    return res.status(200).json({ message: 'OTP verified successfully', data: { phoneNumber } });
  } catch (error) {
    console.error('Error validating OTP:', error.message);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Generate Google OAuth URL
const googleAuth = (req, res) => {
  try {
    const authUrl = generateAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).send('Error generating auth URL.');
  }
};

// Handle OAuth callback
const googleCallback = async (req, res) => {
  const code = req.query.code;

  try {
    const tokens = await getAccessToken(code);

    // Get user information
    const userInfo = await getUserInfo(tokens);

    // Fetch user's phone number using Google People API
    const phoneNumber = await getUserPhoneNumber(tokens.access_token);
    if (!phoneNumber) {
      throw new Error("Unable to get phone number");
    }

    // check if existing or new user 
    const userExist = await checkUserExists({ phoneNumber: phoneNumber });
    if (userExist) {
      // send email notifying existing user used calculator 
      console.log('Existing user');
      await sendEmail({
        toAddress: 'calculator@niveshonline.com',
        subject: 'Retirement Calculator usage detail',
        body: `User ${phoneNumber} used Retirement Savings Calculator on the web portal.`,
      })
    }
    else {
      // send email notifying new user used calculator
      console.log('new user')
      await insertFreshClientData({ phoneNumber: phoneNumber, name: userInfo.name });
    }

    // Redirect to frontend
    const encryptedPhone = btoa(phoneNumber);
    res.cookie("phoneNumber", encryptedPhone, {
      // httpOnly: true, // Prevent JavaScript access for security
      secure: true,   // Send only over HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
      sameSite: 'Strict', // Prevent CSRF attacks
    });
    res.redirect(`${process.env.FRONTEND_REDIRECT_URI}`);
  } catch (error) {
    console.error('Error during oauth callback: ', error.message);
    res.redirect(`${process.env.FRONTEND_REDIRECT_URI}?err=oathfailed`);
  }
};

module.exports = { sendOtp, validateOtp, googleAuth, googleCallback };

// Utility functions 
const checkUserExists = async ({ phoneNumber, email }) => {
  let query = {}
  if (phoneNumber) {
    phoneNumber = phoneNumber?.startsWith('+') ? phoneNumber?.slice(1) : phoneNumber;
    query.MOBILE = phoneNumber
  }
  else if (email) {
    query.EMAIL = email
  }

  try {
    // Ensure you are using the correct database and collection
    const mintDbCollection = mongoose.connection.useDb('Milestone').collection('MintDb');

    // Find a document with the provided phone number
    const document = await mintDbCollection.findOne(query);

    return !!document; // Return true if document exists, otherwise false
  } catch (error) {
    console.error('Error checking user existence:', error.message);
    throw new Error('Database query failed');
  }
};

async function insertFreshClientData({ phoneNumber, email, name = '' }) {
  phoneNumber = phoneNumber?.startsWith('+') ? phoneNumber?.slice(1) : phoneNumber;

  // const options = ["Sagar Maini", "Ishu Mavar", "Manjeet Kumar"];
  // const rmName = options[Math.floor(Math.random() * options.length)];

  const TOKEN_ENDPOINT = "https://accounts.zoho.com/oauth/v2/token";

  // Step 1: Fetch Zoho Access Token
  let accessToken;
  try {
    const payload = qs.stringify({
      refresh_token: process.env.ZOHO_REFRESH_TOKEN,
      client_id: process.env.ZOHO_CLIENT_ID,
      client_secret: process.env.ZOHO_CLIENT_SECRET,
      grant_type: "refresh_token",
    });
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
    };
    const tokenResponse = await axios.post(TOKEN_ENDPOINT, payload, { headers });
    accessToken = tokenResponse.data.access_token;
  } catch (error) {
    console.error("Error fetching Zoho Access Token:", error);
    return;
  }

  const headers = { Authorization: `Zoho-oauthtoken ${accessToken}` };

  // Step 2: Fetch Zoho Active Users
  // let emailToId = {};
  // try {
  //   const userResponse = await axios.get(
  //     "https://www.zohoapis.com/crm/v2/users?type=ActiveUsers",
  //     { headers }
  //   );
  //   const users = userResponse.data.users || [];
  //   emailToId = users.reduce((map, user) => {
  //     map[user.email.toLowerCase()] = user.id;
  //     return map;
  //   }, {});
  // } catch (error) {
  //   console.error("Error fetching Zoho Users:", error.message);
  //   return;
  // }

  try {
    const freshClients = mongoose.connection.useDb('Milestone').collection('FreshClients');
    let query = {};

    const newClientDocument = {
      timestamp: Date.now(),
      // "RELATIONSHIP MANAGER": rmName,
    };

    let zohoRecordData = {
      Email: email,
      // Owner: ownerId,
      Product_Type: "Prospect",
      Lead_Source: "Calculator",
    }

    if (phoneNumber) {
      newClientDocument.MOBILE = phoneNumber
      query.MOBILE = phoneNumber
      zohoRecordData.Mobile = phoneNumber
    }
    if (email) {
      newClientDocument.EMAIL = email
      query.EMAIL = email
      zohoRecordData.Email = email
      zohoRecordData.Mobile = '0'
    }
    if (name) { zohoRecordData.Name = name }

    // Return if client already exists
    const clientExist = await freshClients.findOne(query);
    if (clientExist) {
      console.log('Client already exists in FreshClients collection');
      return;
    }

    // Step 3: Assign Zoho CRM Owner
    // const ownerEmail = `${rmName.split(" ")[0].toLowerCase()}@niveshonline.com`;
    // const ownerId = emailToId[ownerEmail.toLowerCase()] || "2969103000000183019";

    const zohoRecord = {
      data: [zohoRecordData,],
    };

    // Step 4: Add record to Zoho CRM
    try {
      const crmURL = "https://www.zohoapis.com/crm/v2/Investment_leads";
      const crmResponse = await axios.post(crmURL, zohoRecord, { headers });
      if (![200, 201].includes(crmResponse.status)) {
        console.error("Error from Zoho CRM:", crmResponse.data);
      }

      console.info('crm data: ')
      console.dir(crmResponse.data, { depth: null });

      // Insert new client in FreshClients collection 
      newClientDocument["RELATIONSHIP MANAGER"] = 'N/A'
      await freshClients.insertOne(newClientDocument);
      console.log(`Inserted new client: ${newClientDocument}`);
    } catch (crmError) {
      console.error("Error adding record to Fresh clients:", crmError.message);
    }
  } catch (dbError) {
    console.error("Database Error:", dbError.message);
  }
}