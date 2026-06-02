const User = require('../models/User');

class AdminRepository {
    async getVendors({ page = 1, limit = 10 }) {
        const skip = (page - 1) * limit;

        const totalVendors = await User.countDocuments({ role: 'vendor' });
        const vendors = await User.find({ role: 'vendor' })
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        return { vendors, totalVendors };
    }
    
    async getAllVendorsV2(inputs) {
        const { page, limit, sort } = inputs;
        try {
            const query = {
                role: 'vendor'
            };

            const skip = (page - 1) * limit;

            let sortCriteria = {};
            if (sort == 1) {
                sortCriteria = { name: 1 }; // asc name
            } else if (sort == 2) {
                sortCriteria = { name: -1 }; // desc name
            } else {
                sortCriteria = { createdAt: -1 }; // default: newest first
            }
            
            const vendors = await User.find(query)
                .select('-password')
                .skip(skip)
                .limit(limit)
                .sort(sortCriteria)
                .lean();
                
            const totalVendors = await User.countDocuments(query);
            
            return { 
                success: true, 
                message: 'Vendors retrieved successfully',
                data: { page, limit, totalVendors, vendors: vendors } 
            };
        } catch (error) {
            console.log(error);
            return { 
                success: false, 
                message: error.message, 
                data: null 
            };
        }
    }
}

module.exports = AdminRepository;
