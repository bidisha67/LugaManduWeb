import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/products/${id}`);
                setProduct(response.data);
            } catch (error) {
                toast.error('Product not found');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, navigate]);

    if (loading) return <div className="text-center py-20 animate-pulse text-indigo-600 font-bold">Loading product details...</div>;

    return (
        <div className="max-w-5xl mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
            <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="md:w-1/2 relative h-[500px]">
                    <img
                        src={`${import.meta.env.VITE_IMAGE_URL}/${product.image}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl font-black text-2xl text-indigo-600">
                        Rs.{product.price}
                    </div>
                </div>

                {/* Info Section */}
                <div className="md:w-1/2 p-12 flex flex-col justify-center">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors mb-6 font-semibold"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Collection
                    </button>

                    <h1 className="text-4xl font-black text-gray-900 mb-4">{product.name}</h1>
                    <div className="h-1.5 w-16 bg-indigo-600 rounded-full mb-8"></div>

                    <div className="space-y-6 mb-12">
                        <h3 className="text-lg font-bold text-gray-700">Description</h3>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            {product.description}
                        </p>
                    </div>

                    {user?.role !== 'admin' && (
                        <div className="flex flex-col space-y-4">
                            <button
                                onClick={() => {
                                    if (!user) {
                                        toast.error('Please login to add items to cart');
                                        navigate('/login');
                                        return;
                                    }
                                    addToCart(product);
                                    toast.success('Added to cart!');
                                }}
                                className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95 text-xl"
                            >
                                Add to Cart
                            </button>
                            <button
                                onClick={() => navigate('/cart')}
                                className="w-full bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-black transition-all active:scale-95 text-xl"
                            >
                                View Cart & Checkout
                            </button>
                        </div>
                    )}

                    <p className="mt-8 text-center text-sm text-gray-400 font-medium">Delivery Charge Rs.100</p>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
