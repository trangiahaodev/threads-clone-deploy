import { useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "./useShowToast";
import { useNavigate } from "react-router-dom";

function useLogout() {
  const setUser = useSetRecoilState(userAtom);
  const showToast = useShowToast();

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/users/logout", {
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

      localStorage.removeItem("user-threads");
      showToast("Loading", "Logging out...", "loading");

      setTimeout(() => {
        navigate("/auth");
        setUser(null);
      }, "2200");
    } catch (error) {
      showToast("Error", error, "error");
    }
  };

  return { handleLogout };
}

export default useLogout;
