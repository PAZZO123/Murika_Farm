const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const config = require('../config/config');
const transporter = require('../config/emailConfig');

// Insert Admin User
exports.insertAdminUser = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('password', 10);
      const newAdmin = new User({
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        email: 'admin@mulika.com',
        phone: '123456789',
        password: hashedPassword,
        role: 'admin',
      });
      await newAdmin.save();
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error inserting admin user:', error.message);
  }
};


// User Signup
exports.signUp = async (req, res) => {
  try {
    const { password, role, email } = req.body;
    const allowedRoles = ['employee', 'finance', 'manager', 'marketing'];

    if (role && allowedRoles.includes(role.toLowerCase())) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        ...req.body,
        role: role.toLowerCase(),
        password: hashedPassword,
      });

      await newUser.save();

      // Send email with credentials
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Account Credentials',
        html: `
          <h2>Welcome to Our mulika platform! as our internal staff</h2>
          <p>Your account has been created by the administrator.</p>
          <p>Here are your login credentials:</p>
          <ul>
            <li><strong>Username:</strong> ${newUser.username}</li>
            <li><strong>Password:</strong> ${password}</li>
            <li><strong>Role:</strong> ${role}</li>
          </ul>
         
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });

      res.status(201).json({ message: `${role} created successfully and credentials sent to email` });
    } else {
      res.status(403).json({ error: 'Invalid role or unauthorized access. Only admin can create staff members.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// User SignIn
exports.signIn = async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });
    if (!user) throw new Error('User not found');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid password');

    const token = jwt.sign({ userId: user._id }, config.secret, { expiresIn: '1h' });

    // Exclude password before sending user details
    const { password: _, ...loggedInUser } = user.toObject();

    res.status(200).json({ token, currentUser: loggedInUser });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
// User Logout
exports.logOut = (req, res, next) => {
  try {
    if (!req.params.id) return res.json({ msg: 'User ID is required' });
    onlineUsers.delete(req.params.id);
    return res.status(200).send();
  } catch (error) {
    next(error);
  }
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'firstName lastName username email phone role');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Profile of Logged-in User
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId, 'firstName lastName username email phone dateOfBirth nationality role');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get One User by ID
exports.getOne = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const user = await User.findById(userId, 'firstName lastName username email phone role dateOfBirth nationality');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: 'Profile updated successfully', updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.clientSignUp = async (req, res) => {
  try {
    const { firstName, lastName, username, email, phone, password, dateOfBirth, nationality } = req.body;

    // Check if the username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new client user
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      phone,
      password: hashedPassword,
      dateOfBirth,
      nationality,
      role: 'client', // Ensure clients are always created with role "client"
    });

    // Save to the database
    await newUser.save();

    res.status(201).json({ message: 'Client signed up successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
