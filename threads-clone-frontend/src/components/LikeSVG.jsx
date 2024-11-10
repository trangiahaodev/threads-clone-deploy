import { useState } from "react";

import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import postAtom from "../atoms/postAtom";

import useShowToast from "../hooks/useShowToast";

function LikeSVG({ post }) {
  const user = useRecoilValue(userAtom);
  const [posts, setPosts] = useRecoilState(postAtom);

  const [liked, setLiked] = useState(post.likes.includes(user?._id));
  const [loading, setLoading] = useState(false);

  const showToast = useShowToast();

  const handleLikeAndUnlike = async () => {
    if (!user)
      return showToast(
        "Error",
        "You must be logged in to like a post",
        "error"
      );
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/posts/like/${post._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user._id }),
      });

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      if (!liked) {
        // Add the current user._id to post.likes array
        const updatedPosts = posts.map((p) => {
          if (p._id === post._id)
            return { ...p, likes: [...p.likes, user._id] };
          else return p;
        });
        setPosts(updatedPosts);
      } else {
        // Remove the current user._id to post.likes array
        const updatedPosts = posts.map((p) => {
          if (p._id === post._id)
            return { ...p, likes: p.likes.filter((id) => id !== user._id) };
          else return p;
        });
        setPosts(updatedPosts);
      }

      setLiked(!liked);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <svg
      aria-label="Like"
      color={liked ? "rgb(237, 73, 86)" : ""}
      fill={liked ? "rgb(237, 73, 86)" : "transparent"}
      height="19"
      role="img"
      viewBox="0 0 24 22"
      width="20"
      onClick={handleLikeAndUnlike}>
      <path
        d="M1 7.66c0 4.575 3.899 9.086 9.987 12.934.338.203.74.406 1.013.406.283 0 .686-.203 1.013-.406C19.1 16.746 23 12.234 23 7.66 23 3.736 20.245 1 16.672 1 14.603 1 12.98 1.94 12 3.352 11.042 1.952 9.408 1 7.328 1 3.766 1 1 3.736 1 7.66Z"
        stroke="currentColor"
        strokeWidth="2"></path>
    </svg>
  );
}

export default LikeSVG;
