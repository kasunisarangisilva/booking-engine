const fs = require('fs');
const path = require('path');

// Simple file-based mock DB for now to avoid external DB setup complexity initially
// In a real app, this would be Mongoose or Sequelize
const usersFilePath = path.join(__dirname, '../data/users.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(usersFilePath))) {
    fs.mkdirSync(path.dirname(usersFilePath), { recursive: true });
    fs.writeFileSync(usersFilePath, '[]');
}

class User {
    constructor(id, name, email, password, role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role; // 'user', 'vendor', 'admin'
    }

    static findAll() {
        const data = fs.readFileSync(usersFilePath);
        return JSON.parse(data);
    }

    static findByEmail(email) {
        const users = this.findAll();
        return users.find(u => u.email === email);
    }

    static findById(id) {
        const users = this.findAll();
        return users.find(u => u.id === id);
    }

    static create(user) {
        const users = this.findAll();
        users.push(user);
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
        return user;
    }
}

module.exports = User;
