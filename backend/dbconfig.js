const mongoose = require("mongoose");
require('dotenv').config()

let milestoneDbConnection = null;

const connetToCalculatorsDb = async () => {
  try {
    const connect = await mongoose.connect(`${process.env.MONGO_URI}/calculators`)
    if (connect) {
      console.log("Connected to Calculators DB");
    }
    else {
      throw new Error("Calculators DB connection failed")
    }
  } catch (error) {
    console.log("Calculators DB connection failed: ", error.message);
    process.exit(1);
  }
}

const connectToMilestoneDB = () => {
  try {
    if (!milestoneDbConnection) {
      milestoneDbConnection = mongoose.createConnection(`${process.env.MONGO_URI}/Milestone`);
      milestoneDbConnection.on('connected', async () => {
        console.log('Connected to Milestone DB')
      })
    }
    return milestoneDbConnection;
  } catch (error) {
    console.error('Milestone DB connection failed: ', error.message)
    process.exit(1)
  }
};

module.exports = {connetToCalculatorsDb, connectToMilestoneDB};