const AdminRepository = require('../database/repository/AdminRepository');

class AdminService {
    constructor() {
        this.adminRepository = new AdminRepository();
    }
    
    async getAllVendorsV2(params) {
        try {
            return await this.adminRepository.getAllVendorsV2(params);
        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }
}

module.exports = AdminService;
