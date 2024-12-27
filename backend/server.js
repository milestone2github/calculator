const express = require('express');
const port = process.env.PORT || 80;
const cors = require('cors');
const path = require('path')
const { connetToCalculatorsDb, connectToMilestoneDB } = require('./dbconfig');
require('dotenv').config()
const authRoutes = require('./routes/AuthRoutes');
const retirementCalcRoutes = require('./routes/RetirementCalculatorRoutes');
const app = express();

connetToCalculatorsDb()
const milestoneDbConnection = connectToMilestoneDB();

// Get allowed origins from environment variable
const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',');

// CORS configuration
const corsOptions = {
  // origin: (origin, callback) => {
  //   if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
  //     callback(null, true);
  //   } else {
  //     callback(new Error('Not allowed by CORS'));
  //   }
  // },
  origin: true,
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Middleware to provide db access
function dbAccess(req, res, next) {
  req.milestoneDb = milestoneDbConnection;
  next();
}
app.use(dbAccess);

app.use('/api/auth', authRoutes);
app.use('/api/retirement-calculator', retirementCalcRoutes);
// app.get('/', (req, res) => {
//   res.send('Welcome to Calculator API');
// })

// wildcard route to serve static files from frontend 
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
})