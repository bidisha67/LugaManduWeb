import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const Orders = () => {
    const { user, token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const url = user?.role === 'admin'
                ? `${import.meta.env.VITE_API_URL}/orders/all`
                : `${import.meta.env.VITE_API_URL}/orders/my-orders`;

            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, status) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/orders/${orderId}`, { status }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success(`Order ${status}`);
            fetchOrders();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    if (loading) return <div className="text-center py-20 font-bold text-indigo-600 animate-pulse">Loading orders...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm mb-12 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">
                        {user?.role === 'admin' ? 'Order Management' : 'My Orders'}
                    </h1>
                    <p className="text-gray-500 font-medium">Hello, <span className="text-indigo-600">{user?.name}</span>! {user?.role === 'admin' ? 'Monitoring business growth.' : 'Track your style journey.'}</p>
                </div>
                <div className={`px-5 py-2 rounded-2xl font-bold ${user?.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'}`}>
                    Account: {user?.role?.toUpperCase()}
                </div>
            </div>

            <div className="space-y-8">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transition-all hover:shadow-2xl">
                        <div className="p-8">
                            <div className="flex flex-col md:flex-row justify-between mb-8 items-start md:items-center">
                                <div>
                                    <p className="text-sm font-bold text-indigo-600 mb-1">ORDER #{order.id}</p>
                                    <p className="text-gray-500 text-sm font-medium">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="mt-4 md:mt-0 flex items-center space-x-4">
                                    <span className={`px-5 py-1.5 rounded-full font-black text-sm uppercase ${order.status === 'completed' ? 'bg-green-100 text-green-700' :
                                        order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                            'bg-orange-100 text-orange-700 animate-pulse'
                                        }`}>
                                        {order.status}
                                    </span>
                                    <p className="text-2xl font-black text-gray-900">Rs.{order.total.toFixed(2)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center space-x-4 bg-gray-50 p-4 rounded-2xl">
                                        <img
                                            src={`${import.meta.env.VITE_IMAGE_URL}/${item.image}`}
                                            className="w-16 h-16 object-cover rounded-xl"
                                            alt=""
                                        />
                                        <div>
                                            <p className="font-bold text-gray-900 line-clamp-1">{item.name}</p>
                                            <p className="text-gray-500 text-sm">{item.quantity} x Rs.{item.price}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end space-x-4 border-t border-gray-100 pt-8">
                                {user?.role === 'admin' && order.status === 'pending' && (
                                    <button
                                        onClick={() => updateStatus(order.id, 'completed')}
                                        className="bg-green-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                                    >
                                        Mark as Completed
                                    </button>
                                )}

                                {order.status === 'pending' && (
                                    <button
                                        onClick={() => updateStatus(order.id, 'cancelled')}
                                        className="bg-red-50 text-red-600 px-8 py-3 rounded-2xl font-bold hover:bg-red-100 transition-all border border-red-100"
                                    >
                                        Cancel Order
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {orders.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                        <p className="text-gray-400 text-xl font-medium">No orders found yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
