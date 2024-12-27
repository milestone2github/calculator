const { getRetirementCalculation, saveRetirementCalculation } = require('../controllers/RetirementCalculator');

const router = require('express').Router();

router.post('/', saveRetirementCalculation);
router.get('/:id', getRetirementCalculation);

module.exports = router;