import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Menu, UserCircle, House, Shovel, WashingMachine, Shirt, Package,
    Clock, ClipboardList, Star, ChevronLeft, X, Calendar, Users, Search, Bell, MapPin, Globe, Cake, ChevronUp, ChevronDown, ChevronRight, Wand, Edit
} from 'lucide-react';
import * as FirebaseService from './services/firebaseService';
import { onAuthChange } from './services/firebaseService';

// --- Global Constants ---
const SERVICE_AREAS = [
    'DHA Phase 2 Islamabad',
    'Naval Anchorage Islamabad',
    'Bahria Town Phase 1-6',
];

// --- Helper Functions for Date/Time ---
const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return 'MM/DD/YYYY';
    const [year, month, day] = isoDate.split('-');
    return `${month}/${day}/${year}`;
};

const formatTimeForDisplay = (time24h) => {
    if (!time24h) return '--:-- --';
    const [hours, minutes] = time24h.split(':').map(Number);
    const hour12 = hours % 12 || 12;
    const ampm = hours < 12 || hours === 24 ? 'AM' : 'PM';
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedHour = String(hour12).padStart(2, '0');
    return `${paddedHour}:${paddedMinutes} ${ampm}`;
};

// Helper to map icon names to components
const getIconComponent = (iconName) => {
    const icons = { House, Wand, WashingMachine, Shirt, Package };
    return icons[iconName] || House;
};

// --- Custom Components ---

