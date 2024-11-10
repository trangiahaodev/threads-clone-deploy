import User from "../models/userModel.js";
import Post from "../models/postModel.js";
import { v2 as cloudinary } from "cloudinary";

import mongoose from "mongoose";

const createPost = async (req, res) => {
  try {
    const { postedBy, text } = req.body;
    let { img } = req.body;

    if (!postedBy || !text) {
      return res.status(400).json({ error: "Please fill all the fields!" });
    }

    const user = await User.findById(postedBy);
    if (!user) return res.status(400).json({ error: "User not found" });

    if (user._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized to create post" });
    }

    const maxLength = 500;
    if (text.length > maxLength)
      return res
        .status(400)
        .json({ error: `Text must be less than ${maxLength} characters` });

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = new Post({ postedBy, text, img });
    await newPost.save();

    const populatedPost = await Post.findById(newPost._id).populate("postedBy");

    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in createPost: ", err.message);
  }
};

const getPost = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in getPost: ", err.message);
  }
};

// Version 1
// const getPostsWithUserProfile = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ error: "User not found" });

//     const following = user.following.map((followId) =>
//       mongoose.Types.ObjectId.createFromHexString(followId)
//     );

//     const feedPosts = await Post.aggregate([
//       {
//         $match: {
//           postedBy: { $in: following },
//         },
//       },
//       {
//         $sort: {
//           createdAt: -1,
//         },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "postedBy",
//           foreignField: "_id",
//           as: "userProfile",
//         },
//       },
//       { $unwind: "$userProfile" },
//       {
//         $project: {
//           _id: 1,
//           text: 1,
//           likes: 1,
//           replies: 1,
//           createdAt: 1,
//           updatedAt: 1,
//           img: 1,
//           "userProfile.name": 1,
//           "userProfile.username": 1,
//           "userProfile.email": 1,
//           "userProfile.profilePicture": 1,
//         },
//       },
//     ]);

//     res.status(200).json(feedPosts);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//     console.log("Error in getPostsWithUserProfile: ", err.message);
//   }
// };

const getPostsWithUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const following = user.following.map((followId) =>
      mongoose.Types.ObjectId.createFromHexString(followId)
    );

    const feedPosts = await Post.find({ postedBy: { $in: following } })
      .populate("postedBy", "name username email profilePicture")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(feedPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in getPostsWithUserProfile: ", err.message);
  }
};

const getUserPosts = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const posts = await Post.find({ postedBy: user._id })
      .populate("postedBy", "name username email profilePicture")
      .sort({
        createdAt: -1,
      });

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in getUserPosts: ", err.message);
  }
};

const deletePost = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.postedBy.toString() !== req.user._id.toString())
      return res.status(401).json({ error: "Unauthorized to delete post" });

    // Delete post image from cloudinary
    if (post.img) {
      const imageId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imageId);
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Deleted post successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in deletePost: ", err.message);
  }
};

const likeAndUnlikePost = async (req, res) => {
  const { postId } = req.params;
  try {
    const userId = req.user._id;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      // Unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });

      res.status(200).json({ message: "Post unliked successfully" });
    } else {
      // Like post
      post.likes.push(userId);
      await post.save();
      res.status(200).json({ message: "Post liked successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in likeAndUnlikePost: ", err.message);
  }
};

const replyToPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;
    const userProfilePicture = req.user.profilePicture;
    const username = req.user.username;

    if (!text) return res.status(400).json({ error: "Text field is required" });
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const reply = { userId, text, userProfilePicture, username };
    post.replies.push(reply);
    await post.save();

    res.status(200).json(reply);
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log("Error in replyToPost: ", err.message);
  }
};

export {
  createPost,
  getPost,
  deletePost,
  likeAndUnlikePost,
  replyToPost,
  getPostsWithUserProfile,
  getUserPosts,
};
