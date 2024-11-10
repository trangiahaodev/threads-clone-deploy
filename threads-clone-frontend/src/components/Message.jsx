import { Avatar, Box, Flex, Image, Skeleton, Text } from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import { selectedConversationAtom } from "../atoms/conversationsAtom";
import userAtom from "../atoms/userAtom";

import { BsCheck2All } from "react-icons/bs";
import { useState } from "react";

function Message({ ownMessage, message }) {
  const selectedConversation = useRecoilValue(selectedConversationAtom);
  const [imgLoaded, setImgLoaded] = useState(false);
  const user = useRecoilValue(userAtom);

  return (
    <>
      {ownMessage ? (
        <Flex gap={2} alignSelf={"flex-end"}>
          {message.text && (
            <Flex
              bg={"green.800"}
              maxW={"350px"}
              p={1}
              pl={2}
              borderRadius={"md"}>
              <Text color={"white"}>{message.text}</Text>
              <Box
                alignSelf={"flex-end"}
                ml={1}
                color={message.seen ? "blue.400" : ""}
                fontWeight={"bold"}>
                <BsCheck2All size={16} />
              </Box>
            </Flex>
          )}

          {/* If the image hasn't loaded yet, show skeleton */}
          {message.img && !imgLoaded && (
            <Flex mt={5} w={"200px"}>
              <Image
                src={message.img}
                hidden
                alt="Message image"
                borderRadius={4}
                onLoad={() => setImgLoaded(true)}
              />
              <Skeleton w={"200px"} h={"200px"} />
            </Flex>
          )}

          {message.img && imgLoaded && (
            <Flex mt={5} w={"200px"}>
              <Image src={message.img} alt="Message image" borderRadius={4} />
              <Box
                alignSelf={"flex-end"}
                ml={1}
                color={message.seen ? "blue.400" : ""}
                fontWeight={"bold"}>
                <BsCheck2All size={16} />
              </Box>
            </Flex>
          )}

          <Avatar src={user.profilePicture} w={7} h={7} />
        </Flex>
      ) : (
        <Flex gap={2}>
          <Avatar src={selectedConversation.userProfilePicture} w={7} h={7} />

          {message.text && (
            <Text
              maxW={"350px"}
              bg={"gray.400"}
              p={2}
              borderRadius={"md"}
              color={"black"}>
              {message.text}
            </Text>
          )}

          {message.img && !imgLoaded && (
            <Flex mt={5} w={"200px"}>
              <Image
                src={message.img}
                hidden
                alt="Message image"
                borderRadius={4}
                onLoad={() => setImgLoaded(true)}
              />
              <Skeleton w={"200px"} h={"200px"} />
            </Flex>
          )}

          {message.img && imgLoaded && (
            <Flex mt={5} w={"200px"}>
              <Image src={message.img} alt="Message image" borderRadius={4} />
            </Flex>
          )}
        </Flex>
      )}
    </>
  );
}

export default Message;
