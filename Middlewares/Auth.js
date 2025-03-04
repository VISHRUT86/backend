const jwt = require("jsonwebtoken");

const ensureAuthenticated = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    // console.log("🔍 Auth Header:", authHeader); // Debugging ke liye

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        // console.log("❌ No token provided");
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            // console.log("❌ Token verification failed");
            return res.status(401).json({ message: "Unauthorized: Token verification failed" });
        }

        req.user = decoded;
        // console.log("✅ Token Verified:", decoded); // Debugging ke liye

        next();
    } catch (error) {
        // console.log("❌ Invalid token:", error.message);
        return res.status(401).json({ message: "Unauthorized: Invalid token", error: error.message });
    }
};

module.exports = ensureAuthenticated;
