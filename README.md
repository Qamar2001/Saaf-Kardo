# Saaf Kardo 🧹

**"Sab Saaf Kar Do"** - Your Professional Cleaning Services Platform

A modern, full-stack web application for booking professional cleaning services in Islamabad, Pakistan. Built with React and Firebase.

![Saaf Kardo Logo](public/assets/logo.png)

## 🌟 Features

### For Customers
- **Service Browsing**: View 6 different cleaning service categories with professional images
- **Smart Filtering**: Filter services by category with smooth arrow navigation
- **Real-time Search**: Search services instantly as you type
- **Easy Booking**: Book services with date, time, location, and address selection
- **Booking Management**: Track upcoming and past bookings with status updates
- **Worker Profiles**: View assigned service professionals with verification badges
- **User Profiles**: Manage personal information and contact details

### For Administrators
- **Booking Dashboard**: View and manage all bookings by status (Pending, Confirmed, In Progress, Completed)
- **Worker Management**: Add, edit, and remove service professionals
- **Worker Assignment**: Assign workers to confirmed bookings
- **Status Updates**: Update booking status through the complete workflow
- **Image Upload**: Add worker profile photos

## 🛠️ Tech Stack

- **Frontend**: React 18 with Hooks
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Firebase (Firestore Database + Authentication)
- **Build Tool**: Vite
- **Routing**: Client-side navigation

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd saaf-kardo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database and Authentication (Email/Password)
   - Copy your Firebase config to `src/services/firebaseConfig.js`:
   ```javascript
   export const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

4. **Set up Firestore Security Rules**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
       match /bookings/{bookingId} {
         allow read, write: if request.auth != null;
       }
       match /services/{serviceId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       match /workers/{workerId} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

## 🚀 Usage

### Customer Flow
1. **Register/Login**: Create an account or login with existing credentials
2. **Browse Services**: View all available cleaning services
3. **Filter & Search**: Use filters or search to find specific services
4. **Book Service**: Select date, time, location, and provide address
5. **Track Bookings**: View booking status and assigned worker

### Admin Flow
1. **Login**: Use admin credentials (default: admin@saaf.com)
2. **Manage Bookings**: Accept/reject bookings, assign workers, update status
3. **Manage Workers**: Add new workers with details and photos

## 📁 Project Structure

```
saaf-kardo/
├── public/
│   └── assets/          # Images (logo, service images)
├── src/
│   ├── components/      # React components
│   │   ├── AdminDashboard.jsx
│   │   ├── EditProfilePage.jsx
│   │   └── RegisterPage.jsx
│   ├── services/        # Firebase services
│   │   ├── firebaseConfig.js
│   │   └── firebaseService.js
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # Global styles
├── .gitignore
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎨 Service Categories

1. **Deep Cleaning** - Comprehensive cleaning of entire home
2. **Kitchen Cleaning** - Professional kitchen deep cleaning
3. **Laundry Service** - Wash, dry, and iron services
4. **Move In/Out Cleaning** - Pre/post move cleaning services
5. **Sofa & Carpet Cleaning** - Upholstery and carpet care

## 🔐 Admin Access

Default admin credentials:
- **Email**: admin@saaf.com
- **Password**: (Set during first-time setup)

## 🌍 Service Areas

- DHA Phase 2 Islamabad
- Naval Anchorage Islamabad
- Bahria Town Phase 1-6

## 📱 Screenshots

*(Add screenshots of your application here)*

## 🛣️ Roadmap

- [ ] Implement Firebase Storage for worker images
- [ ] Add payment integration
- [ ] SMS/Email notifications for booking updates
- [ ] Real-time booking status updates
- [ ] Worker availability calendar
- [ ] Customer reviews and ratings
- [ ] Multi-language support (Urdu/English)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

Created by Qamar Mehmood

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Tailwind CSS for styling
- Lucide React for icons
- Vite for fast development experience

---

**Made with ❤️ in Pakistan**
