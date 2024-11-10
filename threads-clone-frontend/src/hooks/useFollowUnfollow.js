import { useState } from "react";
import useShowToast from "./useShowToast";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";

function useFollowUnfollow(user) {
  const currentUser = useRecoilValue(userAtom);
  const [following, setFollowing] = useState(
    user.followers.includes(currentUser?.id)
  );
  const [updating, setUpdating] = useState(false);

  const showToast = useShowToast();

  const handleFollowAndUnfollow = async () => {
    if (!currentUser) {
      showToast("Error", "Please login to follow", "error");
      return;
    }
    if (updating) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/users/follow/${user._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      if (following) {
        showToast("Success", "Unfollowed successfully", "success");
        user.followers.pop(); // remove the current user from the followers array
      } else {
        showToast("Success", "Followed successfully", "success");
        user.followers.push(currentUser._id); // add the current user to the followers array
      }

      setFollowing(!following);
    } catch (err) {
      showToast("Error", err, "error");
    } finally {
      setUpdating(false);
    }
  };
  return { handleFollowAndUnfollow, updating, following };
}

export default useFollowUnfollow;
