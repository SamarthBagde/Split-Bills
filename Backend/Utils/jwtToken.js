import jwt from "jsonwebtoken";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const sendToken = (user, statusCode, res) => {
  const token = signToken(user.userId);

  const option = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };

  user.password = undefined;
  res.status(statusCode).cookie("jwtToken", token, option).json({
    status: "success",
    token: token,
    data: {
      user,
    },
  });
};
