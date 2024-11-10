"use client";

import { useRef, useState } from "react";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useColorModeValue,
  Avatar,
  Center,
} from "@chakra-ui/react";

import { useRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";

import usePreviewImage from "../hooks/usePreviewImage";
import useShowToast from "../hooks/useShowToast";
import { useNavigate } from "react-router-dom";

export default function UpdateProfilePage() {
  // React-router hooks
  const navigate = useNavigate();

  // Recoil hooks
  const [user, setUser] = useRecoilState(userAtom);

  // React hooks
  const [inputs, setInputs] = useState({
    name: user.name,
    username: user.username,
    email: user.email,
    biography: user.biography,
    password: "",
  });
  const fileRef = useRef(null);
  const [updating, setUpdating] = useState(false);

  // Custom hooks
  const showToast = useShowToast();
  const { handleImageChange, imageUrl } = usePreviewImage();

  // Handle functions
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (updating) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/users/update/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...inputs, profilePicture: imageUrl }),
      });

      const data = await res.json(); // updated user object
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      showToast("Success", "Profile updated successfully", "success");
      setUser(data);
      localStorage.setItem("user-threads", JSON.stringify(data));
    } catch (error) {
      showToast("Error", error, "error");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex align={"center"} justify={"center"} my={6}>
        <Stack
          spacing={4}
          w={"full"}
          maxW={"md"}
          bg={useColorModeValue("white", "gray.dark")}
          rounded={"xl"}
          boxShadow={"lg"}
          p={6}
          my={12}>
          <Heading lineHeight={1.1} fontSize={{ base: "2xl", sm: "3xl" }}>
            User Profile Edit
          </Heading>
          <FormControl id="userName">
            <Stack direction={["column", "row"]} spacing={6}>
              <Center>
                <Avatar
                  size="xl"
                  boxShadow={"md"}
                  src={imageUrl || user.profilePicture}
                />
              </Center>
              <Center w="full">
                <Button w="full" onClick={() => fileRef.current.click()}>
                  Change Avatar
                </Button>
                <Input
                  type="file"
                  hidden
                  ref={fileRef}
                  onChange={handleImageChange}
                />
              </Center>
            </Stack>
          </FormControl>
          <FormControl>
            <FormLabel>Full name</FormLabel>
            <Input
              placeholder="John Doe"
              _placeholder={{ color: "gray.500" }}
              type="text"
              value={inputs.name}
              onChange={(e) =>
                setInputs((inputs) => ({
                  ...inputs,
                  name: e.target.value,
                }))
              }
            />
          </FormControl>
          <FormControl>
            <FormLabel>User name</FormLabel>
            <Input
              placeholder="johndoe"
              _placeholder={{ color: "gray.500" }}
              type="text"
              value={inputs.username}
              onChange={(e) =>
                setInputs((inputs) => ({
                  ...inputs,
                  username: e.target.value,
                }))
              }
            />
          </FormControl>
          <FormControl>
            <FormLabel>Email</FormLabel>
            <Input
              placeholder="your-email@example.com"
              _placeholder={{ color: "gray.500" }}
              type="email"
              value={inputs.email}
              onChange={(e) =>
                setInputs((inputs) => ({
                  ...inputs,
                  email: e.target.value,
                }))
              }
            />
          </FormControl>
          <FormControl>
            <FormLabel>Biography</FormLabel>
            <Input
              placeholder="Your bio."
              value={inputs.biography}
              onChange={(e) =>
                setInputs({ ...inputs, biography: e.target.value })
              }
              _placeholder={{ color: "gray.500" }}
              type="text"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Password</FormLabel>
            <Input
              placeholder="Password"
              value={inputs.password}
              onChange={(e) =>
                setInputs({ ...inputs, password: e.target.value })
              }
              _placeholder={{ color: "gray.500" }}
              type="password"
            />
          </FormControl>

          <Stack spacing={6} direction={["column", "row"]}>
            <Button
              bg={"red.400"}
              color={"white"}
              w="full"
              _hover={{
                bg: "red.500",
              }}
              onClick={() => navigate(`/${user.username}`)}>
              Cancel
            </Button>
            <Button
              bg={"green.400"}
              color={"white"}
              w="full"
              _hover={{
                bg: "green.500",
              }}
              type="submit"
              isLoading={updating}>
              Submit
            </Button>
          </Stack>
        </Stack>
      </Flex>
    </form>
  );
}
