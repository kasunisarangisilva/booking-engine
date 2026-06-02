const NotificationService = require('../../services/NotificationService');
const notificationService = new NotificationService();

const NotificationController = {
    async getMyNotifications(req, res) {
        try {
            const notifications = await notificationService.getNotifications(req.user);
            res.status(200).json(notifications);
        } catch (error) {
            console.error('Get notifications error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    async markAsRead(req, res) {
        try {
            await notificationService.markAsRead(req.params.id);
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Mark read error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    async markAllAsRead(req, res) {
        try {
            await notificationService.markAllAsRead(req.user);
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Mark all read error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    async deleteNotification(req, res) {
        try {
            await notificationService.deleteNotification(req.params.id);
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Delete notification error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    },

    async clearAllNotifications(req, res) {
        try {
            await notificationService.clearAll(req.user);
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Clear all error:', error);
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = NotificationController;
