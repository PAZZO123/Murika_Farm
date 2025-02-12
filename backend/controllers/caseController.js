const CaseReport = require('../models/CaseReport');
exports.createCaseReport = async (req, res) => {
  try {
    const {
      reportAs, typeOfAbuse, abusedChildName, abusedChildAge,
      abusedChildAddress, guardianName, guardianAddress,
      caseSuspectName, caseSuspectAge, caseSuspectRelation,
      caseSuspectAddress
    } = req.body;

    const userId = req.user._id; // Assuming the user is authenticated

    const newCaseReport = new CaseReport({
      userId,
      reportAs,
      typeOfAbuse,
      abusedChildName,
      abusedChildAge,
      abusedChildAddress,
      guardianName,
      guardianAddress,
      caseSuspectName,
      caseSuspectAge,
      caseSuspectRelation,
      caseSuspectAddress,
    });

    await newCaseReport.save();
    res.status(201).json({ message: 'Case report created successfully', caseReport: newCaseReport });
  } catch (error) {
    console.error('Error creating case report:', error);
    res.status(500).json({ message: 'Error creating case report', error });
  }
};

exports.getAllCaseReports = async (req, res) => {
  try {
    const caseReports = await CaseReport.find().populate('userId', 'username email');
    if (!caseReports.length) {
      return res.status(404).json({ message: 'No case reports found' });
    }

    res.status(200).json(caseReports);
  } catch (error) {
    console.error('Error fetching all case reports:', error);
    res.status(500).json({ message: 'Error fetching case reports', error });
  }
};

exports.getCaseReportsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const caseReports = await CaseReport.find({ userId });

    if (!caseReports.length) {
      return res.status(404).json({ message: 'No case reports found for this user' });
    }

    res.status(200).json(caseReports);
  } catch (error) {
    console.error('Error fetching case reports:', error);
    res.status(500).json({ message: 'Error fetching case reports', error });
  }
};

exports.getCaseReportById = async (req, res) => {
  try {
    const caseReport = await CaseReport.findById(req.params.id);

    if (!caseReport) {
      return res.status(404).json({ message: 'Case report not found' });
    }

    res.status(200).json(caseReport);
  } catch (error) {
    console.error('Error fetching case report:', error);
    res.status(500).json({ message: 'Error fetching case report', error });
  }
};

exports.updateCaseReport = async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;

    const updatedCaseReport = await CaseReport.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedCaseReport) {
      return res.status(404).json({ message: 'Case report not found' });
    }

    res.status(200).json({ message: 'Case report updated successfully', caseReport: updatedCaseReport });
  } catch (error) {
    console.error('Error updating case report:', error);
    res.status(500).json({ message: 'Error updating case report', error });
  }
};

exports.deleteCaseReport = async (req, res) => {
  try {

    const deletedCaseReport = await CaseReport.findByIdAndDelete(req.params.id);

    if (!deletedCaseReport) {
      return res.status(404).json({ message: 'Case report not found' });
    }

    res.status(200).json({ message: 'Case report deleted successfully' });
  } catch (error) {
    console.error('Error deleting case report:', error);
    res.status(500).json({ message: 'Error deleting case report', error });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status, ...updateData } = req.body;

    if (status && !['pending', 'reported'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updatedCaseReport = await CaseReport.findByIdAndUpdate(
      id,
      { ...updateData, ...(status && { status }) }, 
      { new: true }
    );

    if (!updatedCaseReport) {
      return res.status(404).json({ message: 'Case report not found' });
    }

    res.status(200).json({ message: 'Case report updated successfully', caseReport: updatedCaseReport });
  } catch (error) {
    console.error('Error updating case report:', error);
    res.status(500).json({ message: 'Error updating case report', error });
  }
};

