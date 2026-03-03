import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-6 py-4 mb-8">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tighter">
                    LUGA
                </Link>

                <div className="flex items-center space-x-8 font-bold text-gray-600">
                    <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>

                    {user ? (
                        <>
                            <Link to="/orders" className="hover:text-indigo-600 transition-colors">
                                {user.role === 'admin' ? 'Orders' : 'My Orders'}
                            </Link>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="hover:text-indigo-600 transition-colors">Admin</Link>
                            )}
                            {user.role !== 'admin' && (
                                <Link to="/cart" className="relative hover:text-indigo-600 transition-colors flex items-center">
                                    Cart
                                    {cartCount > 0 && (
                                        <span className="ml-2 bg-indigo-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-bounce">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            )}
                            <button
                                onClick={() => { logout(); navigate('/login'); }}
                                className="bg-gray-100 px-6 py-2 rounded-full hover:bg-gray-200 transition-all"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="bg-indigo-600 text-white px-8 py-2.5 rounded-full hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all font-bold"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
