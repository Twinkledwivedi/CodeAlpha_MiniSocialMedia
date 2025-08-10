const Database = require('./database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
    constructor() {
        this.db = new Database('users.json');
    }

    async create(userData) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = {
            id: uuidv4(),
            username: userData.username,
            email: userData.email,
            password: hashedPassword,
            profilePicture: userData.profilePicture || null,
            bio: userData.bio || '',
            followers: [],
            following: [],
            createdAt: new Date().toISOString()
        };
        return this.db.create(user);
    }

    findAll() {
        return this.db.findAll().map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }

    findById(id) {
        const user = this.db.findById(id);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    }

    findByEmail(email) {
        return this.db.findByField('email', email);
    }

    findByUsername(username) {
        return this.db.findByField('username', username);
    }

    async validatePassword(email, password) {
        const user = this.findByEmail(email);
        if (!user) return false;
        return await bcrypt.compare(password, user.password);
    }

    update(id, updateData) {
        if (updateData.password) {
            updateData.password = bcrypt.hashSync(updateData.password, 10);
        }
        return this.db.update(id, updateData);
    }

    delete(id) {
        return this.db.delete(id);
    }
}

module.exports = User;
