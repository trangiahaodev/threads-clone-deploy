import { useState } from "react";
import useShowToast from "./useShowToast";

function usePreviewImage() {
  const [imageUrl, setImageUrl] = useState(null);
  const showToast = useShowToast();

  const handleImageChange = (e) => {
    // Get the file object from FileList object returned when user selecting files
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      // If the file exists, continue reading content of the file
      const reader = new FileReader();

      reader.onloadend = () => {
        setImageUrl(reader.result);
      };

      reader.readAsDataURL(file);
    } else {
      showToast("Error", "Please select an image file", "error");
      setImageUrl(null);
    }
  };
  return { handleImageChange, imageUrl, setImageUrl };
}

export default usePreviewImage;
