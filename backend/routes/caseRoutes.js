const express = require('express');
const router = express.Router();
const caseController = require('../controllers/caseController');
const passport = require('passport');


router.post('/reports', passport.authenticate('jwt', { session: false }), caseController.createCaseReport);
router.get('/reports', passport.authenticate('jwt', { session: false }), caseController.getAllCaseReports);
router.get('/reports/:userId', passport.authenticate('jwt', { session: false }), caseController.getCaseReportsByUser);
router.get('/reports/:id', caseController.getCaseReportById);
router.put('/reports/:id',  caseController.updateCaseReport);
router.put('/reports/:id', caseController.updateStatus);
router.delete('/reports/:id',  caseController.deleteCaseReport);

module.exports = router;
