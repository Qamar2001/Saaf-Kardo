import { seedFirestoreData } from './src/utils/seedData.js';

console.log('🌱 Starting to seed Firestore database...\n');

seedFirestoreData()
    .then((result) => {
        if (result.success) {
            console.log('\n✅ Database seeded successfully!');
            console.log('You can now use your app with Firebase.');
            process.exit(0);
        } else {
            console.error('\n❌ Error seeding database:', result.error);
            process.exit(1);
        }
    })
    .catch((error) => {
        console.error('\n❌ Unexpected error:', error);
        process.exit(1);
    });
