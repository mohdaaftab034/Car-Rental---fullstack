import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const protect = async (req, res, next) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.json({ success: false, message: "Not authorized, no token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // <-- fixed line
        if (!decoded || !decoded.id) {
            return res.json({ success: false, message: "Invalid token" });
        }

        req.user = await User.findById(decoded.id).select("-password");
        next();

    } catch (error) {
        console.error(error);
        return res.json({ success: false, message: "Error in authorization" });
    }
};
