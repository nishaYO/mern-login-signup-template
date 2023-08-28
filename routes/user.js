const express = require("express"); 
const router = express.Router(); 
const bcrypt = require("bcryptjs"); // Import bcrypt for password hashing
const User = require("../modals/User"); 
const { body, validationResult } = require('express-validator'); // Import validation utilities
const jwt = require('jsonwebtoken'); 

const JWT_SECRET = 'secret@Key'; 

const createUserValidator = [
  body('name', 'Enter a valid name').isLength({ min: 3 }), // Validate name
  body('email', 'Enter a valid email').isEmail(), // Validate email
  body('password', 'Password must be at least 5 characters').isLength({ min: 5 }), // Validate password length
];

// Handler for creating a new user
const createUserHandler = async (req, res) => {
  // Validate user input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() }); // Bad request with validation errors
  }

  try {
    // Check if user with the given email already exists
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ error: "Sorry, a user with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10); // Generate salt for password hashing
    const secPass = await bcrypt.hash(req.body.password, salt); // Hash the password

    // Create a new user
    user = await User.create({
      name: req.body.name,
      password: secPass,
      email: req.body.email,
    });

    // Generate JWT token
    const data = {
      user: {
        id: user.id,
      },
    };
    const authtoken = jwt.sign(data, JWT_SECRET);

    res.json({ authtoken }); // Respond with the JWT token
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error"); 
  }
};
  
// Route 1 for creating a user: no login required
router.post('/createuser', createUserValidator, createUserHandler);


// login validation
const loginUserValidator = [
  body('email', 'Enter a valid email').isEmail(), //Validate email
  body('password', 'Password cannot be blank').exists(), //Password must exist
];

// Handler for logging in already existing user
const loginUserHandler = async (req, res) => {


  // Validate user input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() }); // Bad request with validation errors
  }

  try {
    // extract email and password from user request
    const { email, password } = req.body;
    // Check if user with the given email exists or not
    let user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials. Try again!" });
    }

    // Check if the password matches the user email address 
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(401).json({ error: "Invalid credentials. Try again!" });
    }


    // Generate JWT token
    const data = {
      user: {
        id: user.id,
      },
    };
    const authtoken = jwt.sign(data, JWT_SECRET, { expiresIn: '30d' }); // Token expires in 30 days

    res.json({ authtoken }); // Respond with the JWT token
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error"); 
  }
};

// Route 2 for logging in the user: no login required
router.post('/loginuser', loginUserValidator, loginUserHandler);

module.exports = router;