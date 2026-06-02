const NotificationRepository = require('../database/repository/NotificationRepository');

class NotificationService {
    constructor() {
        this.notifRepo = new NotificationRepository();
    }

    async getNotifications(user) {
        const recipient = user.role === 'admin' ? 'admin' : user._id.toString();
        return await this.notifRepo.findByRecipient(recipient);
    }

    async markAsRead(id) {
        return await this.notifRepo.findByIdAndUpdate(id, { read: true });
    }

    async markAllAsRead(user) {
        const recipient = user.role === 'admin' ? 'admin' : user._id.toString();
        return await this.notifRepo.updateMany({ recipient, read: false }, { read: true });
    }

    async deleteNotification(id) {
        return await this.notifRepo.findByIdAndDelete(id);
    }

    async clearAll(user) {
        const recipient = user.role === 'admin' ? 'admin' : user._id.toString();
        return await this.notifRepo.deleteMany({ recipient });
    }
}

module.exports = NotificationService;
