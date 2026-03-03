import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { user, token } = useAuth();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchProducts();
        fetchStats();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/products`);
            setProducts(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/orders/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    if (!user || user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
        if (file) {
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('price', price);
        formData.append('description', description);
        if (image) formData.append('image', image);

        try {
            if (editingProduct) {
                await axios.put(`${import.meta.env.VITE_API_URL}/products/${editingProduct.id}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });
                toast.success('Product updated successfully!');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/products`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                });
                toast.success('Product added successfully!');
            }
            resetForm();
            fetchProducts();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setPrice('');
        setDescription('');
        setImage(null);
        setPreview(null);
        setEditingProduct(null);
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setName(product.name);
        setPrice(product.price);
        setDescription(product.description);
        setPreview(`${import.meta.env.VITE_IMAGE_URL}/${product.image}`);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            toast.success('Product deleted');
            fetchProducts();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    return (
        <div className="space-y-12">
            {/* Header with Welcome Message */}
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Admin Dashboard</h1>
                    <p className="text-gray-500 font-medium">Welcome back, <span className="text-indigo-600">{user?.name}</span>! 👋</p>
                </div>
                <div className="bg-indigo-50 px-6 py-3 rounded-2xl">
                    <span className="text-indigo-600 font-bold">Role: Administrator</span>
                </div>
            </div>

            {/* Stats Section */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                        <span className="text-gray-500 text-sm font-medium">Total Users</span>
                        <span className="text-3xl font-black text-indigo-600">{stats.totalUsers}</span>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                        <span className="text-gray-500 text-sm font-medium">Pending Orders</span>
                        <span className="text-3xl font-black text-orange-500">{stats.pendingOrders}</span>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                        <span className="text-gray-500 text-sm font-medium">Completed</span>
                        <span className="text-3xl font-black text-green-500">{stats.completedOrders}</span>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                        <span className="text-gray-500 text-sm font-medium">Total Revenue</span>
                        <span className="text-3xl font-black text-gray-900">Rs.{stats.totalRevenue.toFixed(2)}</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product Form */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-xl h-fit sticky top-24">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">
                        {editingProduct ? 'Edit Product' : 'Add New Clothes'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                            <input
                                type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Price (Rs.)</label>
                            <input
                                type="number" required value={price} onChange={(e) => setPrice(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                            <textarea
                                required rows="3" value={description} onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Image</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-400 transition-colors cursor-pointer relative">
                                {preview ? (
                                    <img src={preview} alt="Preview" className="h-32 object-contain" />
                                ) : (
                                    <div className="space-y-1 text-center">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <p className="text-xs text-gray-500">PNG, JPG, JPEG up to 2MB</p>
                                    </div>
                                )}
                                <input type="file" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            {editingProduct && (
                                <button
                                    type="button" onClick={resetForm}
                                    className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit" disabled={loading}
                                className="flex-[2] bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 shadow-md active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add to Collection')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Product List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">Manage Collection</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {products.map((product) => (
                            <div key={product.id} className="bg-white p-4 rounded-2xl flex items-center space-x-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <img src={`${import.meta.env.VITE_IMAGE_URL}/${product.image}`} className="w-20 h-20 object-cover rounded-lg" alt="" />
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-900">{product.name}</h3>
                                    <p className="text-indigo-600 font-medium">Rs.{product.price}</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {products.length === 0 && <p className="text-gray-500 col-span-2">No products in collection yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
