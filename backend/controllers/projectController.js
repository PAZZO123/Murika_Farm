const Project = require('../models/Project'); 
const User = require('../models/userModel'); 

// Create a new project
const createProject = async (req, res) => {
  try {
    const { title, type, description, startDate, endDate, teamMembers } = req.body;

    // Ensure all teamMembers are valid User IDs
    const validTeamMembers = await User.find({ '_id': { $in: teamMembers } });

    if (validTeamMembers.length !== teamMembers.length) {
      return res.status(400).json({ message: "Some team members are invalid" });
    }

    const newProject = new Project({
      title,
      type,
      description,
      startDate,
      endDate,
      teamMembers: validTeamMembers.map(member => member._id),
    });

    await newProject.save();
    return res.status(201).json(newProject);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().populate('teamMembers', 'firstName lastName email'); // Populate team members
    return res.status(200).json(projects);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get a single project by ID
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('teamMembers', 'firstName lastName email');

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json(project);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Update a project by ID
const updateProject = async (req, res) => {
  try {
    const { title, type, description, startDate, endDate, teamMembers } = req.body;

    // Ensure all teamMembers are valid User IDs
    const validTeamMembers = await User.find({ '_id': { $in: teamMembers } });

    if (validTeamMembers.length !== teamMembers.length) {
      return res.status(400).json({ message: "Some team members are invalid" });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        title,
        type,
        description,
        startDate,
        endDate,
        teamMembers: validTeamMembers.map(member => member._id),
      },
      { new: true } // Return the updated project
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json(updatedProject);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Delete a project by ID
const deleteProject = async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);

    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.status(200).json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
// Get projects by team member ID
const getProjectsByTeamMember = async (req, res) => {
  try {
    const { teamMemberId } = req.params;

    // Validate if the user exists
    const userExists = await User.findById(teamMemberId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch projects where the user is part of the teamMembers array
    const projects = await Project.find({ teamMembers: teamMemberId })
      .populate('teamMembers', 'firstName lastName email');

    return res.status(200).json(projects);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectsByTeamMember,
};
