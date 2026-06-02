const User = require('../models/User');

class AuthRepository {
    async findUserByEmail(email) {
        return await User.findOne({ email });
    }

    async createUser(userData) {
        const user = new User(userData);
        return await user.save();
    }

    async findUserById(id) {
        return await User.findById(id);
    }
}

module.exports = AuthRepository;
