import { useState } from "react";
import {
  Button,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";

import useShowToast from "../hooks/useShowToast";

import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import postAtom from "../atoms/postAtom";

function CommentSVG({ post }) {
  // React hooks
  const [postReplies, setPostReplies] = useState("");
  const [loading, setLoading] = useState(false);

  // Recoil hooks
  const user = useRecoilValue(userAtom);
  const [posts, setPosts] = useRecoilState(postAtom);

  // Chakra UI hooks
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Custom hooks
  const showToast = useShowToast();

  const handleReply = async (e) => {
    e.preventDefault();

    if (loading) return;
    setLoading(true);

    if (!user)
      return showToast("Error", "You must be logged in to reply", "error");

    try {
      const res = await fetch(`/api/posts/reply/${post._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: postReplies }),
      });

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      const updatedPosts = posts.map((p) => {
        if (p._id === post._id) return { ...p, replies: [...p.replies, data] };
        else return p;
      });
      setPosts(updatedPosts);

      showToast("Success", "Reply created successfully", "success");
      setPostReplies("");
      onClose();
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <svg
        aria-label="Comment"
        color=""
        fill=""
        height="20"
        role="img"
        viewBox="0 0 24 24"
        width="20"
        onClick={onOpen}>
        <title>Comment</title>
        <path
          d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
          fill="none"
          stroke="currentColor"
          strokeLinejoin="round"
          strokeWidth="2"></path>
      </svg>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Input
                placeholder="Reply goes here..."
                value={postReplies}
                onChange={(e) => setPostReplies(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" size={"sm"} mr={3} onClick={handleReply}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default CommentSVG;
