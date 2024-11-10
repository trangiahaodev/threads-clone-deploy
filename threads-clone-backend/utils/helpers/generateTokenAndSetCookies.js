import jwt from "jsonwebtoken";
const generateTokenAndSetCookies = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });

  res.cookie("jwt", token, {
    httpOnly: true, // This cookie cannot be accessed by the browser
    maxAge: 15 * 24 * 60 * 60 * 1000,
    sameSite: "strict", // CSRF
  });

  return token;
};

export default generateTokenAndSetCookies;
