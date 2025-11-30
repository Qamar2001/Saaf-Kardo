import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// ==================== AUTHENTICATION ====================

export const registerUser = async (email, password, userData) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Determine role
        const role = email.toLowerCase() === 'admin@saafkardo.com' ? 'admin' : 'customer';

        await setDoc(doc(db, 'users', user.uid), {
            name: userData.name,
            email: email,
            phone: userData.phone || '',
            address: userData.address || '',
            role: role,
            createdAt: serverTimestamp()
        });

        return { success: true, user, role };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: error.message };
    }
};

export const loginUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: error.message };
    }
};

export const logoutUser = async () => {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        console.error('Logout error:', error);
        return { success: false, error: error.message };
    }
};

export const getCurrentUser = () => {
    return auth.currentUser;
};

export const onAuthChange = (callback) => {
    return onAuthStateChanged(auth, callback);
};

// ==================== USER PROFILE ====================

export const getUserProfile = async (userId) => {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            return { success: true, data: { id: userDoc.id, ...userDoc.data() } };
        } else {
            return { success: false, error: 'User not found' };
        }
    } catch (error) {
        console.error('Get user profile error:', error);
        return { success: false, error: error.message };
    }
};

export const updateUserProfile = async (userId, updates) => {
    try {
        await updateDoc(doc(db, 'users', userId), {
            ...updates,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Update profile error:', error);
        return { success: false, error: error.message };
    }
};

export const checkIsAdmin = async (userId) => {
    try {
        const userProfile = await getUserProfile(userId);
        if (userProfile.success) {
            return userProfile.data.role === 'admin';
        }
        return false;
    } catch (error) {
        return false;
    }
};

// ==================== BOOKINGS ====================

export const createBooking = async (bookingData, userProfile) => {
    try {
        const user = getCurrentUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        const bookingRef = await addDoc(collection(db, 'bookings'), {
            userId: user.uid,
            userName: userProfile.name,
            userPhone: userProfile.phone,
            userEmail: userProfile.email,
            service: bookingData.service,
            date: bookingData.date,
            time: bookingData.time,
            area: bookingData.area,
            address: bookingData.address,
            status: 'Pending',
            worker: null,
            notes: '',
            createdAt: serverTimestamp()
        });

        return { success: true, id: bookingRef.id };
    } catch (error) {
        console.error('Create booking error:', error);
        return { success: false, error: error.message };
    }
};

export const getUserBookings = async (userId) => {
    try {
        const bookingsQuery = query(
            collection(db, 'bookings'),
            where('userId', '==', userId)
        );

        const querySnapshot = await getDocs(bookingsQuery);
        const bookings = [];
        querySnapshot.forEach((doc) => {
            bookings.push({ id: doc.id, ...doc.data() });
        });
        // Sort client-side to avoid index requirement
        bookings.sort((a, b) => {
            const dateA = a.createdAt ? a.createdAt.toDate() : new Date(0);
            const dateB = b.createdAt ? b.createdAt.toDate() : new Date(0);
            return dateB - dateA;
        });

        return { success: true, data: bookings };
    } catch (error) {
        console.error('Get bookings error:', error);
        return { success: false, error: error.message };
    }
};

export const getAllBookings = async () => {
    try {
        const bookingsQuery = query(
            collection(db, 'bookings')
        );

        const querySnapshot = await getDocs(bookingsQuery);
        const bookings = [];
        querySnapshot.forEach((doc) => {
            bookings.push({ id: doc.id, ...doc.data() });
        });
        console.log(`getAllBookings: Found ${bookings.length} documents in 'bookings' collection.`);
        // Sort client-side
        // Sort client-side
        bookings.sort((a, b) => {
            const dateA = a.createdAt ? a.createdAt.toDate() : new Date(0);
            const dateB = b.createdAt ? b.createdAt.toDate() : new Date(0);
            return dateB - dateA;
        });

        return { success: true, data: bookings };
    } catch (error) {
        console.error('Get all bookings error:', error);
        return { success: false, error: error.message };
    }
};

export const updateBookingStatus = async (bookingId, status, worker = null, notes = '') => {
    try {
        const updates = {
            status: status,
            updatedAt: serverTimestamp()
        };

        if (worker) {
            updates.worker = worker;
        }

        if (notes) {
            updates.notes = notes;
        }

        await updateDoc(doc(db, 'bookings', bookingId), updates);
        return { success: true };
    } catch (error) {
        console.error('Update booking status error:', error);
        return { success: false, error: error.message };
    }
};

export const cancelBooking = async (bookingId) => {
    try {
        await updateDoc(doc(db, 'bookings', bookingId), {
            status: 'Cancelled',
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Cancel booking error:', error);
        return { success: false, error: error.message };
    }
};

// ==================== SERVICES ====================

export const getServices = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'services'));
        const services = [];
        querySnapshot.forEach((doc) => {
            services.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, data: services };
    } catch (error) {
        console.error('Get services error:', error);
        return { success: false, error: error.message };
    }
};

// ==================== WORKERS ====================

export const getWorkers = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'workers'));
        const workers = [];
        querySnapshot.forEach((doc) => {
            workers.push({ id: doc.id, ...doc.data() });
        });

        return { success: true, data: workers };
    } catch (error) {
        console.error('Get workers error:', error);
        return { success: false, error: error.message };
    }
};

