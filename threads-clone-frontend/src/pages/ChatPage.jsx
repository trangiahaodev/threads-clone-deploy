import { useEffect, useState } from "react";

import {
  Box,
  Button,
  Flex,
  Input,
  Skeleton,
  SkeletonCircle,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { GiConversation } from "react-icons/gi";

import { useRecoilState, useRecoilValue } from "recoil";
import {
  conversationsAtom,
  selectedConversationAtom,
} from "../atoms/conversationsAtom";
import userAtom from "../atoms/userAtom";

import Conversations from "../components/Conversations";
import MessageContainer from "../components/MessageContainer";

import useShowToast from "../hooks/useShowToast";
import { useSocket } from "../../context/SocketContext";

function ChatPage() {
  const [searchText, setSearchText] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [searchingUser, setSearchingUser] = useState(false);

  const [conversations, setConversations] = useRecoilState(conversationsAtom);
  const [selectedConversation, setSelectedConversation] = useRecoilState(
    selectedConversationAtom
  );
  const currentUser = useRecoilValue(userAtom);

  const showToast = useShowToast();

  const { socket, onlineUsers } = useSocket();

  useEffect(() => {
    socket?.on("messagesSeen", ({ conversationId }) => {
      setConversations((prev) => {
        const updatedConversations = prev.map((conversation) => {
          if (conversation._id === conversationId) {
            return {
              ...conversation,
              lastMessage: {
                ...conversation.lastMessage,
                seen: true,
              },
            };
          }
          return conversation;
        });
        return updatedConversations;
      });
    });
  }, [socket, setConversations]);

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await fetch("/api/messages/conversations");
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setConversations(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoadingConversations(false);
      }
    };

    getConversations();
  }, [showToast, setConversations]);

  const handleConversationSearch = async (e) => {
    e.preventDefault();
    setSearchingUser(true);

    try {
      const res = await fetch(`/api/users/profile/${searchText}`);
      const searchedUser = await res.json();
      if (searchedUser.error) {
        showToast("Error", searchedUser.error, "error");
        return;
      }

      // If the user is trying to message themselves
      const messagingSelf = searchedUser._id === currentUser._id;
      if (messagingSelf) {
        showToast("Error", "You cannot message yourself", "error");
        return;
      }

      // If the user is already in a conversation with the searched user
      const existedConversation = conversations.find(
        (conversation) => conversation.participants[0]._id === searchedUser._id
      );
      if (existedConversation) {
        setSelectedConversation({
          _id: existedConversation._id,
          userId: searchedUser._id,
          username: searchedUser.username,
          userProfilePicture: searchedUser.profilePicture,
        });
      }

      const mockConversation = {
        mock: true,
        lastMessage: {
          text: "",
          sender: "",
        },
        _id: Date.now(),
        participants: [
          {
            _id: searchedUser._id,
            username: searchedUser.username,
            profilePicture: searchedUser.profilePicture,
          },
        ],
      };
      setConversations((prevConvs) => [...prevConvs, mockConversation]);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setSearchingUser(false);
    }
  };

  return (
    <Box
      position={"absolute"}
      left={"50%"}
      transform={"translateX(-50%)"}
      w={{ base: "100%", md: "80%", lg: "750px" }}>
      <Flex
        gap={4}
        flex={{
          base: "column",
          md: "row",
        }}
        maxW={{
          sm: "400px",
          md: "full",
        }}
        mx={"auto"}>
        <Flex
          flex={30}
          gap={2}
          flexDirection={"column"}
          maxW={{
            sm: "250px",
            md: "full",
          }}
          mx={"auto"}>
          <Text
            fontWeight={700}
            color={useColorModeValue("gray.600", "gray.400")}>
            Your conversation
          </Text>
          <form onSubmit={handleConversationSearch}>
            <Flex alignItems={"center"} gap={2}>
              <Input
                placeholder="Search for a user"
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
              />
              <Button
                size={"sm"}
                onClick={handleConversationSearch}
                isLoading={searchingUser}>
                <SearchIcon />
              </Button>
            </Flex>
          </form>

          {loadingConversations &&
            [0, 1, 2, 3, 4].map((_, i) => (
              <Flex
                key={i}
                gap={4}
                alignItems={"center"}
                p={"1"}
                borderRadius={"md"}>
                <Box>
                  <SkeletonCircle size={"10"} />
                </Box>
                <Flex w={"full"} flexDirection={"column"} gap={3}>
                  <Skeleton h={"10px"} w={"80px"} />
                  <Skeleton h={"8px"} w={"90%"} />
                </Flex>
              </Flex>
            ))}

          {!loadingConversations &&
            conversations.map((conversation) => (
              <Conversations
                key={conversation._id}
                isOnline={onlineUsers.includes(
                  conversation.participants[0]._id
                )}
                conversation={conversation}
              />
            ))}
        </Flex>

        {!selectedConversation._id && (
          <Flex
            flex={70}
            borderRadius={"md"}
            p={2}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            height={"400px"}>
            <GiConversation size={100} />
            <Text>Select a conversation to start messaging</Text>
          </Flex>
        )}

        {selectedConversation._id && <MessageContainer />}
      </Flex>
    </Box>
  );
}

export default ChatPage;
