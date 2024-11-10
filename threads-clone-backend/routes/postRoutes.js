import express from "express";

import {
  createPost,
  getPost,
  deletePost,
  likeAndUnlikePost,
  replyToPost,
  getPostsWithUserProfile,
  getUserPosts,
} from "../controllers/postController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/feed", protectRoute, getPostsWithUserProfile);
router.get("/user/:username", getUserPosts);

router.get("/:postId", getPost);
router.post("/create", protectRoute, createPost);
router.delete("/:postId", protectRoute, deletePost);
router.put("/like/:postId", protectRoute, likeAndUnlikePost);
router.post("/reply/:postId", protectRoute, replyToPost);

export default router;
