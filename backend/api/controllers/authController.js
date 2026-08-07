const AuthService = require('../../services/AuthService');
const authService = new AuthService();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9]{9,15}$/;

const AuthController = {
    async signup(req, res) {
        try {
            const { name, email, password, role, adminSecret, phone } = req.body;
            
            if (!name || !email || !password || !role) {
                return res.status(400).json({ message: 'All required fields must be provided' });
            }

            const cleanName = name.trim();
            const cleanEmail = email.trim().toLowerCase();

            if (cleanName.length < 2 || cleanName.length > 50) {
                return res.status(400).json({ message: 'Full name must be between 2 and 50 characters' });
            }

            if (!emailRegex.test(cleanEmail) || cleanEmail.length > 100) {
                return res.status(400).json({ message: 'Please provide a valid email address (max 100 characters)' });
            }

            if (password.length < 6 || password.length > 50) {
                return res.status(400).json({ message: 'Password must be between 6 and 50 characters' });
            }

            if (role === 'vendor' && phone) {
                const cleanPhone = phone.trim();
                if (!phoneRegex.test(cleanPhone) || cleanPhone.length > 15) {
                    return res.status(400).json({ message: 'Please provide a valid phone number (9-15 digits)' });
                }
            }

            const result = await authService.signup(
                { name: cleanName, email: cleanEmail, password, role, phone: phone ? phone.trim() : '' },
                adminSecret,
                req.io
            );

            res.status(201).json({
                token: result.token,
                user: {
                    _id: result.user._id,
                    id: result.user._id,
                    name: result.user.name,
                    email: result.user.email,
                    role: result.user.role,
                    status: result.user.status
                }
            });
        } catch (error) {
            console.error('Signup error:', error.message);
            res.status(error.message === 'User already exists' ? 400 : 500).json({ message: error.message });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ message: 'Email and password are required' });
            }

            const cleanEmail = email.trim().toLowerCase();

            if (!emailRegex.test(cleanEmail)) {
                return res.status(400).json({ message: 'Please enter a valid email address' });
            }

            const result = await authService.login(cleanEmail, password);

            res.status(200).json({
                token: result.token,
                user: {
                    _id: result.user._id,
                    id: result.user._id,
                    name: result.user.name,
                    email: result.user.email,
                    role: result.user.role,
                    status: result.user.status,
                    phone: result.user.phone
                }
            });
        } catch (error) {
            console.error('Login error:', error.message);
            res.status(400).json({ message: error.message });
        }
    },

    async updateProfile(req, res) {
        try {
            const result = await authService.updateProfile(req.user.id, req.body);
            res.json({
                _id: result.user._id,
                name: result.user.name,
                email: result.user.email,
                phone: result.user.phone,
                role: result.user.role,
                token: result.token
            });
        } catch (error) {
            console.error('Update profile error:', error.message);
            res.status(500).json({ message: error.message });
        }
    },

    async changePassword(req, res) {
        try {
            const { oldPassword, newPassword } = req.body;
            if (!newPassword || newPassword.length < 6 || newPassword.length > 50) {
                return res.status(400).json({ message: 'New password must be between 6 and 50 characters' });
            }
            await authService.changePassword(req.user.id, oldPassword, newPassword);
            res.json({ message: 'Password updated successfully' });
        } catch (error) {
            console.error('Change password error:', error.message);
            res.status(401).json({ message: error.message });
        }
    }
};

module.exports = AuthController;
