import mongoose from "mongoose";

import User from "../models/userModel.js";
import Post from "../models/postModel.js";

import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

import generateTokenAndSetCookies from "../utils/helpers/generateTokenAndSetCookies.js";

// Signup User
const signupUser = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const user = await User.findOne({ $or: [{ email }, { username }] });

    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      username,
      password: hashedPassword,
    });
    await newUser.save();

    if (newUser) {
      generateTokenAndSetCookies(newUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
        biography: newUser.biography,
        profilePicture: newUser.profilePicture,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in signupUser: ", err.message);
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPasswordCorrect)
      return res.status(400).json({ error: "Invalid username or password" });
    generateTokenAndSetCookies(user._id, res);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      biography: user.biography,
      profilePicture: user.profilePicture,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in loginUser: ", err.message);
  }
};

const logoutUser = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 1 });
    res.status(200).json({ message: "User logged out succesfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in logoutUser: ", err.message);
  }
};

const followAndUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);

    // req.user is coming from the protectRoute middleware
    const currentUser = await User.findById(req.user._id);

    // If the user is following/unfollowing himself, return an error
    if (id === req.user._id.toString())
      return res
        .status(400)
        .json({ message: "You cannot follow/unfollow yourself" });

    // If the user is not found, return an error
    if (!userToModify || !currentUser)
      return res.status(400).json({ error: "User not found" });

    // .following is the field in the User model we created at the beginning
    // It's an array of user ids following another user
    // isFollowing is to get to 'following' state
    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow a user
      // 1) Modify current user's following array (i.e John unfollows Jane, we move Jane's id outta John's following array)
      // The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

      // 2) Modify userToModify's followers array (i.e John unfollows Jane, we move John's id outta Jane's followers array)
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });

      res.status(200).json({ message: "User unfollowed successfully" });
    } else {
      // Follow a user
      await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });
      await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });

      res.status(200).json({ message: "User followed successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in followAndUnfollowUser: ", err.message);
  }
};

const updateUser = async (req, res) => {
  const { name, email, username, password, biography } = req.body;
  let { profilePicture } = req.body;
  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User not found" });

    if (req.params.id !== userId.toString())
      return res
        .status(400)
        .json({ error: "You cannot update other user's profile" });

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user.password = hashedPassword;
    }

    if (profilePicture) {
      // Check if the user has an old profile picture
      if (user.profilePicture) {
        await cloudinary.uploader.destroy(
          user.profilePicture.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profilePicture);
      // secure_url is the url of the uploaded image (read more at https://cloudinary.com/documentation/upload_images)
      profilePicture = uploadedResponse.secure_url;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profilePicture = profilePicture || user.profilePicture;
    user.biography = biography || user.biography;

    user = await user.save();

    // Find all posts that this user replied and Update username, userProfilePicture fields
    await Post.updateMany(
      { "replies.userId": userId },
      {
        $set: {
          "replies.$[reply].username": user.username,
          "replies.$[reply].userProfilePicture": user.profilePicture,
        },
      },
      { arrayFilters: [{ "reply.userId": userId }] }
    );

    user.password = null; // Password should not be sent back to the client
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in updateUser: ", err.message);
  }
};

const getUserProfile = async (req, res) => {
  // We will fetch user profile either with username or userId
  const { query } = req.params;

  try {
    let user;

    // If query is userId
    if (mongoose.Types.ObjectId.isValid(query)) {
      user = await User.findOne({ _id: query })
        .select("-password")
        .select("-updatedAt");
    } else {
      // If query is username
      user = await User.findOne({ username: query })
        .select("-password")
        .select("-updatedAt");
    }

    if (!user) return res.status(400).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in getUserProfile", err.message);
  }
};

const getSuggestedUsers = async (req, res) => {
  try {
    // Remove current user and users being followed from suggestedUsers array
    const userId = req.user._id;
    const usersFollowedByCurrentUser = await User.findById(userId).select(
      "following"
    );
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);

    const filteredUsers = users.filter(
      (user) => !usersFollowedByCurrentUser.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.forEach((user) => (user.password = null));

    res.status(200).json(suggestedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  signupUser,
  loginUser,
  logoutUser,
  followAndUnfollowUser,
  updateUser,
  getUserProfile,
  getSuggestedUsers,
};