export const addWorker = async (workerData) => {
    try {
        const docRef = await addDoc(collection(db, 'workers'), {
            ...workerData,
            createdAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Add worker error:', error);
        return { success: false, error: error.message };
    }
};

export const deleteWorker = async (workerId) => {
    try {
        await deleteDoc(doc(db, 'workers', workerId));
        return { success: true };
    } catch (error) {
        console.error('Delete worker error:', error);
        return { success: false, error: error.message };
    }
};

export const seedDatabase = async () => {
    try {
        const services = [
            { name: 'Deep Cleaning', icon: 'Sparkles', price: '$80', description: 'Complete home deep cleaning service' },
            { name: 'Plumbing', icon: 'Wrench', price: '$50', description: 'Expert plumbing repairs and installation' },
            { name: 'Electrician', icon: 'Zap', price: '$60', description: 'Electrical maintenance and repairs' },
            { name: 'Painting', icon: 'PaintBucket', price: '$120', description: 'Interior and exterior painting' },
            { name: 'Laundry', icon: 'Shirt', price: '$30', description: 'Wash, dry, and fold service' },
            { name: 'AC Repair', icon: 'Wind', price: '$70', description: 'AC servicing and maintenance' }
        ];

        const workers = [
            { name: 'Sarah Johnson', specialty: 'Deep Cleaning', rating: 4.8, location: 'Downtown', languages: ['English', 'Spanish'], age: 28, bio: 'Expert in residential cleaning with 5 years of experience.', skills: ['Deep Cleaning', 'Organization'], photo: 'https://randomuser.me/api/portraits/women/44.jpg' },
            { name: 'Mike Chen', specialty: 'Plumbing', rating: 4.9, location: 'Westside', languages: ['English', 'Mandarin'], age: 35, bio: 'Licensed plumber specializing in emergency repairs.', skills: ['Pipe Repair', 'Installation'], photo: 'https://randomuser.me/api/portraits/men/32.jpg' },
            { name: 'Alex Wilson', specialty: 'Electrician', rating: 4.7, location: 'North Hills', languages: ['English'], age: 31, bio: 'Certified electrician for all your home needs.', skills: ['Wiring', 'Lighting'], photo: 'https://randomuser.me/api/portraits/men/86.jpg' },
            { name: 'Maria Garcia', specialty: 'Laundry', rating: 4.9, location: 'South Bay', languages: ['English', 'Portuguese'], age: 42, bio: 'Professional laundry service with care.', skills: ['Washing', 'Ironing'], photo: 'https://randomuser.me/api/portraits/women/68.jpg' }
        ];

        // Add Services
        for (const service of services) {
            await addDoc(collection(db, 'services'), service);
        }

        // Add Workers
        for (const worker of workers) {
            await addDoc(collection(db, 'workers'), worker);
        }

        return { success: true };
    } catch (error) {
        console.error('Seed database error:', error);
        return { success: false, error: error.message };
    }
};
