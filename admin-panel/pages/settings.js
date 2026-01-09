import AdminLayout from '../components/AdminLayout';

export default function Settings() {
    return (
        <AdminLayout>
            <div className="max-w-2xl mx-auto md:mx-0">
                <h1 className="text-2xl md:text-3xl font-bold mb-8">Platform Settings</h1>
                <div className="card p-6 md:p-8 space-y-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Platform Name</label>
                        <input
                            type="text"
                            defaultValue="Multi-Vendor Booking"
                            className="w-full md:w-[400px] p-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-accent bg-white"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold">Commission Rate (%)</label>
                        <input
                            type="number"
                            defaultValue="10"
                            className="w-full md:w-[400px] p-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-accent bg-white"
                        />
                    </div>
                    <div className="pt-4">
                        <button className="btn btn-accent px-8 py-3 w-full md:w-auto">Save Changes</button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
