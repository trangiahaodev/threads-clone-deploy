import { useRecoilState } from "recoil";
import useShowToast from "./useShowToast";
import postAtom from "../atoms/postAtom";

function useDeletePost(post) {
  const [posts, setPosts] = useRecoilState(postAtom);

  const showToast = useShowToast();

  const handleDeletePost = async (e) => {
    e.preventDefault();

    try {
      if (!window.confirm("Are you sure to delete this post?")) return;
      const res = await fetch(`/api/posts/${post._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Post deleted", "success");
      setPosts(posts.filter((p) => p._id !== post._id));
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  return { handleDeletePost };
}

export default useDeletePost;
