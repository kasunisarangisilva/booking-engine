const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_123';

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

const vendorMiddleware = (req, res, next) => {
    if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Vendor only.' });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware, vendorMiddleware };