const ModalContainer = ({ children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl relative transition-all duration-300 transform scale-100 opacity-100">
            {children}
        </div>
    </div>
);

const DatePickerModal = ({ selectedDate, onSelectDate, onClose }) => {
    const initialDate = selectedDate ? new Date(selectedDate) : new Date();
    const [calendarMonth, setCalendarMonth] = useState(initialDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const monthName = calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
    const numDays = daysInMonth(calendarMonth);
    const firstDay = firstDayOfMonth(calendarMonth);
    const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    const getCalendarDays = useCallback(() => {
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= numDays; i++) {
            const date = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), i);
            days.push(date);
        }
        return days;
    }, [calendarMonth, firstDay, numDays]);

    const handleDayClick = (date) => {
        if (date) {
            const offset = date.getTimezoneOffset();
            const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
            const newDate = adjustedDate.toISOString().split('T')[0];
            onSelectDate(newDate);
            onClose();
        }
    };

    const changeMonth = (delta) => {
        setCalendarMonth(prev => {
            const newMonth = prev.getMonth() + delta;
            return new Date(prev.getFullYear(), newMonth, 1);
        });
    };

    const isSelected = (date) => {
        if (!date || !selectedDate) return false;
        const selected = new Date(selectedDate);
        return date.getDate() === selected.getDate() &&
            date.getMonth() === selected.getMonth() &&
            date.getFullYear() === selected.getFullYear();
    };

    const isPast = (date) => date < today;

    return (
        <ModalContainer onClose={onClose}>
            <div className="p-4">
                <div className="flex justify-between items-center mb-4 relative">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                        <ChevronLeft size={20} />
                    </button>
                    <h3 className="font-bold text-lg text-primary">{monthName}</h3>
                    <div className="flex items-center">
                        <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100 text-gray-600 mr-2">
                            <ChevronRight size={20} />
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-primary">
                            <X size={20} />
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-7 text-center font-semibold text-sm mb-2">
                    {daysOfWeek.map(day => <div key={day} className="text-gray-500">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {getCalendarDays().map((date, index) => {
                        if (!date) return <div key={`empty-${index}`} className="h-10"></div>;
                        const dateOnly = date.getDate();
                        const selected = isSelected(date);
                        const past = isPast(date);
                        return (
                            <button
                                key={index}
                                onClick={() => !past && handleDayClick(date)}
                                disabled={past}
                                className={`h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors duration-150 mx-auto
                  ${selected ? 'bg-primary text-white shadow-lg' : ''}
                  ${!selected && !past ? 'text-gray-800 hover:bg-purple-50' : ''}
                  ${past ? 'text-gray-400 cursor-not-allowed' : ''}
                `}
                            >
                                {dateOnly}
                            </button>
                        );
                    })}
                </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-between">
                <button onClick={() => { onSelectDate(today.toISOString().split('T')[0]); onClose(); }} className="text-sm font-semibold text-gray-600 hover:text-primary">Today</button>
                <button onClick={() => { onSelectDate(null); onClose(); }} className="text-sm font-semibold text-red-500 hover:text-red-700">Clear</button>
            </div>
        </ModalContainer>
    );
};

const TimePickerModal = ({ selectedTime, onSelectTime, onClose }) => {
    const [initialHours, initialMinutes] = selectedTime ? selectedTime.split(':').map(Number) : [10, 0];
    const initialAmPm = initialHours >= 12 && initialHours < 24 ? 'PM' : 'AM';
    const initialHour12 = initialHours % 12 || 12;

    const [hour, setHour] = useState(initialHour12);
    const [minute, setMinute] = useState(initialMinutes);
    const [ampm, setAmPm] = useState(initialAmPm);

    const handleConfirm = () => {
        let h24 = hour;
        if (ampm === 'PM' && hour !== 12) h24 += 12;
        else if (ampm === 'AM' && hour === 12) h24 = 0;
        const time24h = `${String(h24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        onSelectTime(time24h);
        onClose();
    };

    const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);
    const minOptions = Array.from({ length: 4 }, (_, i) => i * 15);

    const scrollContainerStyle = "h-48 overflow-y-scroll snap-y snap-mandatory scroll-smooth p-4 text-center";
    const scrollItemStyle = "h-12 flex items-center justify-center snap-start font-medium text-lg transition-colors duration-150 rounded-lg";
    const selectedItemStyle = "bg-primary text-white shadow-md";
    const unselectedItemStyle = "text-gray-500 hover:bg-gray-100";

    const hourRef = React.useRef(null);
    const minuteRef = React.useRef(null);

    useEffect(() => {
        const scroll = (ref, index) => {
            if (ref.current) {
                const itemHeight = 48;
                const containerHeight = ref.current.clientHeight;
                const offset = (containerHeight / 2) - (itemHeight / 2);
                ref.current.scrollTop = (index * itemHeight) - offset;
            }
        };
        const hourIndex = hourOptions.indexOf(hour);
        const minuteIndex = minOptions.indexOf(minute);
        if (hourIndex !== -1) scroll(hourRef, hourIndex);
        if (minuteRef && minuteIndex !== -1) scroll(minuteRef, minuteIndex);
    }, [hour, minute]);

    return (
        <ModalContainer onClose={onClose}>
            <div className="p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-primary">
                    <X size={24} />
                </button>
                <h2 className="text-xl font-bold text-center text-primary mb-6 mt-2">Select Time</h2>
                <div className="flex justify-center space-x-2">
                    <div className="flex-1 min-w-[30%]">
                        <div className="flex flex-col items-center">
                            <p className="font-semibold text-sm mb-2 text-gray-700">Hour</p>
                            <div ref={hourRef} className={`${scrollContainerStyle} w-full border border-gray-200 rounded-xl`}>
                                {hourOptions.map((h) => (
                                    <div key={`h-${h}`} onClick={() => setHour(h)} className={`${scrollItemStyle} ${h === hour ? selectedItemStyle : unselectedItemStyle}`}>
                                        {String(h).padStart(2, '0')}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 min-w-[30%]">
                        <div className="flex flex-col items-center">
                            <p className="font-semibold text-sm mb-2 text-gray-700">Minute</p>
                            <div ref={minuteRef} className={`${scrollContainerStyle} w-full border border-gray-200 rounded-xl`}>
                                {minOptions.map((m) => (
                                    <div key={`m-${m}`} onClick={() => setMinute(m)} className={`${scrollItemStyle} ${m === minute ? selectedItemStyle : unselectedItemStyle}`}>
                                        {String(m).padStart(2, '0')}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="w-1/4">
                        <div className="flex flex-col items-center">
                            <p className="font-semibold text-sm mb-2 text-gray-700">Period</p>
                            <div className="h-48 flex flex-col justify-center items-center space-y-2">
                                {['AM', 'PM'].map((p) => (
                                    <button key={p} onClick={() => setAmPm(p)} className={`w-full py-2 px-1 text-base font-semibold rounded-lg transition-colors duration-150 ${p === ampm ? 'bg-primary text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <button onClick={handleConfirm} className="w-full mt-6 py-3 rounded-lg bg-secondary text-white font-semibold hover:bg-cyan-500 transition-colors shadow-md">
                    Set Time
                </button>
            </div>
        </ModalContainer>
    );
};

const Notification = ({ message, type, onClose }) => {
    if (!message) return null;
    const typeClasses = {
        success: 'bg-green-100 border-green-400 text-green-700',
        error: 'bg-red-100 border-red-400 text-red-700',
        info: 'bg-blue-100 border-blue-400 text-blue-700',
    };
    return (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 max-w-sm w-11/12 p-4 rounded-lg border shadow-lg z-50 transition-opacity duration-300 ${typeClasses[type]}`}>
            <div className="flex justify-between items-center">
                <p className="font-semibold">{message}</p>
                <button onClick={onClose} className="text-xl font-bold ml-4">&times;</button>
            </div>
        </div>
    );
};

const Header = ({ title, onBackPress, onProfilePress }) => (
    <header className="flex justify-between items-center p-4 bg-white shadow-md sticky top-0 z-20">
        <button onClick={onBackPress} className="p-2 rounded-full hover:bg-gray-100 text-primary">
            <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-primary">{title}</h1>
        <button onClick={onProfilePress} className="p-2 rounded-full hover:bg-gray-100 text-primary">
            <User Circle size={24} />
        </button>
    </header>
);

const HomeHeader = ({ searchQuery, setSearchQuery, goToPage }) => (
    <div className="relative p-4 pt-8 bg-primary rounded-b-2xl shadow-xl transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
                <div className="bg-white p-2 rounded-xl mr-3 shadow-lg">
                    <Star size={24} className="text-primary fill-yellow-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Saaf Kardo</h1>
                    <p className="text-xs text-purple-200">Book professional cleaning services</p>
                </div>
            </div>
            <button className="p-2 rounded-full bg-purple-700 text-white hover:bg-purple-800 transition-colors" onClick={() => goToPage('Notifications')}>
                <Bell size={24} />
            </button>
        </div>
        <div className="relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
                type="text"
                placeholder="Search services..."
                className="w-full py-4 pl-12 pr-4 text-base bg-white rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary transition-shadow"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
    </div>
);

const ServiceCard = ({ service, onBookPress }) => {
    const IconComponent = getIconComponent(service.iconName);
    return (
        <div className="flex flex-col md:flex-row items-start bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-shadow duration-300 mb-4 border border-gray-100">
            <div className="p-3 rounded-xl mr-4 bg-purple-50 text-primary">
                <IconComponent size={30} />
            </div>
            <div className="flex-1 mt-3 md:mt-0">
                <h2 className="text-lg font-bold text-gray-800">{service.name}</h2>
                <p className="text-sm text-gray-500 my-1">{service.description}</p>
                <p className="text-xs font-medium italic text-gray-500 flex items-center">
                    {service.type === 'hourly' ? <Clock size={12} className="mr-1" /> : <ClipboardList size={12} className="mr-1" />}
                    {service.type === 'hourly' ? 'Hourly Service' : 'Project Based'}
                </p>
            </div>
            <button
                className="mt-4 md:mt-0 md:ml-4 w-full md:w-auto px-4 py-2 rounded-lg bg-secondary text-white font-semibold hover:bg-cyan-500 transition-colors"
                onClick={() => onBookPress(service)}
            >
                Book Appointment
            </button>
        </div>
    );
};

const BottomNavBar = ({ currentPage, goToPage }) => {
    const navItems = [
        { name: 'Home', page: 'Services', icon: House },
        { name: 'Bookings', page: 'Bookings', icon: Calendar },
        { name: 'Experts', page: 'Workers', icon: Users },
        { name: 'Profile', page: 'Profile', icon: UserCircle },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 shadow-2xl z-20">
            <div className="flex justify-around items-center h-full max-w-lg mx-auto">
                {navItems.map((item) => {
                    const isActive = currentPage === item.page;
                    const IconComponent = item.icon;
                    return (
                        <button
                            key={item.page}
                            onClick={() => goToPage(item.page)}
                            className={`flex flex-col items-center justify-center text-xs font-medium w-1/4 h-full transition-colors duration-200
                ${isActive ? 'text-primary font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <IconComponent size={24} className={isActive ? 'text-primary' : 'text-gray-400'} />
                            <span className="mt-1">{item.name}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

// --- Pages ---

const LoginPage = ({ onLoginSuccess, onRegisterPress }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await FirebaseService.loginUser(email, password);
        setLoading(false);

        if (result.success) {
            onLoginSuccess();
        } else {
            alert(result.error || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-gray-50">
            <div className="bg-primary p-4 rounded-full mb-6 shadow-xl">
                <Star size={48} className="text-white fill-yellow-400" />
            </div>
            <h1 className="text-4xl font-extrabold text-primary mb-1">Saaf Kardo</h1>
            <p className="text-md italic text-gray-500 mb-8">"Sab Saaf Kar Do"</p>

            <form onSubmit={handleLogin} className="w-full max-w-sm bg-white rounded-xl p-6 shadow-2xl">
                <input
                    className="w-full h-12 border border-gray-200 rounded-lg px-4 mb-4 text-base text-gray-800 focus:ring-2 focus:ring-primary"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    className="w-full h-12 border border-gray-200 rounded-lg px-4 mb-6 text-base text-gray-800 focus:ring-2 focus:ring-primary"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    className={`w-full py-3 rounded-lg bg-primary text-white font-semibold text-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-300 ${loading ? 'opacity-70' : ''}`}
                    disabled={loading}
                >
                    {loading ? 'Logging In...' : 'Login'}
                </button>

                <button
                    type="button"
                    onClick={onRegisterPress}
                    className="mt-4 w-full text-secondary font-medium text-base hover:underline"
                >
                    Don't have an account? Sign Up
                </button>
            </form>
        </div>
    );
};

const RegisterPage = ({ onRegisterSuccess, onBackToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);

        const result = await FirebaseService.registerUser(email, password, {
            name,
            phone,
            address
        });

        setLoading(false);

        if (result.success) {
            onRegisterSuccess();
        } else {
            alert(result.error || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-gray-50">
            <div className="bg-primary p-4 rounded-full mb-6 shadow-xl">
                <Star size={48} className="text-white fill-yellow-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-primary mb-1">Create Account</h1>
            <p className="text-sm text-gray-500 mb-6">Join Saaf Kardo today</p>

            <form onSubmit={handleRegister} className="w-full max-w-sm bg-white rounded-xl p-6 shadow-2xl">
                <input
                    className="w-full h-12 border border-gray-200 rounded-lg px-4 mb-3 text-base text-gray-800 focus:ring-2 focus:ring-primary"
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    className="w-full h-12 border border-gray-200 rounded-lg px-4 mb-3 text-base text-gray-800 focus:ring-2 focus:ring-primary"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    className="w-full h-12 border border-gray-200 rounded-lg px-4 mb-3 text-base text-gray-800 focus:ring-2 focus:ring-primary"
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                />
                <input
                    className="w-full h-12 border border-gray-200 rounded-lg px-4 mb-3 text-base text-gray-800 focus:ring-2 focus:ring-primary"
                    type="text"
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />
                <input
                    className="w-full h-12 border border-gray-200 rounded-lg px-4 mb-3 text-base text-gray-800 focus:ring-2 focus:ring-primary"
                    type="password"
                    placeholder="Password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <input
                    className="w-full h-12 border border-gray-200 rounded-lg px-4 mb-6 text-base text-gray-800 focus:ring-2 focus:ring-primary"
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    className={`w-full py-3 rounded-lg bg-primary text-white font-semibold text-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-300 ${loading ? 'opacity-70' : ''}`}
                    disabled={loading}
                >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>

                <button
                    type="button"
                    onClick={onBackToLogin}
                    className="mt-4 w-full text-secondary font-medium text-base hover:underline"
                >
                    Already have an account? Login
                </button>
            </form>
        </div>
    );
};

const ServicesPage = ({ goToPage, setSelectedService }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        const result = await FirebaseService.getServices();
        if (result.success) {
            setServices(result.data);
        }
        setLoading(false);
    };

    const filteredServices = useMemo(() => {
        if (!searchQuery) return services;
        const lowerCaseQuery = searchQuery.toLowerCase();
        return services.filter(service =>
            service.name.toLowerCase().includes(lowerCaseQuery) ||
            service.description.toLowerCase().includes(lowerCaseQuery)
        );
    }, [searchQuery, services]);

    const handleBook = (service) => {
        setSelectedService(service);
        goToPage('Booking');
    };

    if (loading) {
        return (
            <div className="flex flex-col flex-1 items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-gray-500">Loading services...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1">
            <HomeHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} goToPage={goToPage} />
            <div className="p-6 pt-4 overflow-y-auto flex-1 max-w-4xl mx-auto w-full pb-20">
                <p className="text-sm font-semibold mb-4 text-gray-500 text-center">
                    Available in DHA 2, Naval Anchorage, & Bahria Town (1-6)
                </p>
                {filteredServices.length > 0 ? (
                    <div className="space-y-4">
                        {filteredServices.map((item) => (
                            <ServiceCard key={item.id} service={item} onBookPress={handleBook} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        <Search size={48} className="mx-auto mb-3" />
                        <p>No services match "{searchQuery}".</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Due to length constraints, I'll continue in the next file...
export default App;
