import { House, Wand, WashingMachine, Shirt, Package } from 'lucide-react';

const STORAGE_KEYS = {
    USER: 'saaf_kardo_user',
    BOOKINGS: 'saaf_kardo_bookings',
    SERVICES: 'saaf_kardo_services',
    WORKERS: 'saaf_kardo_workers',
};

// Initial Mock Data (to populate if empty)
const INITIAL_SERVICES = [
    {
        id: 'deep',
        name: 'Deep Cleaning',
        iconName: 'House',
        description: 'Full house detailing (Sofa, Carpet, Mattress shampooing).',
        type: 'project'
    },
    {
        id: 'regular',
        name: 'Regular Maintenance',
        iconName: 'Wand',
        description: 'Standard sweeping, mopping, and dusting.',
        type: 'hourly'
    },
    {
        id: 'kitchen_bath',
        name: 'Kitchen & Bathroom Cleaning',
        iconName: 'WashingMachine',
        description: 'Grease removal and heavy-duty sanitization.',
        type: 'project'
    },
    {
        id: 'ironing',
        name: 'On-Site Ironing',
        iconName: 'Shirt',
        description: 'Staff comes to your home to press clothes (Hourly / per piece).',
        type: 'hourly'
    },
    {
        id: 'washing',
        name: 'On-Site Washing',
        iconName: 'WashingMachine',
        description: 'Staff loads/unloads your machine and hangs clothes.',
        type: 'hourly'
    },
    {
        id: 'dry_cleaning',
        name: 'Dry Cleaning (Premium)',
        iconName: 'Package',
        description: 'Pick-up and delivery for suits, blankets, and formal wear.',
        type: 'project'
    },
];

const INITIAL_WORKERS = [
    {
        id: 1,
        name: 'Aisha K.',
        rating: 4.9,
        specialty: 'Deep Cleaning',
        photo: 'https://placehold.co/100x100/312e81/ffffff?text=Aisha',
        location: 'DHA Phase 2, Islamabad',
        age: 32,
        languages: ['Urdu', 'English (Basic)'],
        bio: "Aisha is our top-rated expert for intensive cleaning projects. She has 5 years of experience specializing in stain removal and chemical-free sanitization.",
        skills: ['Carpet Shampooing', 'Sofa/Upholstery Cleaning', 'Hard Floor Scrubbing', 'Post-Construction Cleanup'],
        reviews: 78,
    },
    {
        id: 2,
        name: 'Zahid M.',
        rating: 4.7,
        specialty: 'On-Site Ironing',
        photo: 'https://placehold.co/100x100/312e81/ffffff?text=Zahid',
        location: 'Bahria Town Phase 3',
        age: 27,
        languages: ['Urdu', 'Punjabi'],
        bio: "Zahid is a highly efficient and reliable expert focused on laundry and garment care.",
        skills: ['Professional Ironing', 'Steam Pressing', 'Fabric Handling (Silk, Cotton, Linen)', 'Washing Machine Operation'],
        reviews: 55,
    },
    {
        id: 3,
        name: 'Sana R.',
        rating: 5.0,
        specialty: 'Regular Maintenance',
        photo: 'https://placehold.co/100x100/312e81/ffffff?text=Sana',
        location: 'Naval Anchorage, Rawalpindi',
        age: 45,
        languages: ['Urdu', 'Pashto'],
        bio: "With over 10 years in the industry, Sana provides consistent and high-quality regular maintenance.",
        skills: ['Daily Tidying', 'Mopping & Sweeping', 'Window Cleaning', 'Dusting & Sanitization'],
        reviews: 112,
    },
];

export const StorageService = {
    // --- User Session ---
    getUser: () => {
        const user = localStorage.getItem(STORAGE_KEYS.USER);
        return user ? JSON.parse(user) : null;
    },

    login: (email, password) => {
        // Simulate login validation
        if (email && password) {
            const user = {
                name: 'Ali Khan',
                email: email,
                phone: '+92 300 1234567',
                address: 'House 12, Street 4, DHA Phase 2, Islamabad',
                token: 'mock-jwt-token-' + Date.now()
            };
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
            return user;
        }
        return null;
    },

    logout: () => {
        localStorage.removeItem(STORAGE_KEYS.USER);
    },

    // --- Services ---
    getServices: () => {
        // We don't really need to persist services if they are static, but good for extensibility
        return INITIAL_SERVICES;
    },

    // --- Workers ---
    getWorkers: () => {
        return INITIAL_WORKERS;
    },

    // --- Bookings ---
    getBookings: () => {
        const bookings = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
        return bookings ? JSON.parse(bookings) : [];
    },

    addBooking: (booking) => {
        const bookings = StorageService.getBookings();
        const newBooking = {
            ...booking,
            id: Date.now(), // Simple ID generation
            status: 'Pending',
            worker: null
        };
        bookings.unshift(newBooking); // Add to top
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
        return newBooking;
    },

    cancelBooking: (bookingId) => {
        const bookings = StorageService.getBookings();
        const updatedBookings = bookings.map(b =>
            b.id === bookingId ? { ...b, status: 'Cancelled' } : b
        );
        localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updatedBookings));
        return updatedBookings;
    }
};
