import React, { useState, useEffect } from 'react';
import { ChevronLeft, UserCircle } from 'lucide-react';
import * as FirebaseService from '../services/firebaseService';

const EditProfilePage = ({ goToPage, userId, showNotification, onProfileUpdate }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        loadUserData();
    }, [userId]);

    const loadUserData = async () => {
        const result = await FirebaseService.getUserProfile(userId);
        if (result.success) {
            setName(result.data.name || '');
            setPhone(result.data.phone || '');
            setAddress(result.data.address || '');
        }
        setInitialLoading(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await FirebaseService.updateUserProfile(userId, {
            name,
            phone,
            address
        });

        setLoading(false);

        if (result.success) {
            showNotification('Profile updated successfully!', 'success');
            if (onProfileUpdate) await onProfileUpdate();
            goToPage('Profile');
        } else {
            showNotification(result.error || 'Failed to update profile', 'error');
        }
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 pb-16">
            <header className="flex justify-between items-center p-4 bg-white shadow-md sticky top-0 z-20">
                <button onClick={() => goToPage('Profile')} className="p-2 rounded-full hover:bg-gray-100 text-primary">
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-primary">Edit Profile</h1>
                <div className="w-10"></div>
            </header>

            <div className="flex-1 max-w-2xl mx-auto w-full p-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <form onSubmit={handleSave}>
                        <div className="mb-6">
                            <label className="text-sm font-semibold text-gray-700 block mb-2">Full Name</label>
                            <input
                                type="text"
                                className="w-full h-12 border border-gray-300 rounded-lg px-4 text-gray-800 focus:ring-2 focus:ring-primary"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="text-sm font-semibold text-gray-700 block mb-2">Phone Number</label>
                            <input
                                type="tel"
                                className="w-full h-12 border border-gray-300 rounded-lg px-4 text-gray-800 focus:ring-2 focus:ring-primary"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="text-sm font-semibold text-gray-700 block mb-2">Address</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-primary"
                                rows="3"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => goToPage('Profile')}
                                className="flex-1 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`flex-1 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-purple-700 transition-colors shadow-lg ${loading ? 'opacity-70' : ''}`}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfilePage;
