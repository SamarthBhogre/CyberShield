import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, ShieldClose, Hourglass, Link as LinkIcon, ArrowUpRight } from 'lucide-react';
import { useAuth } from './AuthContext';

// --- Updated Navbar Component ---
const Navbar = () => {
    const { user, logout } = useAuth();
    return (
        <header className="sticky top-0 z-50 p-4">
            <nav className="container mx-auto max-w-7xl bg-black/30 backdrop-blur-sm border border-white/10 rounded-full p-2 flex items-center justify-between">
                {/* Logo */}
                <Link to="/home" className="flex items-center space-x-2 pl-4">
                    <ShieldCheck className="text-cyan-400 h-7 w-7" />
                    <span className="text-xl font-bold tracking-wide">CyberShield</span>
                </Link>

                {/* Main Navigation Links */}
                <div className="hidden md:flex items-center space-x-6 bg-black/20 border border-white/10 rounded-full px-6 py-2">
                    <Link to="/home" className="text-gray-300 hover:text-cyan-400 transition-colors">Home</Link>
                    <Link to="/url-checker" className="text-cyan-400 font-bold transition-colors">URL Checker</Link>
                    <Link to="/password-checker" className="text-gray-300 hover:text-cyan-400 transition-colors">Password Checker</Link>
                    <Link to="/phishing-detector" className="text-gray-300 hover:text-cyan-400 transition-colors">Phishing Detector</Link>
                    <Link to="/news-detector" className="text-gray-300 hover:text-cyan-400 transition-colors">News Detector</Link>
                </div>

                {/* Auth Buttons */}
                <div className="flex items-center space-x-4 pr-2">
                    {!user ? (
                        <>
                            <Link to="/login" className="text-gray-300 hover:text-cyan-400 transition-colors font-medium px-4 py-2">
                                Login
                            </Link>
                            <Link to="/register" className="bg-cyan-500 text-gray-900 font-bold py-2 px-5 rounded-full flex items-center gap-1 hover:bg-cyan-400 transition-colors">
                                Sign Up <ArrowUpRight size={16} />
                            </Link>
                        </>
                    ) : (
                        <>
                            <span className="text-cyan-400 font-bold hidden md:block">Hi, {user.username}</span>
                            <button
                                onClick={logout}
                                className="bg-cyan-500 text-gray-900 font-bold py-2 px-5 rounded-full hover:bg-cyan-400 transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

// --- Main URL Checker Component ---
export default function URLChecker() {
    const [url, setUrl] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleUrlCheck = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await axios.post('http://localhost:5000/api/check-url', { url });
            setResult(response.data);
        } catch (err) {
            setError(err.response?.data?.error || 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const ResultDisplay = () => {
        if (!result) return null;

        const verdictStyles = {
            Safe: {
                icon: <ShieldCheck className="h-16 w-16 text-green-400" />,
                textColor: 'text-green-400',
                bgColor: 'bg-green-500/10',
                borderColor: 'border-green-500/20',
            },
            Suspicious: {
                icon: <ShieldAlert className="h-16 w-16 text-yellow-400" />,
                textColor: 'text-yellow-400',
                bgColor: 'bg-yellow-500/10',
                borderColor: 'border-yellow-500/20',
            },
            Malicious: {
                icon: <ShieldClose className="h-16 w-16 text-red-400" />,
                textColor: 'text-red-400',
                bgColor: 'bg-red-500/10',
                borderColor: 'border-red-500/20',
            },
        };

        const currentStyle = verdictStyles[result.verdict] || verdictStyles.Suspicious;

        return (
            <div className={`mt-8 p-6 rounded-2xl border ${currentStyle.borderColor} ${currentStyle.bgColor} transition-all duration-500`}>
                <div className="flex flex-col items-center text-center">
                    {currentStyle.icon}
                    <h2 className={`text-4xl font-bold mt-4 ${currentStyle.textColor}`}>{result.verdict}</h2>
                    <p className="text-gray-300 mt-2 max-w-xl">{result.summary}</p>
                </div>
                <div className="mt-6 border-t border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-4">Analysis Details:</h3>
                    <ul className="space-y-3 text-gray-400">
                        {Object.entries(result.checks).map(([key, value]) => (
                            <li key={key} className="flex justify-between items-center bg-gray-800 p-3 rounded-lg">
                                <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                                <span className="font-mono text-white">{String(value)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };


    return (
        <div className="bg-gray-900 min-h-screen text-white font-sans">
            <Navbar />
            <main className="container mx-auto px-6 py-12">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-cyan-400">
                        URL Safety Checker
                    </h1>
                    <p className="mt-4 text-lg text-gray-400">
                        Enter any URL to analyze its safety. Our AI will check for phishing, malware, and other threats.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto mt-10 bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-cyan-500/20 shadow-2xl">
                    <form onSubmit={handleUrlCheck}>
                        <div className="relative">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com"
                                required
                                className="w-full bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-700 rounded-lg py-3 pr-4 pl-12 focus:outline-none focus:border-cyan-500 transition-all duration-300"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 w-full bg-cyan-500 text-gray-900 font-bold p-3 rounded-lg hover:bg-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/20 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <Hourglass className="animate-spin h-5 w-5 mr-3" />
                                    Analyzing...
                                </>
                            ) : (
                                'Check URL'
                            )}
                        </button>
                    </form>
                    {error && <p className="mt-4 text-center text-red-400 bg-red-500/20 p-3 rounded-lg">{error}</p>}
                </div>

                <div className="max-w-3xl mx-auto">
                    <ResultDisplay />
                </div>
            </main>
        </div>
    );
}

