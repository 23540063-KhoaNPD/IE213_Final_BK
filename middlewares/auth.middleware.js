console.log(`starting jwt auth middle ware`)

import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  // console.log("TOKEN:", token);   // 👈 thêm dòng này

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWTKEY);
    //  console.log("DECODED:", decoded);  // 👈 thêm dòng này
     
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};