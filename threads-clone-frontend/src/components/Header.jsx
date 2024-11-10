// React
import { Link } from "react-router-dom";

// Recoil
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import authScreenAtom from "../atoms/authAtom";

// Chakra UI
import { Button, Flex, Image, useColorMode } from "@chakra-ui/react";
import { AiFillHome } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { FiLogOut } from "react-icons/fi";
import { BsFillChatQuoteFill } from "react-icons/bs";

// Custom hooks
import useLogout from "../hooks/useLogout";

function Header() {
  // Recoil
  const user = useRecoilValue(userAtom);
  const setAuthScreen = useSetRecoilState(authScreenAtom);

  // Chakra UI
  const { colorMode, toggleColorMode } = useColorMode();

  // Cudtom hooks
  const { handleLogout } = useLogout();

  return (
    <Flex justifyContent={"space-between"} mt={6} mb="12">
      {user && (
        <Link to="/">
          <AiFillHome size={24} />
        </Link>
      )}

      {!user && (
        <Link to="/auth" onClick={() => setAuthScreen("login")}>
          Login
        </Link>
      )}

      <Image
        cursor={"pointer"}
        alt="logo"
        w={6}
        src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
        onClick={toggleColorMode}
      />

      {user && (
        <Flex alignItems={"center"} gap={4}>
          <Link to={`/${user.username}`}>
            <RxAvatar size={24} />
          </Link>
          <Link to={`/chat`}>
            <BsFillChatQuoteFill size={20} />
          </Link>
          <Button size={"xs"} onClick={handleLogout}>
            <FiLogOut size={20} />
          </Button>
        </Flex>
      )}

      {!user && (
        <Link to="/auth" onClick={() => setAuthScreen("signup")}>
          Sign up
        </Link>
      )}
    </Flex>
  );
}

export default Header;
