const AuthService = require('../../services/AuthService');
const authService = new AuthService();

const AuthController = {
    async signup(req, res) {
        try {
            const { name, email, password, role, adminSecret, phone } = req.body;
            if (!name || !email || !password || !role) {
                return res.status(400).json({ message: 'All fields are required' });
            }

            const result = await authService.signup(
                { name, email, password, role, phone },
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
            const result = await authService.login(email, password);

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
            await authService.changePassword(req.user.id, oldPassword, newPassword);
            res.json({ message: 'Password updated successfully' });
        } catch (error) {
            console.error('Change password error:', error.message);
            res.status(401).json({ message: error.message });
        }
    }
};

module.exports = AuthController;
