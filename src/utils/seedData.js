import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';

// Services data
const services = [
    {
        id: 'deep-cleaning',
        name: 'Deep Cleaning',
        description: 'Comprehensive cleaning of your entire home',
        type: 'project',
        iconName: 'House'
    },
    {
        id: 'kitchen-bathroom',
        name: 'Kitchen & Bathroom Cleaning',
        description: 'Specialized cleaning for kitchens and bathrooms',
        type: 'project',
        iconName: 'Wand'
    },
    {
        id: 'sofa-carpet',
        name: 'Sofa & Carpet Cleaning',
        description: 'Professional cleaning for upholstery and carpets',
        type: 'hourly',
        iconName: 'WashingMachine'
    },
    {
        id: 'laundry',
        name: 'Laundry Services',
        description: 'Wash, dry, and iron your clothes',
        type: 'project',
        iconName: 'Shirt'
    },
    {
        id: 'move-in-out',
        name: 'Move In/Out Cleaning',
        description: 'Complete cleaning before or after moving',
        type: 'project',
        iconName: 'Package'
    }
];

// Workers data
const workers = [
    {
        id: 'aisha-k',
        name: 'Aisha K.',
        specialty: 'Deep Cleaning Expert',
        rating: 4.9,
        bio: 'Experienced professional with 5+ years in residential cleaning',
        location: 'DHA Phase 2',
        languages: ['Urdu', 'English'],
        age: 32,
        skills: ['Deep Cleaning', 'Kitchen Cleaning', 'Bathroom Sanitization'],
        photo: 'https://i.pravatar.cc/150?img=5'
    },
    {
        id: 'fatima-r',
        name: 'Fatima R.',
        specialty: 'Laundry & Ironing',
        rating: 4.8,
        bio: 'Specialist in fabric care and laundry services',
        location: 'Naval Anchorage',
        languages: ['Urdu', 'Punjabi'],
        age: 28,
        skills: ['Laundry', 'Ironing', 'Fabric Care'],
        photo: 'https://i.pravatar.cc/150?img=9'
    },
    {
        id: 'sara-m',
        name: 'Sara M.',
        specialty: 'Carpet & Upholstery',
        rating: 4.7,
        bio: 'Expert in carpet and sofa deep cleaning',
        location: 'Bahria Town',
        languages: ['Urdu', 'English'],
        age: 30,
        skills: ['Carpet Cleaning', 'Upholstery', 'Stain Removal'],
        photo: 'https://i.pravatar.cc/150?img=10'
    }
];

// Seed function
export const seedFirestoreData = async () => {
    try {
        console.log('Starting to seed Firestore data...');

        // Seed services
        console.log('Seeding services...');
        for (const service of services) {
            await setDoc(doc(db, 'services', service.id), service);
            console.log(`✓ Added service: ${service.name}`);
        }

        // Seed workers
        console.log('Seeding workers...');
        for (const worker of workers) {
            await setDoc(doc(db, 'workers', worker.id), worker);
            console.log(`✓ Added worker: ${worker.name}`);
        }

        console.log('✅ Firestore data seeded successfully!');
        return { success: true, message: 'Data seeded successfully' };
    } catch (error) {
        console.error('Error seeding data:', error);
        return { success: false, error: error.message };
    }
};
