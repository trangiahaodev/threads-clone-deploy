import { Link, useNavigate } from "react-router-dom";
import { Avatar, Box, Flex, Image, Text } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { formatDistanceToNow } from "date-fns";

import ActionButtons from "./ActionButtons";
import getLatestComments from "../../utils/getLatestComments";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useDeletePost from "../hooks/useDeletePost";

function Post({ post }) {
  const { postedBy: user } = post;

  const navigate = useNavigate();

  const currentUser = useRecoilValue(userAtom);

  const { handleDeletePost } = useDeletePost(post);

  const uniqueLatestComments = getLatestComments(post.replies);

  return (
    <Link to={`/${user.username}/post/${post._id}`}>
      <Flex gap={3} mb={4} py={5}>
        {/* Avatars */}
        <Flex flexDirection={"column"} alignItems={"center"}>
          <Avatar
            size={"md"}
            name={user?.name}
            src={user?.profilePicture}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/${user.username}`);
            }}
          />
          <Box w="1px" h={"full"} bg={"gray.light"} my={2}></Box>
          <Box position={"relative"} w={"full"}>
            {post.replies.length === 0 && <Text textAlign={"center"}>🥱</Text>}

            <div style={{ position: "relative", height: "20px" }}>
              {uniqueLatestComments?.slice(-3).map((reply, index) => (
                <Avatar
                  key={reply._id}
                  size={"xs"}
                  name={reply.name}
                  src={reply.userProfilePicture}
                  position={"absolute"}
                  bottom={"0px"}
                  right={`${index * 15}px`}
                  padding={"2px"}
                />
              ))}
            </div>
          </Box>
        </Flex>

        <Flex flex={1} flexDirection={"column"} gap={2}>
          {/* Username + Post's description */}
          <Flex justifyContent={"space-between"} w={"full"}>
            <Flex w={"full"} alignItems={"center"}>
              <Text
                fontSize={"sm"}
                fontWeight={"bold"}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/${user.username}`);
                }}>
                {user?.username}
              </Text>
              <Image src="/verified.png" w={4} h={4} ml={1} />
            </Flex>

            <Flex gap={4} alignItems={"center"}>
              <Text
                fontSize={"sm"}
                textAlign={"right"}
                width={36}
                color={"gray.light"}>
                {formatDistanceToNow(new Date(post.createdAt))} ago
              </Text>

              {currentUser?._id === user._id && (
                <DeleteIcon size={20} onClick={handleDeletePost} />
              )}
            </Flex>
          </Flex>

          <Text fontSize={"sm"}>{post.text}</Text>
          {post.img && (
            <Box
              borderRadius={6}
              overflow={"hidden"}
              border={"1px solid"}
              borderColor={"gray.light"}>
              <Image src={post.img} w={"full"} />
            </Box>
          )}

          {/* Reaction icons */}
          <Flex gap={3} my={1} className="reactions">
            <ActionButtons post={post} />
          </Flex>
        </Flex>
      </Flex>
    </Link>
  );
}

export default Post;
