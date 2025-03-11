const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController'); 

// Create a new project
router.post('/projects', projectController.createProject);

// Get all projects
router.get('/projects', projectController.getProjects);

// Get a single project by ID
router.get('/projects/:id', projectController.getProjectById);

// Update a project by ID
router.put('/projects/:id', projectController.updateProject);

// Delete a project by ID
router.delete('/projects/:id', projectController.deleteProject);
router.get('/projects/team-member/:teamMemberId', projectController.getProjectsByTeamMember);

module.exports = router;
