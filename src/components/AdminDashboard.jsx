import React, { useState, useEffect } from 'react';
import { ChevronLeft, Calendar, MapPin, UserCircle, Clock, Check, X, Users, Briefcase, Plus, Trash2, Star, Shield, FileText } from 'lucide-react';
import * as FirebaseService from '../services/firebaseService';

const AdminDashboard = ({ goToPage, showNotification, onLogout }) => {
    const [bookings, setBookings] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, confirmed, completed
    const [activeTab, setActiveTab] = useState('bookings'); // bookings, workers
    const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
    const [newWorker, setNewWorker] = useState({
        name: '',
        cnic: '',
        phone: '',
        location: '', // Public location
        address: '', // Private address
        policeVerified: false,
        residentPass: false,
        skills: '',
        rating: 5.0,
        languages: '',
        bio: '',
        age: '',
        specialty: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [bookingsResult, workersResult] = await Promise.all([
            FirebaseService.getAllBookings(),
            FirebaseService.getWorkers()
        ]);

        if (bookingsResult.success) {
            console.log('Bookings loaded:', bookingsResult.data);
            setBookings(bookingsResult.data);
            setError(null);
        } else {
            console.error('Failed to load bookings:', bookingsResult.error);
            setError(bookingsResult.error);
        }
        if (workersResult.success) {
            console.log('Workers loaded:', workersResult.data);
            setWorkers(workersResult.data);
        }
        setLoading(false);
    };

    const handleAccept = async (bookingId) => {
        const result = await FirebaseService.updateBookingStatus(bookingId, 'Confirmed');
        if (result.success) {
            showNotification('Booking accepted!', 'success');
            loadData();
        } else {
            showNotification('Failed to accept booking', 'error');
        }
    };

    const handleReject = async (bookingId) => {
        const result = await FirebaseService.updateBookingStatus(bookingId, 'Cancelled');
        if (result.success) {
            showNotification('Booking rejected', 'info');
            loadData();
        } else {
            showNotification('Failed to reject booking', 'error');
        }
    };

    const handleAssignWorker = async (bookingId, workerName) => {
        const result = await FirebaseService.updateBookingStatus(bookingId, 'In Progress', workerName);
        if (result.success) {
            showNotification(`Worker ${workerName} assigned!`, 'success');
            loadData();
        } else {
            showNotification('Failed to assign worker', 'error');
        }
    };

    const handleMarkCompleted = async (bookingId) => {
        const result = await FirebaseService.updateBookingStatus(bookingId, 'Completed');
        if (result.success) {
            showNotification('Booking marked as completed!', 'success');
            loadData();
        } else {
            showNotification('Failed to update booking', 'error');
        }
    };

    const handleAddWorker = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Process comma-separated lists
        const workerData = {
            ...newWorker,
            skills: newWorker.skills.split(',').map(s => s.trim()).filter(s => s),
            languages: newWorker.languages.split(',').map(s => s.trim()).filter(s => s),
            age: parseInt(newWorker.age) || 0,
            rating: parseFloat(newWorker.rating) || 5.0
        };

        const result = await FirebaseService.addWorker(workerData);
        if (result.success) {
            showNotification('Worker added successfully!', 'success');
            setShowAddWorkerModal(false);
            setNewWorker({
                name: '', cnic: '', phone: '', location: '', address: '',
                policeVerified: false, residentPass: false, skills: '',
                rating: 5.0, languages: '', bio: '', age: '', specialty: ''
            });
            loadData();
        } else {
            showNotification('Failed to add worker', 'error');
        }
        setLoading(false);
    };

    const handleDeleteWorker = async (workerId) => {
        if (window.confirm('Are you sure you want to delete this worker?')) {
            setLoading(true);
            const result = await FirebaseService.deleteWorker(workerId);
            if (result.success) {
                showNotification('Worker deleted successfully', 'success');
                loadData();
            } else {
                showNotification('Failed to delete worker', 'error');
            }
            setLoading(false);
        }
    };

    const filteredBookings = bookings.filter(b => {
        if (filter === 'all') return true;
        if (filter === 'pending') return b.status === 'Pending';
        if (filter === 'confirmed') return b.status === 'Confirmed' || b.status === 'In Progress';
        if (filter === 'completed') return b.status === 'Completed';
        return true;
    });

    const formatDate = (isoDate) => {
        if (!isoDate) return 'N/A';
        const [year, month, day] = isoDate.split('-');
        return `${month}/${day}/${year}`;
    };

    const formatTime = (time24h) => {
        if (!time24h) return 'N/A';
        const [hours, minutes] = time24h.split(':').map(Number);
        const hour12 = hours % 12 || 12;
        const ampm = hours < 12 ? 'AM' : 'PM';
        return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Confirmed': return 'bg-green-100 text-green-700 border-green-200';
            case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Completed': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading && !showAddWorkerModal) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 pb-16">
            <header className="bg-primary text-white p-6 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <button
                        onClick={onLogout}
                        className="px-4 py-2 bg-purple-700 rounded-lg hover:bg-purple-800 transition-colors text-sm font-semibold"
                    >
                        Logout
                    </button>
                </div>

                {/* Main Tabs */}
                <div className="flex gap-4 mb-4 border-b border-purple-400 pb-1">
                    <button
                        onClick={() => setActiveTab('bookings')}
                        className={`pb-2 px-2 font-semibold flex items-center ${activeTab === 'bookings' ? 'border-b-2 border-white' : 'text-purple-200'}`}
                    >
                        <Calendar size={18} className="mr-2" /> Bookings
                    </button>
                    <button
                        onClick={() => setActiveTab('workers')}
                        className={`pb-2 px-2 font-semibold flex items-center ${activeTab === 'workers' ? 'border-b-2 border-white' : 'text-purple-200'}`}
                    >
                        <Users size={18} className="mr-2" /> Manage Workers
                    </button>
                </div>

                {activeTab === 'bookings' && (
                    <div className="flex gap-2 overflow-x-auto">
                        {['all', 'pending', 'confirmed', 'completed'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg capitalize font-medium transition-colors ${filter === f
                                    ? 'bg-white text-primary'
                                    : 'bg-purple-700 text-white hover:bg-purple-600'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                )}

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={async () => {
                            if (window.confirm('This will add dummy data to the database. Continue?')) {
                                setLoading(true);
                                await FirebaseService.seedDatabase();
                                await loadData();
                                setLoading(false);
                                showNotification('Database seeded!', 'success');
                            }
                            loadData();
                            showNotification('Refreshing data...', 'info');
                        }}
                        className="text-sm text-primary hover:underline flex items-center"
                    >
                        <Clock size={14} className="mr-1" /> Refresh
                    </button>
                </div>
            </header>

            <div className="flex-1 p-4 max-w-4xl mx-auto w-full">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                        <strong className="font-bold">Error loading data: </strong>
                        <span className="block sm:inline">{error}</span>
                        <p className="text-sm mt-1">Check your Firestore Security Rules in the Firebase Console.</p>
                    </div>
                )}

                {activeTab === 'bookings' ? (
                    <>
                        {filteredBookings.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <Calendar size={48} className="mx-auto mb-3 opacity-50" />
                                <p>No {filter !== 'all' ? filter : ''} bookings found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredBookings.map(booking => (
                                    <div key={booking.id} className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-800">{booking.service}</h3>
                                                <p className="text-sm text-gray-500">ID: #{booking.id.substring(0, 8)}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm mb-4">
                                            <p className="flex items-center text-gray-700">
                                                <UserCircle size={16} className="mr-2 text-gray-400" />
                                                <span className="font-medium">{booking.userName}</span>
                                                <span className="mx-2">•</span>
                                                <span className="text-gray-500">{booking.userPhone}</span>
                                            </p>
                                            <p className="flex items-center text-gray-700">
                                                <Calendar size={16} className="mr-2 text-gray-400" />
                                                {formatDate(booking.date)} at {formatTime(booking.time)}
                                            </p>
                                            <p className="flex items-center text-gray-700">
                                                <MapPin size={16} className="mr-2 text-gray-400" />
                                                {booking.area}
                                            </p>
                                            <p className="text-gray-600 text-xs ml-6">{booking.address}</p>
                                            {booking.worker && (
                                                <p className="flex items-center text-gray-700">
                                                    <Clock size={16} className="mr-2 text-gray-400" />
                                                    Worker: <span className="font-medium ml-1">{booking.worker}</span>
                                                </p>
                                            )}
                                        </div>

                                        {booking.status === 'Pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleAccept(booking.id)}
                                                    className="flex-1 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center justify-center"
                                                >
                                                    <Check size={18} className="mr-1" /> Accept
                                                </button>
                                                <button
                                                    onClick={() => handleReject(booking.id)}
                                                    className="flex-1 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center"
                                                >
                                                    <X size={18} className="mr-1" /> Reject
                                                </button>
                                            </div>
                                        )}

                                        {booking.status === 'Confirmed' && !booking.worker && (
                                            <div>
                                                <label className="text-xs font-semibold text-gray-600 block mb-2">Assign Worker</label>
                                                <select
                                                    onChange={(e) => handleAssignWorker(booking.id, e.target.value)}
                                                    className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm"
                                                    defaultValue=""
                                                >
                                                    <option value="" disabled>Select a worker...</option>
                                                    {workers.map(worker => (
                                                        <option key={worker.id} value={worker.name}>
                                                            {worker.name} - {worker.specialty}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}

                                        {booking.status === 'In Progress' && (
                                            <button
                                                onClick={() => handleMarkCompleted(booking.id)}
                                                className="w-full py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors"
                                            >
                                                Mark as Completed
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                ) : (
                    // WORKERS TAB CONTENT
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Manage Workers</h2>
                            <button
                                onClick={() => setShowAddWorkerModal(true)}
                                className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-700 transition-colors"
                            >
                                <Plus size={18} className="mr-2" /> Add Worker
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {workers.map(worker => (
                                <div key={worker.id} className="bg-white p-4 rounded-xl shadow-md border border-gray-100 relative">
                                    <button
                                        onClick={() => handleDeleteWorker(worker.id)}
                                        className="absolute top-4 right-4 text-red-500 hover:bg-red-50 p-1 rounded-full"
                                        title="Delete Worker"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <div className="flex items-start mb-4">
                                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-primary font-bold text-xl mr-3">
                                            {worker.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800">{worker.name}</h3>
                                            <p className="text-primary text-sm font-medium">{worker.specialty}</p>
                                            <div className="flex items-center text-yellow-500 text-sm mt-1">
                                                <Star size={14} fill="currentColor" className="mr-1" />
                                                {worker.rating}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                                        <p className="flex items-center">
                                            <MapPin size={14} className="mr-2 text-gray-400" />
                                            {worker.location}
                                        </p>
                                        <p className="flex items-center">
                                            <Briefcase size={14} className="mr-2 text-gray-400" />
                                            {worker.skills && Array.isArray(worker.skills) ? worker.skills.join(', ') : worker.skills}
                                        </p>
                                        {worker.phone && (
                                            <p className="flex items-center">
                                                <span className="font-semibold w-20">Phone:</span> {worker.phone}
                                            </p>
                                        )}
                                        {worker.cnic && (
                                            <p className="flex items-center">
                                                <span className="font-semibold w-20">CNIC:</span> {worker.cnic}
                                            </p>
                                        )}
                                        {worker.address && (
                                            <p className="flex items-center">
                                                <span className="font-semibold w-20">Address:</span> {worker.address}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                        {worker.policeVerified && (
                                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full flex items-center">
                                                <Shield size={12} className="mr-1" /> Police Verified
                                            </span>
                                        )}
                                        {worker.residentPass && (
                                            <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full flex items-center">
                                                <FileText size={12} className="mr-1" /> Resident Pass
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Worker Modal */}
            {showAddWorkerModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Add New Worker</h2>
                            <button onClick={() => setShowAddWorkerModal(false)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddWorker} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        value={newWorker.name}
                                        onChange={e => setNewWorker({ ...newWorker, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialty (Title)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Deep Cleaning Expert"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        value={newWorker.specialty}
                                        onChange={e => setNewWorker({ ...newWorker, specialty: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        value={newWorker.phone}
                                        onChange={e => setNewWorker({ ...newWorker, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">CNIC</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        value={newWorker.cnic}
                                        onChange={e => setNewWorker({ ...newWorker, cnic: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Public Location (Area)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. DHA Phase 2"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        value={newWorker.location}
                                        onChange={e => setNewWorker({ ...newWorker, location: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        value={newWorker.age}
                                        onChange={e => setNewWorker({ ...newWorker, age: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Private Address (Full)</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    value={newWorker.address}
                                    onChange={e => setNewWorker({ ...newWorker, address: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Description</label>
                                <textarea
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    rows="3"
                                    value={newWorker.bio}
                                    onChange={e => setNewWorker({ ...newWorker, bio: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Skills (Comma separated)</label>
                                    <input
                                        type="text"
                                        placeholder="Cleaning, Cooking, etc."
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        value={newWorker.skills}
                                        onChange={e => setNewWorker({ ...newWorker, skills: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Languages (Comma separated)</label>
                                    <input
                                        type="text"
                                        placeholder="Urdu, English, Punjabi"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        value={newWorker.languages}
                                        onChange={e => setNewWorker({ ...newWorker, languages: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-6 pt-2">
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-primary rounded focus:ring-primary"
                                        checked={newWorker.policeVerified}
                                        onChange={e => setNewWorker({ ...newWorker, policeVerified: e.target.checked })}
                                    />
                                    <span className="ml-2 text-gray-700">Police Verified</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-primary rounded focus:ring-primary"
                                        checked={newWorker.residentPass}
                                        onChange={e => setNewWorker({ ...newWorker, residentPass: e.target.checked })}
                                    />
                                    <span className="ml-2 text-gray-700">Resident Pass</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-primary text-white py-3 rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors mt-4"
                            >
                                Add Worker
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
