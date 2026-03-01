const jwt = require('jsonwebtoken');

// 🟢 CHANGE THIS LINE: Use 'exports.protect' instead of 'module.exports'
exports.protect = function(req, res, next) {
    // 1. Log the Header
    const token = req.header('Authorization');
    // console.log("---- AUTH DEBUG ----");
    // console.log("1. Header Received:", token);

    if (!token) {
        // console.log("❌ No token found in header");
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // 2. Clean the token
        const cleanToken = token.startsWith('Bearer ') ? token.slice(7, token.length).trim() : token;
        
        // 3. Check the Secret
        const secret = process.env.JWT_SECRET || 'secret';
        
        // 4. Verify
        const decoded = jwt.verify(cleanToken, secret);
        // console.log("3. Token Decoded Successfully:", decoded);

        req.user = decoded;
        next();
    } catch (err) {
        console.error("❌ JWT Error:", err.message); 
        res.status(401).json({ msg: 'Token is not valid' });
    }
};