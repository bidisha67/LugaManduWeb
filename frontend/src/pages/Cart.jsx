import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const handleCheckout = async () => {
        if (!user) {
            toast.error('Please login to checkout');
            navigate('/login');
            return;
        }

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/orders`, {
                items: cart,
                total: getCartTotal()
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Order placed successfully! Check My Orders.');
            clearCart();
            navigate('/orders');
        } catch (error) {
            toast.error('Failed to place order');
        }
    };

    if (cart.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
                <Link to="/" className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-700 transition-all shadow-lg">
                    Browse Collection
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-black text-gray-900 mb-8">Shopping Cart</h1>
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="p-8 space-y-6">
                    {cart.map((item) => (
                        <div key={item.id} className="flex items-center space-x-6 pb-6 border-b border-gray-100 last:border-0">
                            <img
                                src={`${import.meta.env.VITE_IMAGE_URL}/${item.image}`}
                                className="w-24 h-24 object-cover rounded-2xl"
                                alt={item.name}
                            />
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                                <p className="text-indigo-600 font-bold text-lg">Rs.{item.price}</p>
                            </div>
                            <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-xl">
                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-2xl font-bold">-</button>
                                <span className="text-xl font-black w-8 text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-2xl font-bold">+</button>
                            </div>
                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-500 hover:text-red-700 font-bold"
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-50 p-8 flex flex-col items-end">
                    <div className="text-right mb-6">
                        <p className="text-gray-500 font-medium">Subtotal</p>
                        <p className="text-4xl font-black text-gray-900">Rs.{getCartTotal().toFixed(2)}</p>
                    </div>
                    <button
                        onClick={handleCheckout}
                        className="w-full md:w-auto bg-indigo-600 text-white px-12 py-4 rounded-2xl font-black text-xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95"
                    >
                        Checkout Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
