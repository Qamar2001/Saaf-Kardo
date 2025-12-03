import React, { useState } from 'react';
import { Star } from 'lucide-react';

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
        await onRegisterSuccess(email, password, { name, phone, address });
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-gray-50">
            <div className="bg-white p-4 rounded-3xl mb-6 shadow-xl">
                <img src="/assets/logo.png" alt="Saaf Kardo" className="h-32 w-auto object-contain" />
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

export default RegisterPage;
