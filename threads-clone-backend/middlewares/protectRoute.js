import jwt from "jsonwebtoken";

import User from "../models/userModel.js";

const protectRoute = async (req, res, next) => {
  try {
    // Get the token from the request (the cookies we set in the signupUser and loginUser)
    const token = req.cookies.jwt;

    // If there is no token, return an authorized error
    if (!token) res.status(401).json({ message: "Unauthorized" });

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get the user from the database based on the user._id in the token
    const user = await User.findById(decoded.userId).select("-password");

    // Add the user field to the request
    req.user = user;

    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
    console.log("Error in protectRoute: ", err.message);
  }
};

export default protectRoute;
