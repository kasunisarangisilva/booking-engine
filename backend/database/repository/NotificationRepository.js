const Notification = require('../models/Notification');

class NotificationRepository {
    async findByRecipient(recipient) {
        return await Notification.find({ recipient }).sort({ createdAt: -1 });
    }

    async updateMany(query, update) {
        return await Notification.updateMany(query, update);
    }

    async deleteMany(query) {
        return await Notification.deleteMany(query);
    }

    async findByIdAndUpdate(id, update) {
        return await Notification.findByIdAndUpdate(id, update);
    }

    async findByIdAndDelete(id) {
        return await Notification.findByIdAndDelete(id);
    }

    async create(data) {
        const notif = new Notification(data);
        return await notif.save();
    }
}

module.exports = NotificationRepository;
