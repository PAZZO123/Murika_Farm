const  {User}  = require("../../models/userModel");

const jwt = require("jsonwebtoken");
const { promisify } = require("util")
const dotenv = require("dotenv");

dotenv.config();;

const protect = async (req, res, next) => {
  let token;

  // Get token and Check if is there.
  try{

    if (!req.headers.authorization||!req.headers.authorization.startsWith("Bearer")) {
      return res.status(401).json({
        message: "You must login first!",
      });
    }

    token = req.headers.authorization.split(" ")[1];

    //  Token verification
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRETE);

    // Check if User exist

    const freshUser = await User.findOne({_id: decoded.uuid});

    if (!freshUser) {
      return res.status(409).json({
        message: "Your Token malfunctioned please Login again",
      });
    }

    req.user = freshUser;

    next();
  }catch(error){
    return res.status(500).json({
      error:error
    })
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You are not allowed to perform this action.For more info, contact your site Admin',
      });
    }
    next();
  };
};

  module.exports = {
    protect,
    restrictTo,
  };