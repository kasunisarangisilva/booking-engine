const AuthRepository = require('../database/repository/AuthRepository');
const jwt = require('jsonwebtoken');
const Notification = require('../database/models/Notification');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_123';

class AuthService {
    constructor() {
        this.authRepository = new AuthRepository();
    }

    async signup(userData, adminSecret, io) {
        const { name, email, password, role, phone } = userData;

        if (role === 'admin') {
            const ADMIN_SETUP_KEY = process.env.ADMIN_SETUP_KEY || 'admin_secret_key_123';
            if (adminSecret !== ADMIN_SETUP_KEY) {
                throw new Error('Invalid Admin Setup Key');
            }
        }

        const existingUser = await this.authRepository.findUserByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const newUser = await this.authRepository.createUser({
            name, email, password, role, phone
        });

        const token = this.generateToken(newUser._id, newUser.role);

        // Notify Admin
        if (newUser.role === 'vendor' && io) {
            const notif = new Notification({
                recipient: 'admin',
                type: 'new_vendor',
                message: `New vendor registered: ${newUser.name}`,
                data: { vendorId: newUser._id }
            });
            await notif.save();
            io.to('admin').emit('notification', {
                ...notif.toObject(),
                data: newUser
            });
        }

        return { token, user: newUser };
    }

    async login(email, password) {
        const user = await this.authRepository.findUserByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken(user._id, user.role);
        return { token, user };
    }

    async updateProfile(userId, updateData) {
        const user = await this.authRepository.findUserById(userId);
        if (!user) throw new Error('User not found');

        user.name = updateData.name || user.name;
        user.email = updateData.email || user.email;
        user.phone = updateData.phone || user.phone;

        if (updateData.password) {
            user.password = updateData.password;
        }

        const updatedUser = await user.save();
        const token = this.generateToken(updatedUser._id, updatedUser.role);
        return { user: updatedUser, token };
    }

    async changePassword(userId, oldPassword, newPassword) {
        const user = await this.authRepository.findUserById(userId);
        if (!user) throw new Error('User not found');

        const isMatch = await user.comparePassword(oldPassword);
        if (!isMatch) throw new Error('Invalid old password');

        user.password = newPassword;
        await user.save();
        return { success: true };
    }

    generateToken(id, role) {
        return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '1d' });
    }
}

module.exports = AuthService;
