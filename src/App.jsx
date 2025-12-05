import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  UserCircle, House, WashingMachine, Shirt, Package,
  Clock, ClipboardList, Star, ChevronLeft, X, Calendar, Users, Search, Bell, MapPin, Globe, Cake, ChevronDown, ChevronRight, Wand, Edit, Shield, FileText
} from 'lucide-react';
import * as FirebaseService from './services/firebaseService';
import RegisterPage from './components/RegisterPage';
import EditProfilePage from './components/EditProfilePage';
import AdminDashboard from './components/AdminDashboard';

// --- Constants ---
const SERVICE_AREAS = [
  'DHA Phase 2 Islamabad',
  'Naval Anchorage Islamabad',
  'Bahria Town Phase 1-6',
];

// --- Helper Functions ---
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
  return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${ampm}`;
};

const getIconComponent = (iconName) => {
  const icons = { House, Wand, WashingMachine, Shirt, Package };
  return icons[iconName] || House;
};

// --- Shared Components ---

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
  const firstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay(); // 0 (Sun) - 6 (Sat)

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
      // Adjust for timezone offset to prevent date shifting
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
      <UserCircle size={24} />
    </button>
  </header>
);

const HomeHeader = ({ searchQuery, setSearchQuery, goToPage }) => (
  <div className="relative p-4 pt-8 bg-primary rounded-b-2xl shadow-xl transition-all duration-300">
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center">
        <div className="bg-white p-2 rounded-xl mr-3 shadow-lg">
          <img src="/assets/logo.png" alt="Saaf Kardo" className="h-8 w-auto object-contain" />
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

  // Map service names to local images
  const getServiceImage = (name) => {
    if (name.includes('Deep Cleaning')) return '/assets/deep_cleaning.png';
    if (name.includes('Kitchen')) return '/assets/kitchen_cleaning.png';
    if (name.includes('Laundry')) return '/assets/laundry_service.png';
    if (name.includes('Move')) return '/assets/move_in_out_cleaning.png';
    if (name.includes('Sofa')) return '/assets/sofa_carpet_cleaning.png';
    return null;
  };

  const imageSrc = getServiceImage(service.name);

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 mb-4 border border-gray-100 overflow-hidden">
      {imageSrc ? (
        <div className="h-40 w-full overflow-hidden relative">
          <img src={imageSrc} alt={service.name} className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2 bg-white p-2 rounded-full shadow-md text-primary">
            <IconComponent size={20} />
          </div>
        </div>
      ) : (
        <div className="h-24 bg-purple-50 flex items-center justify-center text-primary">
          <IconComponent size={40} />
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{service.name}</h2>
            <p className="text-sm text-gray-500 my-1 line-clamp-2">{service.description}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <p className="text-xs font-medium italic text-gray-500 flex items-center">
            {service.type === 'hourly' ? <Clock size={12} className="mr-1" /> : <ClipboardList size={12} className="mr-1" />}
            {service.type === 'hourly' ? 'Hourly Service' : 'Project Based'}
          </p>
          <button
            className="px-4 py-2 rounded-lg bg-secondary text-white font-semibold hover:bg-cyan-500 transition-colors text-sm"
            onClick={() => onBookPress(service)}
          >
            Book Now
          </button>
        </div>
      </div>
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
      <div className="bg-white p-6 rounded-3xl mb-8 shadow-xl flex items-center justify-center">
        <img src="/assets/logo.png" alt="Saaf Kardo" className="h-32 w-auto object-contain" />
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

const ServicesPage = ({ goToPage, setSelectedService }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');


  const FILTERS = ['All', 'Deep Cleaning', 'Kitchen', 'Laundry', 'Move', 'Sofa'];

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
    let filtered = services;

    if (activeFilter !== 'All') {
      filtered = filtered.filter(service => service.name.includes(activeFilter));
    }

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(lowerCaseQuery) ||
        service.description.toLowerCase().includes(lowerCaseQuery)
      );
    }

    return filtered;
  }, [searchQuery, services, activeFilter]);

  const handleBook = (service) => {
    setSelectedService(service);
    goToPage('Booking');
  };

  const filterScrollRef = React.useRef(null);

  const scrollFilters = (direction) => {
    if (filterScrollRef.current) {
      const scrollAmount = 200;
      filterScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
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

      <div className="bg-white border-b border-gray-100">
        <div className="relative flex items-center max-w-4xl mx-auto">
          <button
            onClick={() => scrollFilters('left')}
            className="absolute left-0 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>

          <div
            ref={filterScrollRef}
            className="flex overflow-x-auto p-4 space-x-3 no-scrollbar mx-10"
          >
            {FILTERS.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${activeFilter === filter
                  ? 'bg-primary text-white shadow-md transform scale-105'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {filter === 'Move' ? 'Move In/Out' : filter}
              </button>
            ))}
          </div>

          <button
            onClick={() => scrollFilters('right')}
            className="absolute right-0 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

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
            <p>No services match your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const BookingPage = ({ goToPage, selectedService, showNotification, userProfile }) => {
  const todayISO = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayISO);
  const [time, setTime] = useState('10:00');
  const [area, setArea] = useState(SERVICE_AREAS[0]);
  const [address, setAddress] = useState(userProfile?.address || '');
  const [loading, setLoading] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  const handleConfirm = async () => {
    if (!address || !date || !time || !area) {
      showNotification('Please select a date, time, area, and service address.', 'error');
      return;
    }
    setLoading(true);

    const bookingData = {
      service: selectedService.name,
      date,
      time,
      area,
      address
    };

    const result = await FirebaseService.createBooking(bookingData, userProfile);
    setLoading(false);

    if (result.success) {
      showNotification('Booking confirmed! You will receive a worker assignment shortly.', 'success');
      goToPage('Bookings');
    } else {
      showNotification('Failed to create booking: ' + result.error, 'error');
    }
  };

  const IconComponent = getIconComponent(selectedService.iconName);

  return (
    <div className="flex flex-col flex-1 pb-16 overflow-y-auto bg-gray-50">
      <Header title="New Booking" onBackPress={() => goToPage('Services')} onProfilePress={() => goToPage('Profile')} />

      <div className="p-4 mx-4 mt-4 bg-white rounded-xl shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-100 text-primary">
            <IconComponent size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{selectedService.name}</h2>
            <p className="text-sm text-gray-500">{selectedService.type === 'hourly' ? 'Hourly Service' : 'Project Based'}</p>
          </div>
        </div>
      </div>

      <div className="p-4 mx-4 mt-4 bg-white rounded-xl shadow-lg">
        <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">Schedule</h3>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase text-gray-500 block mb-1">Date</label>
            <button onClick={() => setShowDateModal(true)} className="w-full h-12 flex items-center justify-between px-4 border border-gray-300 rounded-lg text-gray-700 transition-shadow hover:shadow-md">
              <Calendar size={20} className="text-gray-500 mr-2" />
              <span className="flex-1 text-left font-medium">{formatDateForDisplay(date)}</span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
          </div>
          <div className="flex-1">
            <label className="text-xs font-semibold uppercase text-gray-500 block mb-1">Time</label>
            <button onClick={() => setShowTimeModal(true)} className="w-full h-12 flex items-center justify-between px-4 border border-gray-300 rounded-lg text-gray-700 transition-shadow hover:shadow-md">
              <Clock size={20} className="text-gray-500 mr-2" />
              <span className="flex-1 text-left font-medium">{formatTimeForDisplay(time)}</span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 mx-4 mt-4 bg-white rounded-xl shadow-lg">
        <h3 className="text-lg font-bold text-primary mb-4 border-b pb-2">Location</h3>
        <label className="text-xs font-semibold uppercase text-gray-500 block mb-1">Service Area</label>
        <div className="relative mb-4">
          <MapPin size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <select value={area} onChange={(e) => setArea(e.target.value)} className="w-full h-12 pl-10 pr-4 border border-gray-300 rounded-lg text-gray-700 appearance-none bg-white focus:ring-2 focus:ring-primary">
            {SERVICE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <label className="text-xs font-semibold uppercase text-gray-500 block mb-1">Detailed Address</label>
        <input type="text" placeholder="e.g., House No., Street, Landmark" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full h-12 border border-gray-300 rounded-lg px-4 text-base text-gray-700 focus:ring-2 focus:ring-primary" />
      </div>

      <div className="p-4 mx-4 mt-6 mb-20">
        <button onClick={handleConfirm} className={`w-full py-3 rounded-lg bg-primary text-white font-semibold text-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-300 ${loading ? 'opacity-70' : ''}`} disabled={loading}>
          {loading ? 'Processing...' : `Confirm Booking`}
        </button>
      </div>

      {showDateModal && <DatePickerModal selectedDate={date} onSelectDate={setDate} onClose={() => setShowDateModal(false)} />}
      {showTimeModal && <TimePickerModal selectedTime={time} onSelectTime={setTime} onClose={() => setShowTimeModal(false)} />}
    </div>
  );
};

const BookingsPage = ({ goToPage, showNotification, userId }) => {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState([]);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    const [bookingsResult, servicesResult] = await Promise.all([
      FirebaseService.getUserBookings(userId),
      FirebaseService.getServices()
    ]);

    if (bookingsResult.success) {
      setBookings(bookingsResult.data);
    }
    if (servicesResult.success) {
      setServices(servicesResult.data);
    }
    setLoading(false);
  };

  const upcomingBookings = bookings.filter(b => ['Pending', 'Confirmed', 'In Progress'].includes(b.status));
  const pastBookings = bookings.filter(b => ['Completed', 'Cancelled'].includes(b.status));
  const bookingsToShow = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const handleCancel = async (bookingId) => {
    const result = await FirebaseService.cancelBooking(bookingId);
    if (result.success) {
      showNotification(`Booking has been cancelled.`, 'info');
      loadData();
    } else {
      showNotification('Failed to cancel booking', 'error');
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-400';
    }
  };

  const BookingCard = ({ booking }) => {
    const serviceDetails = services.find(s => s.name === booking.service);
    const IconComponent = serviceDetails ? getIconComponent(serviceDetails.iconName) : House;

    return (
      <div className="p-4 bg-white rounded-xl shadow-md border border-gray-100 mb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-50 text-primary mr-3">
              <IconComponent size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{booking.service}</h3>
              <p className="text-xs text-gray-500">ID: #{booking.id.substring(0, 8)}</p>
            </div>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusClasses(booking.status)}`}>
            {booking.status}
          </span>
        </div>
        <div className="space-y-2 text-sm">
          <p className="flex items-center text-gray-600">
            <Calendar size={16} className="mr-2 text-gray-400" />
            {formatDateForDisplay(booking.date)} at {formatTimeForDisplay(booking.time)}
          </p>
          <p className="flex items-center text-gray-600">
            <MapPin size={16} className="mr-2 text-gray-400" />
            {booking.area}
          </p>
          <p className="flex items-center text-gray-600">
            <UserCircle size={16} className="mr-2 text-gray-400" />
            Expert: <span className="font-medium ml-1">{booking.worker || 'Pending Assignment'}</span>
          </p>
        </div>
        {booking.status === 'Confirmed' || booking.status === 'Pending' ? (
          <div className="mt-4 flex justify-end">
            <button onClick={() => handleCancel(booking.id)} className="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors">
              Cancel Booking
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 pb-16 overflow-y-auto bg-gray-50">
      <Header title="My Bookings" onBackPress={() => goToPage('Services')} onProfilePress={() => goToPage('Profile')} />
      <div className="sticky top-16 z-10 bg-white shadow-sm mb-4">
        <div className="flex max-w-4xl mx-auto px-4">
          <button onClick={() => setActiveTab('upcoming')} className={`flex-1 py-3 text-center font-semibold transition-colors duration-200 ${activeTab === 'upcoming' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'}`}>
            Upcoming ({upcomingBookings.length})
          </button>
          <button onClick={() => setActiveTab('past')} className={`flex-1 py-3 text-center font-semibold transition-colors duration-200 ${activeTab === 'past' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'}`}>
            History ({pastBookings.length})
          </button>
        </div>
      </div>
      <div className="px-4 max-w-4xl mx-auto w-full">
        {bookingsToShow.length > 0 ? (
          bookingsToShow.map(booking => <BookingCard key={booking.id} booking={booking} />)
        ) : (
          <div className="text-center py-10 text-gray-500">
            <Calendar size={48} className="mx-auto mb-3 opacity-50" />
            <p>No {activeTab} bookings found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const WorkersPage = ({ goToPage }) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    const result = await FirebaseService.getWorkers();
    if (result.success) {
      setWorkers(result.data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 pb-16 overflow-y-auto bg-gray-50">
      <Header title="Our Experts" onBackPress={() => goToPage('Services')} onProfilePress={() => goToPage('Profile')} />
      <div className="p-4 max-w-4xl mx-auto w-full">
        <div className="space-y-4">
          {workers.map(worker => (
            <div key={worker.id} className="p-4 bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="flex items-center space-x-4 border-b pb-4 mb-4">
                {worker.photo ? (
                  <img src={worker.photo} alt={worker.name} className="w-16 h-16 rounded-full object-cover border-4 border-purple-200" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center text-primary font-bold text-xl border-4 border-purple-200">
                    {worker.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-800">{worker.name}</h3>
                    <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                      <Star size={14} className="text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="text-sm font-bold text-gray-700">{worker.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-primary font-medium">{worker.specialty}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-3">{worker.bio}</p>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <p className="flex items-center text-gray-600"><MapPin size={16} className="mr-2 text-gray-400" /> {worker.location || 'Location not set'}</p>
                <p className="flex items-center text-gray-600"><Globe size={16} className="mr-2 text-gray-400" /> {worker.languages ? (Array.isArray(worker.languages) ? worker.languages.join(', ') : worker.languages) : 'N/A'}</p>
                <p className="flex items-center text-gray-600"><Cake size={16} className="mr-2 text-gray-400" /> {worker.age} Years Old</p>
              </div>

              <div className="flex gap-2 mt-3">
                {worker.policeVerified && (
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full flex items-center border border-blue-100">
                    <Shield size={12} className="mr-1" /> Police Verified
                  </span>
                )}
                {worker.residentPass && (
                  <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full flex items-center border border-green-100">
                    <FileText size={12} className="mr-1" /> Resident Pass
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {worker.skills && (Array.isArray(worker.skills) ? worker.skills : worker.skills.split(',')).map(skill => (
                    <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">{skill.trim()}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProfilePage = ({ goToPage, onLogout, userProfile }) => {
  if (!userProfile) return null;

  const ProfileItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-center py-3 border-b border-gray-100 last:border-0">
      <div className="p-2 rounded-full bg-purple-50 text-primary mr-4">
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
        <p className="text-gray-800 font-medium">{value || 'Not set'}</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col flex-1 pb-16 overflow-y-auto bg-gray-50">
      <Header title="My Profile" onBackPress={() => goToPage('Services')} onProfilePress={() => { }} />
      <div className="p-6 max-w-4xl mx-auto w-full">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full bg-purple-200 flex items-center justify-center mb-4 border-4 border-white shadow-lg">
            <span className="text-3xl font-bold text-primary">{userProfile.name?.charAt(0) || 'U'}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{userProfile.name}</h2>
          <p className="text-gray-500">{userProfile.email}</p>
          <button onClick={() => goToPage('EditProfile')} className="mt-2 flex items-center text-sm text-secondary font-semibold hover:underline">
            <Edit size={16} className="mr-1" /> Edit Profile
          </button>
        </div>
        <div className="p-4 bg-white rounded-xl shadow-lg mb-6">
          <h3 className="text-lg font-bold text-primary mb-2 border-b pb-2">Account Details</h3>
          <ProfileItem icon={UserCircle} label="Full Name" value={userProfile.name} />
          <ProfileItem icon={Bell} label="Email" value={userProfile.email} />
          <ProfileItem icon={Clock} label="Phone" value={userProfile.phone} />
          <ProfileItem icon={MapPin} label="Default Address" value={userProfile.address} />
        </div>
        <div className="p-4 bg-white rounded-xl shadow-lg mb-6">
          <h3 className="text-lg font-bold text-primary mb-2 border-b pb-2">Actions</h3>
          <button className="w-full text-left py-3 text-base text-gray-700 flex items-center hover:bg-gray-50 rounded-lg">
            <ClipboardList size={20} className="mr-4 text-secondary" />
            <span className="font-medium">Payment Methods</span>
            <ChevronRight size={16} className="ml-auto text-gray-400" />
          </button>
          <button className="w-full text-left py-3 text-base text-gray-700 flex items-center hover:bg-gray-50 rounded-lg">
            <Star size={20} className="mr-4 text-secondary" />
            <span className="font-medium">My Reviews</span>
            <ChevronRight size={16} className="ml-auto text-gray-400" />
          </button>
        </div>
        <button onClick={onLogout} className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors">
          Log Out
        </button>
      </div>
    </div>
  );
};

const NotificationsPage = ({ goToPage }) => {
  const notifications = [
    { id: 1, title: 'Booking Confirmed', message: 'Your Deep Cleaning service has been confirmed for tomorrow.', time: '2 hours ago', type: 'success' },
    { id: 2, title: 'New Offer', message: 'Get 20% off on your next Laundry service!', time: '1 day ago', type: 'promo' },
    { id: 3, title: 'Rate your Expert', message: 'Please rate your experience with Aisha K.', time: '3 days ago', type: 'action' },
  ];

  const getIconAndColor = (type) => {
    switch (type) {
      case 'success': return { icon: Calendar, color: 'bg-green-100 text-green-600' };
      case 'promo': return { icon: Star, color: 'bg-yellow-100 text-yellow-600' };
      case 'action': return { icon: ClipboardList, color: 'bg-blue-100 text-blue-600' };
      default: return { icon: Bell, color: 'bg-gray-100 text-gray-600' };
    }
  };

  const NotificationCard = ({ notif }) => {
    const { icon: Icon, color } = getIconAndColor(notif.type);
    return (
      <div className="p-4 bg-white rounded-xl shadow-md border border-gray-100 flex items-start space-x-4 mb-3">
        <div className={`p-2 rounded-full ${color}`}>
          <Icon size={20} />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-800 text-sm">{notif.title}</h4>
          <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
          <p className="text-[10px] text-gray-400 mt-2 text-right">{notif.time}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 pb-16 overflow-y-auto bg-gray-50">
      <Header title="Notifications" onBackPress={() => goToPage('Services')} onProfilePress={() => goToPage('Profile')} />
      <div className="p-4 max-w-4xl mx-auto w-full">
        {notifications.map(n => <NotificationCard key={n.id} notif={n} />)}
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState('Login');
  const [selectedService, setSelectedService] = useState(null);
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = FirebaseService.onAuthChange(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const profileResult = await FirebaseService.getUserProfile(currentUser.uid);
        if (profileResult.success) {
          setUserProfile(profileResult.data);
          // Redirect based on role
          if (profileResult.data.role === 'admin') {
            setCurrentPage('AdminDashboard');
          } else {
            setCurrentPage('Services');
          }
        }
      } else {
        setUserProfile(null);
        setCurrentPage('Login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const refreshUserProfile = async () => {
    if (user) {
      const profileResult = await FirebaseService.getUserProfile(user.uid);
      if (profileResult.success) {
        setUserProfile(profileResult.data);
      }
    }
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLoginSuccess = async () => {
    // Auth state change listener handles redirection
  };

  const handleRegisterSuccess = async (email, password, userData) => {
    const result = await FirebaseService.registerUser(email, password, userData);
    if (result.success) {
      showNotification('Registration successful!', 'success');
      // Auth state change listener handles redirection
    } else {
      showNotification(result.error || 'Registration failed', 'error');
    }
  };

  const handleLogout = async () => {
    await FirebaseService.logoutUser();
    setCurrentPage('Login');
  };

  const renderPage = () => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (currentPage) {
      case 'Login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} onRegisterPress={() => setCurrentPage('Register')} />;
      case 'Register':
        return <RegisterPage onRegisterSuccess={handleRegisterSuccess} onBackToLogin={() => setCurrentPage('Login')} />;
      case 'AdminDashboard':
        return <AdminDashboard goToPage={setCurrentPage} showNotification={showNotification} onLogout={handleLogout} />;
      case 'Services':
        return <ServicesPage goToPage={setCurrentPage} setSelectedService={setSelectedService} />;
      case 'Booking':
        return <BookingPage goToPage={setCurrentPage} selectedService={selectedService} showNotification={showNotification} userProfile={userProfile} />;
      case 'Bookings':
        return <BookingsPage goToPage={setCurrentPage} showNotification={showNotification} userId={user?.uid} />;
      case 'Workers':
        return <WorkersPage goToPage={setCurrentPage} />;
      case 'Profile':
        return <ProfilePage goToPage={setCurrentPage} onLogout={handleLogout} userProfile={userProfile} />;
      case 'EditProfile':
        return <EditProfilePage goToPage={setCurrentPage} userId={user?.uid} showNotification={showNotification} onProfileUpdate={refreshUserProfile} />;
      case 'Notifications':
        return <NotificationsPage goToPage={setCurrentPage} />;
      default:
        return <ServicesPage goToPage={setCurrentPage} setSelectedService={setSelectedService} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col antialiased bg-gray-50 text-gray-800 max-w-lg mx-auto shadow-xl">
      {renderPage()}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        </div>
      )}
      {user && currentPage !== 'Login' && currentPage !== 'Register' && currentPage !== 'AdminDashboard' && (
        <BottomNavBar currentPage={currentPage} goToPage={setCurrentPage} />
      )}
    </div>
  );
}