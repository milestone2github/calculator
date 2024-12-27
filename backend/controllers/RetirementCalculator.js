const RetirementCalculator = require("../models/RetirementCalculator");

exports.saveRetirementCalculation = async (req, res) => {
  const formData = req.body.formData;
  let calculatorData = {};
  Object.entries(formData).forEach(([key, value]) => { calculatorData[key] = Number(value) })
  try {
    // find if a exist with same property values 
    let calculatorDocument = await RetirementCalculator.findOne(formData);

    // otherwise create new 
    if(!calculatorDocument) {
      calculatorDocument = await RetirementCalculator.create(calculatorData);
    }

    // generate shareable link 
    const shareableLink = `${process.env.FRONTEND_REDIRECT_URI}?cid=${calculatorDocument.id.toString()}`;
    res.status(201).json({
      message: "Retirement Calculator saved successfully", data: {
        calculatorData: calculatorDocument,
        shareableLink
      }
    });
  } catch (error) {
    console.error('Error saving retirement calculator data: ', error);
    res.status(500).json({ message: "Error saving retirement calculator data" });
  }
}

exports.getRetirementCalculation = async (req, res) => {
  const id = req.params.id;
  try {
    const calculatorDocument = await RetirementCalculator.findById(id);
    if (!calculatorDocument) {
      res.status(404).json({ error: "Calculation data not found" });
    }

    res.status(200).json({ message: "Retirement Calculator data retrieved successfully", data: calculatorDocument });
  } catch (error) {
    console.error('Error retrieving retirement calculator data: ', error);
    res.status(500).json({ error: "Error retrieving retirement calculator data" });
  }
}