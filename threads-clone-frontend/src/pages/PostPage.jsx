import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Image,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";

import ActionButtons from "../components/ActionButtons";
import Comments from "../components/Comments";

import useGetUserProfile from "../hooks/useGetUserProfile";
import useShowToast from "../hooks/useShowToast";
import postAtom from "../atoms/postAtom";

function PostPage() {
  // Custom hooks
  const { loading, user } = useGetUserProfile();
  const showToast = useShowToast();

  // React-router hooks
  const { pid } = useParams();
  const navigate = useNavigate();

  // Recoil hooks
  const currentUser = useRecoilValue(userAtom);
  const [posts, setPosts] = useRecoilState(postAtom);

  const currentPost = posts[0];

  useEffect(() => {
    const getPost = async () => {
      setPosts([]);

      try {
        const res = await fetch(`/api/posts/${pid}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setPosts([data]);
      } catch (error) {
        showToast("Error", error.message, "error");
      }
    };

    getPost();
  }, [pid, showToast, setPosts]);

  const handleDeletePost = async () => {
    try {
      if (!window.confirm("Are you sure to delete this post?")) return;
      const res = await fetch(`/api/posts/${currentPost._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Post deleted", "success");
      navigate(`/${user.username}`);
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  if (!user && loading)
    return (
      <Flex justifyContent={"center"}>
        <Spinner size={"xl"} />
      </Flex>
    );

  if (!currentPost) return null;

  return (
    <>
      <Flex justifyContent={"space-between"}>
        {/* Post Header */}
        <Flex w={"fulle"} alignItems={"center"} gap={3}>
          <Avatar src={user.profilePicture} size={"md"} name={user.name} />
          <Flex alignItems={"center"}>
            <Text fontSize={"sm"} fontWeight={"bold"}>
              {user.username}
            </Text>
            <Image src="/verified.png" alt="verified" w={"4"} h={4} ml={4} />
          </Flex>
        </Flex>

        <Flex gap={4} alignItems={"center"}>
          <Text
            fontSize={"sm"}
            textAlign={"right"}
            width={36}
            color={"gray.light"}>
            {formatDistanceToNow(new Date(currentPost.createdAt))} ago
          </Text>

          {currentUser?._id === user._id && (
            <DeleteIcon
              size={20}
              cursor={"pointer"}
              onClick={handleDeletePost}
            />
          )}
        </Flex>
      </Flex>

      <Text my={3}>{currentPost.text}</Text>

      {currentPost.img && (
        <Box
          borderRadius={6}
          overflow={"hidden"}
          border={"1px solid"}
          borderColor={"gray.light"}>
          <Image src={currentPost.img} w={"full"} />
        </Box>
      )}

      <Flex gap={3} my={3} className="reactions">
        <ActionButtons post={currentPost} />
      </Flex>

      <Divider my={4} />

      <Flex justifyContent={"space-between"}>
        <Flex gap={2} alignItems={"center"}>
          <Text fontSize={"2xl"}>👋</Text>
          <Text color={"gray.light"}>Get the app to like, reply and post</Text>
        </Flex>
        <Button>Get</Button>
      </Flex>

      <Divider my={4} />

      {currentPost.replies.map((reply) => (
        <Comments
          key={reply._id}
          reply={reply}
          lastReply={
            reply._id ===
            currentPost.replies[currentPost.replies.length - 1]._id
          }
        />
      ))}
    </>
  );
}

export default PostPage;
