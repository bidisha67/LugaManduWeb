import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL;
                if (!apiUrl) {
                    console.error('VITE_API_URL is not defined in .env');
                    return;
                }
                const response = await axios.get(`${apiUrl}/products`);
                // Ensure products is always an array
                const data = Array.isArray(response.data) ? response.data : [];
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const imageUrl = import.meta.env.VITE_IMAGE_URL;

    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <section className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
                <img
                    src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                    alt="Hero"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-12 text-white">
                    <h1 className="text-5xl font-black mb-4">Elevate Your Style</h1>
                    <p className="text-xl max-w-md text-gray-200">Discover the latest trends in high-quality apparel.</p>
                </div>
            </section>

            {/* Product Feed */}
            <section>
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">New Arrivals</h2>
                        <div className="h-1 w-12 bg-indigo-600 mt-2 rounded-full"></div>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="animate-pulse bg-white rounded-2xl h-80 shadow-md"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {Array.isArray(products) && products.map((product) => (
                            <Link
                                key={product.id}
                                to={`/product/${product.id}`}
                                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border border-gray-100"
                            >
                                <div className="h-64 overflow-hidden relative">
                                    <img
                                        src={`${imageUrl}/${product.image}`}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-indigo-700 font-bold shadow-sm">
                                        Rs.{product.price}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-2">{product.description}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {!loading && (!products || products.length === 0) && (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-dashed border-gray-200">
                        <p className="text-gray-400 text-lg">No clothes found in the collection yet.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Home;