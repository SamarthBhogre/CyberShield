import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ShieldCheck, Hourglass, CheckCircle, XCircle, AlertCircle, Link as LinkIcon, Type, Globe, User, ArrowUpRight } from 'lucide-react';
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
                    <Link to="/url-checker" className="text-gray-300 hover:text-cyan-400 transition-colors">URL Checker</Link>
                    <Link to="/password-checker" className="text-gray-300 hover:text-cyan-400 transition-colors">Password Checker</Link>
                    <Link to="/phishing-detector" className="text-gray-300 hover:text-cyan-400 transition-colors">Phishing Detector</Link>
                    <Link to="/news-detector" className="text-cyan-400 font-bold transition-colors">News Detector</Link>
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

// --- Main News Detector Component ---
export default function NewsDetector() {
    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [source, setSource] = useState('');
    const [author, setAuthor] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleNewsCheck = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await axios.post('http://localhost:5000/api/check-news', {
                url,
                title,
                source,
                author
            });
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
            "Likely True": {
                icon: <CheckCircle className="h-16 w-16 text-green-400" />,
                textColor: 'text-green-400',
                bgColor: 'bg-green-500/10',
                borderColor: 'border-green-500/20',
                scoreColor: 'bg-green-500'
            },
            "Likely Fake": {
                icon: <XCircle className="h-16 w-16 text-red-400" />,
                textColor: 'text-red-400',
                bgColor: 'bg-red-500/10',
                borderColor: 'border-red-500/20',
                scoreColor: 'bg-red-500'
            },
            "Not Verified": {
                icon: <AlertCircle className="h-16 w-16 text-yellow-400" />,
                textColor: 'text-yellow-400',
                bgColor: 'bg-yellow-500/10',
                borderColor: 'border-yellow-500/20',
                scoreColor: 'bg-yellow-500'
            },
        };

        const currentStyle = verdictStyles[result.verdict] || verdictStyles["Not Verified"];
        const confidence = result.confidence || 0;

        return (
            <div className={`mt-8 p-6 rounded-2xl border ${currentStyle.borderColor} ${currentStyle.bgColor} transition-all duration-500`}>
                <div className="flex flex-col items-center text-center">
                    {currentStyle.icon}
                    <h2 className={`text-4xl font-bold mt-4 ${currentStyle.textColor}`}>{result.verdict}</h2>
                    <p className="text-gray-300 mt-2 max-w-2xl">{result.summary}</p>
                </div>
                <div className="my-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-400">Confidence Score</span>
                        <span className={`text-lg font-bold ${currentStyle.textColor}`}>{confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className={`${currentStyle.scoreColor} h-2.5 rounded-full`} style={{ width: `${confidence}%` }}></div>
                    </div>
                </div>
                {result.details && (
                    <div className="mt-6 border-t border-gray-700 pt-6">
                        <h3 className="text-lg font-semibold text-cyan-400 mb-4">Analysis Details:</h3>
                        <ul className="space-y-3 text-gray-400">
                            {Object.entries(result.details).map(([key, value]) => (
                                <li key={key} className="bg-gray-800 p-4 rounded-lg">
                                    <strong className="font-medium capitalize text-white">{key.replace(/_/g, ' ')}:</strong>
                                    <p className="mt-1 text-sm">{value}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white font-sans">
            <Navbar />
            <main className="container mx-auto px-6 py-12">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-cyan-400">
                        Fake News Detector
                    </h1>
                    <p className="mt-4 text-lg text-gray-400">
                        Enter the URL and any other details to verify an article's authenticity. More details lead to a more accurate analysis.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto mt-10 bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-cyan-500/20 shadow-2xl">
                    <form onSubmit={handleNewsCheck} className="space-y-4">
                        <div className="relative">
                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Article URL (Required)" required className="w-full bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-700 rounded-lg py-3 pr-4 pl-12 focus:outline-none focus:border-cyan-500 transition-all duration-300" />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Article Title (Optional)" className="w-full bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-700 rounded-lg py-3 pr-4 pl-12 focus:outline-none focus:border-cyan-500 transition-all duration-300" />
                            </div>
                            <div className="relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Source (e.g., bbc.com)" className="w-full bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-700 rounded-lg py-3 pr-4 pl-12 focus:outline-none focus:border-cyan-500 transition-all duration-300" />
                            </div>
                        </div>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author's Name (Optional)" className="w-full bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-700 rounded-lg py-3 pr-4 pl-12 focus:outline-none focus:border-cyan-500 transition-all duration-300" />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-cyan-500 text-gray-900 font-bold p-3 rounded-lg hover:bg-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/20 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center"
                        >
                            {loading ? (<> <Hourglass className="animate-spin h-5 w-5 mr-3" /> Analyzing... </>) : ('Verify News')}
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

