import jwt from "jsonwebtoken";


const authenticate = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded; // Attach the decoded user info to req.user
      next();
    } catch (err) {
      return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }
  };

  export {authenticate}