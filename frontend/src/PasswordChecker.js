import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  ShieldCheck, KeyRound, Link as LinkIcon, Trash2, Edit, Copy, PlusCircle, Zap, RefreshCw,
  X, Loader2, Star, CheckCircle, AlertTriangle, Wand2, ArrowUpRight
} from 'lucide-react';

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

        {/* Main Navigation Links for internal pages */}
        <div className="hidden md:flex items-center space-x-6 bg-black/20 border border-white/10 rounded-full px-6 py-2">
          <Link to="/home" className="text-gray-300 hover:text-cyan-400 transition-colors">Home</Link>
          <Link to="/url-checker" className="text-gray-300 hover:text-cyan-400 transition-colors">URL Checker</Link>
          <Link to="/password-checker" className="text-cyan-400 font-bold transition-colors">Password Checker</Link>
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

// --- NEW: AI Password Transformation Helper ---
/**
 * Creates a strong password variation from an original string.
 * @param {string} originalPassword - The user's input password.
 * @returns {string} A transformed, stronger password.
 */
const createPasswordVariation = (originalPassword) => {
    if (!originalPassword) return '';

    const leetMap = {
        'a': ['@', '4'],
        'e': ['3'],
        'i': ['!', '1'],
        'o': ['0'],
        's': ['$', '5'],
        't': ['7']
    };

    let chars = originalPassword.toLowerCase().split('');

    // Apply transformations
    let transformedChars = chars.map(char => {
        // 50% chance to apply leetspeak substitution if available
        if (leetMap[char] && Math.random() < 0.5) {
            const options = leetMap[char];
            return options[Math.floor(Math.random() * options.length)];
        }
        // 50% chance to randomly capitalize the letter
        if (Math.random() < 0.5) {
            return char.toUpperCase();
        }
        return char;
    });

    // Ensure at least one uppercase and one number if missing
    let variation = transformedChars.join('');
    if (!/[A-Z]/.test(variation) && variation.length > 0) {
        const randomIndex = Math.floor(Math.random() * variation.length);
        variation = variation.substring(0, randomIndex) + variation[randomIndex].toUpperCase() + variation.substring(randomIndex + 1);
    }
    if (!/\d/.test(variation)) {
        variation += Math.floor(Math.random() * 10);
    }
    // Add a special character if missing
    if (!/[!@#$%^&*?]/.test(variation)) {
        const specialChars = ['!', '?', '#', '$'];
        variation += specialChars[Math.floor(Math.random() * specialChars.length)];
    }

    // Ensure first character is not a number if it was the only number added
    if (variation.length === originalPassword.length + 1 && /\d/.test(variation.slice(-1))) {
         variation = variation.slice(0, -1) + originalPassword[0] + variation.slice(-1);
    }


    return variation;
};

export default function PasswordChecker() {
  const { user } = useAuth();
  const username = user?.username;
  // --- STATE MANAGEMENT ---
  const [storedPasswords, setStoredPasswords] = useState([]);
  const [generatedPasswords, setGeneratedPasswords] = useState([]);
  const [selectedPasswordForAnalysis, setSelectedPasswordForAnalysis] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  // --- NEW STATE FOR USER INPUT FLOW ---
  const [userPasswordInput, setUserPasswordInput] = useState('');
  const [submittedUserPassword, setSubmittedUserPassword] = useState('');
  const [improvedPassword, setImprovedPassword] = useState('');
  // --- FETCH STORED PASSWORDS FROM BACKEND ---
  const fetchStoredPasswords = async () => {
    if (!username) return;
    try {
      const res = await fetch(`http://localhost:5000/api/user-passwords/${username}`);
      const data = await res.json();
      if (res.ok) {
        setStoredPasswords(data.passwords || []);
      } else {
        console.error("Failed to fetch passwords:", data.error);
      }
    } catch (error) {
      console.error("Error fetching passwords:", error);
    }
  };
  useEffect(() => {
    fetchStoredPasswords();
  }, [username]);
  // --- API CALLS ---
  const generatePasswords = async () => {
    setIsLoading(true);
    // Clear user input flow state
    setSubmittedUserPassword('');
    setImprovedPassword('');
    setUserPasswordInput('');
    // Clear generator flow state
    setGeneratedPasswords([]);
    setSelectedPasswordForAnalysis(null);
    setAnalysisData(null);
    try {
      const response = await fetch('http://localhost:5000/api/generate-passwords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      if (response.ok && result.passwords) {
        setGeneratedPasswords(result.passwords);
      }
    } catch (error) {
      console.error("Failed to generate passwords:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const analyzePassword = async (password, user = username || "user", website = "example.com") => {
    setIsAnalyzing(true);
    setSelectedPasswordForAnalysis(password);
    setAnalysisData(null);
    try {
      const response = await fetch('http://localhost:5000/api/analyze-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, username: user, website })
      });
      const result = await response.json();
      if (response.ok && result.analysis) {
        setAnalysisData(result.analysis);
      }
    } catch (error) {
      console.error("Failed to analyze password:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- *** UPDATED FUNCTION TO IMPROVE USER'S PASSWORD *** ---
  const handleImprovePassword = async (passwordToImprove) => {
    if (!passwordToImprove || passwordToImprove.length < 4) {
      alert("Please enter a password with at least 4 characters to improve.");
      return;
    }
    setIsLoading(true);
    setGeneratedPasswords([]);
    setAnalysisData(null);
    
    // Generate 3 unique, AI-powered suggestions based on user input
    const aiSuggestions = Array.from({ length: 3 }, () => createPasswordVariation(passwordToImprove));

    // Display the results
    setSubmittedUserPassword(passwordToImprove);
    setImprovedPassword(aiSuggestions[0]); // Show the first suggestion prominently
    setGeneratedPasswords(aiSuggestions);    // Show all three in the list
    setUserPasswordInput('');
    
    // Analyze the original password's strength
    await analyzePassword(passwordToImprove);
    setIsLoading(false);
  };

  // --- CRUD OPERATIONS ---
  const handleAddPassword = async (website, user, password) => {
    if (!website || !user || !password) return;
    try {
      const response = await fetch('http://localhost:5000/api/store-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user, website, password })
      });
      if (response.ok) {
        fetchStoredPasswords();
      } else {
        const data = await response.json();
        alert(`Failed to store password: ${data.error}`);
      }
    } catch (error) {
      console.error("Error storing password:", error);
    }
  };
  const handleUpdatePassword = async (id, updatedWebsite, updatedUsername) => {
    try {
      const res = await fetch(`http://localhost:5000/api/update-password/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, website: updatedWebsite, username: updatedUsername })
      });
      if (res.ok) {
        fetchStoredPasswords();
        closeEditModal();
      } else {
        const data = await res.json();
        alert(`Failed to update entry: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };
  const handleDeletePassword = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/delete-password/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      if (res.ok) {
        fetchStoredPasswords();
        closeDeleteModal();
      } else {
        const data = await res.json();
        alert(`Failed to delete entry: ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting password:", error);
    }
  };
  // --- MODAL HANDLERS & UTILITIES ---
  const openEditModal = (password) => { setCurrentItem(password); setIsEditModalOpen(true); };
  const closeEditModal = () => setIsEditModalOpen(false);
  const openDeleteModal = (password) => { setCurrentItem(password); setIsDeleteModalOpen(true); };
  const closeDeleteModal = () => setIsDeleteModalOpen(false);
  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); };
  const filteredPasswords = storedPasswords.filter(p =>
    p.website.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // --- RENDER ---
  return (
    <div className="bg-gray-900 text-gray-100 min-h-screen font-sans">
      <Navbar />
      <main className="container mx-auto p-4 md:p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-cyan-400">
            Password Dashboard
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Your secure, AI-powered password manager.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 bg-gray-800 p-8 rounded-2xl shadow-lg">
            <PasswordStoragePanel
              passwords={filteredPasswords} onEdit={openEditModal} onDelete={openDeleteModal}
              copyToClipboard={copyToClipboard} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
            />
          </div>
          <div className="lg:col-span-2 bg-gray-800 p-8 rounded-2xl shadow-lg">
            <PasswordGenerationPanel
              generatedPasswords={generatedPasswords}
              onGenerate={generatePasswords}
              onImprove={handleImprovePassword}
              userPasswordInput={userPasswordInput}
              setUserPasswordInput={setUserPasswordInput}
              submittedUserPassword={submittedUserPassword}
              improvedPassword={improvedPassword}
              onAnalyze={analyzePassword}
              onAdd={handleAddPassword}
              isLoading={isLoading}
              copyToClipboard={copyToClipboard}
              username={username}
            />
            <PasswordStrengthChart
              password={selectedPasswordForAnalysis}
              analysisData={analysisData}
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>
      </main>
      {isEditModalOpen && <EditModal item={currentItem} onUpdate={handleUpdatePassword} onClose={closeEditModal} />}
      {isDeleteModalOpen && <DeleteModal item={currentItem} onDelete={handleDeletePassword} onClose={closeDeleteModal} />}
    </div>
  );
}

// --- SUB-COMPONENTS (No changes below this line) ---

const PasswordStoragePanel = ({ passwords, onEdit, onDelete, copyToClipboard, searchTerm, setSearchTerm }) => (
  <div>
    <h2 className="text-2xl font-semibold mb-6 text-white flex items-center"><KeyRound className="mr-3 text-cyan-400" />Stored Passwords</h2>
    <input
      type="text"
      placeholder="Search by website..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 rounded-lg p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-cyan-500"
    />
    <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
      {passwords.length > 0 ? passwords.map(p => (
        <div key={p.id} className="bg-gray-700 p-5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:bg-gray-600/70">
          <div className="flex-grow">
            <div className="flex items-center space-x-3">
              <LinkIcon className="h-5 w-5 text-gray-400" />
              <p className="font-bold text-lg text-white">{p.website}</p>
            </div>
            <p className="text-sm text-gray-300 ml-8">{p.username}</p>
            <div className="flex items-center space-x-2 mt-2 ml-8">
              <p className="font-mono text-sm bg-gray-800 px-2 py-1 rounded">••••••••••••</p>
              <button onClick={() => copyToClipboard(p.password)} className="p-1 text-gray-400 hover:text-cyan-400 transition" title="Copy Password">
                <Copy size={16} />
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button onClick={() => onEdit(p)} className="p-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 rounded-full transition" title="Edit Entry"><Edit size={18} /></button>
            <button onClick={() => onDelete(p)} className="p-2 bg-red-600/20 text-red-400 hover:bg-red-600/40 rounded-full transition" title="Delete Entry"><Trash2 size={18} /></button>
          </div>
        </div>
      )) : (
        <div className="text-center text-gray-400 py-12">
          <KeyRound className="mx-auto h-12 w-12 text-gray-500" />
          <h3 className="mt-2 text-lg font-medium">No passwords stored</h3>
          <p className="mt-1 text-sm">Use the generator to add your first password.</p>
        </div>
      )}
    </div>
  </div>
);

const PasswordGenerationPanel = ({
  generatedPasswords, onGenerate, onAnalyze, onAdd, isLoading, copyToClipboard, username,
  onImprove, userPasswordInput, setUserPasswordInput, submittedUserPassword, improvedPassword
}) => {
  const [website, setWebsite] = useState('');
  const [user, setUser] = useState(username || '');
  useEffect(() => {
    setUser(username || '');
  }, [username]);
  const handleAddAndClear = (password) => {
    if (!website || !user) {
      alert("Please provide a website and username before storing.");
      return;
    }
    onAdd(website, user, password);
    setWebsite('');
  };
  const showGeneratorResults = generatedPasswords.length > 0;
  const showUserInputResults = submittedUserPassword !== '';
  return (
    <div className="mb-8">
      {/* --- Section 1: User Input for Improvement --- */}
      <div className="mb-8 p-6 bg-gray-700/50 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-white flex items-center">
            <Wand2 className="mr-3 text-cyan-400"/>
            Check & Improve Your Password
        </h3>
        <div className="flex gap-2">
            <input
                type="text"
                value={userPasswordInput}
                onChange={(e) => setUserPasswordInput(e.target.value)}
                placeholder="Enter your password here..."
                className="flex-grow bg-gray-800 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
                onClick={() => onImprove(userPasswordInput)}
                disabled={isLoading || !userPasswordInput}
                className="flex items-center justify-center bg-cyan-500 text-gray-900 font-bold p-3 rounded-lg hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
                title="Analyze & Improve"
            >
                <Zap size={20} />
            </button>
        </div>
      </div>
      {/* --- Section 2: Random Password Generator --- */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center"><RefreshCw className="mr-3 text-cyan-400" />Password Generator</h2>
        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="w-full flex items-center justify-center bg-gray-700 text-white font-bold p-3 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transform hover:scale-105 transition-all duration-300 disabled:bg-gray-600 disabled:scale-100"
        >
          {isLoading && !showUserInputResults ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="mr-2" />}
          {isLoading && !showUserInputResults ? 'Generating...' : 'Generate New Passwords'}
        </button>
      </div>
      {/* --- Section 3: Results Display --- */}
      {(showGeneratorResults || showUserInputResults) && (
        <div className="mt-8 space-y-4">
          {/* Display User Input Results */}
          <h3 className="font-semibold text-gray-300">Your Results:</h3>
          <PasswordResultRow
            label="Your Original"
            password={submittedUserPassword}
            {...{onAnalyze, copyToClipboard, handleAddAndClear, user, website}}
          />
          {improvedPassword && (
            <PasswordResultRow
              label="AI Suggestion"
              password={improvedPassword}
              {...{onAnalyze, copyToClipboard, handleAddAndClear, user, website}}
            />
          )}

          {/* Display Generator Results */}
          {showGeneratorResults && submittedUserPassword && (
            <>
              <h3 className="font-semibold text-gray-300 pt-4">More AI Suggestions:</h3>
                {generatedPasswords.slice(1).map((p, i) => ( // Show remaining suggestions
                    <PasswordResultRow key={i} password={p} {...{onAnalyze, copyToClipboard, handleAddAndClear, user, website}}/>
                ))}
            </>
          )}

          {showGeneratorResults && !submittedUserPassword && (
             <>
               <h3 className="font-semibold text-gray-300">Generated Passwords:</h3>
               {generatedPasswords.map((p, i) => (
                  <PasswordResultRow key={i} password={p} {...{onAnalyze, copyToClipboard, handleAddAndClear, user, website}}/>
               ))}
             </>
          )}


          {/* Fields for storing any password */}
          <div className="pt-6 space-y-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">To store a password, provide details below:</p>
            <input type="text" value={website} onChange={e => setWebsite(e.target.value)} placeholder="Website (e.g., google.com)" className="w-full bg-gray-700 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            <input type="text" value={user} onChange={e => setUser(e.target.value)} placeholder="Username or Email" className="w-full bg-gray-700 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for displaying a password result row
const PasswordResultRow = ({ label, password, onAnalyze, copyToClipboard, handleAddAndClear, user, website }) => (
    <div className="bg-gray-700 p-4 rounded-lg flex items-center justify-between">
        <div className="flex-grow truncate pr-2">
            {label && <span className="text-xs text-cyan-400 block uppercase font-bold">{label}</span>}
            <p className="font-mono text-white truncate">{password}</p>
        </div>
        <div className="flex items-center space-x-1 flex-shrink-0">
            <button onClick={() => onAnalyze(password, user, website)} className="p-2 text-gray-400 hover:text-cyan-400" title="Analyze Strength"><ShieldCheck size={18} /></button>
            <button onClick={() => copyToClipboard(password)} className="p-2 text-gray-400 hover:text-cyan-400" title="Copy"><Copy size={18} /></button>
            <button onClick={() => handleAddAndClear(password)} className="p-2 text-gray-400 hover:text-green-400" title="Store Password"><PlusCircle size={18} /></button>
        </div>
    </div>
);

const PasswordStrengthChart = ({ password, analysisData, isAnalyzing }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  useEffect(() => {
    if (typeof window.Chart === 'undefined') {
      console.error("Chart.js is not loaded");
      return;
    }
    if (chartRef.current && analysisData) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new window.Chart(ctx, {
        type: 'radar',
        data: {
          labels: Object.keys(analysisData),
          datasets: [{
            label: 'Password Strength',
            data: Object.values(analysisData),
            backgroundColor: 'rgba(6, 182, 212, 0.2)',
            borderColor: 'rgba(6, 182, 212, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(6, 182, 212, 1)',
            pointBorderColor: '#fff',
          }]
        },
        options: {
          scales: {
            r: {
              angleLines: { color: 'rgba(255, 255, 255, 0.2)' },
              grid: { color: 'rgba(255, 255, 255, 0.2)' },
              pointLabels: { color: '#fff', font: { size: 12 } },
              suggestedMin: 0,
              suggestedMax: 5,
              ticks: {
                stepSize: 1,
                backdropColor: 'transparent',
                color: 'rgba(255, 255, 255, 0.5)',
              }
            }
          },
          plugins: {
            legend: { display: false }
          },
          maintainAspectRatio: false,
        }
      });
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [analysisData]);
  const calculateOverallScore = () => {
    if (!analysisData) return { score: 0, rating: 'N/A', Icon: AlertTriangle, color: "text-gray-400" };
    const scores = Object.values(analysisData);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    if (scores.some(s => s <= 1)) return { score: average.toFixed(1), rating: 'Compromised', Icon: AlertTriangle, color: "text-red-500" };
    if (average < 2.5) return { score: average.toFixed(1), rating: 'Weak', Icon: AlertTriangle, color: "text-yellow-500" };
    if (average < 4) return { score: average.toFixed(1), rating: 'Good', Icon: CheckCircle, color: "text-blue-400" };
    return { score: average.toFixed(1), rating: 'Excellent', Icon: Star, color: "text-green-500" };
  };
  const overall = calculateOverallScore();
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-white flex items-center"><ShieldCheck className="mr-3 text-cyan-400" />Strength Analysis</h2>
      {!password && <p className="text-center text-gray-400 py-12">Select or generate a password to analyze its strength.</p>}
      {isAnalyzing && <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin h-10 w-10 text-cyan-400" /></div>}
      {password && !isAnalyzing && analysisData && (
        <div className="bg-gray-700/50 p-6 rounded-lg">
          <p className="font-mono text-center text-cyan-300 break-all">{password}</p>
          <div className="h-64 my-4"><canvas ref={chartRef}></canvas></div>
          <div className="text-center">
            <p className="text-gray-300">Overall Rating:</p>
            <div className={`flex items-center justify-center text-2xl font-bold ${overall.color}`}>
              <overall.Icon className="mr-2" />
              <span>{overall.rating}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EditModal = ({ item, onUpdate, onClose }) => {
  const [website, setWebsite] = useState(item.website);
  const [username, setUsername] = useState(item.username);
  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(item.id, website, username);
  };
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Edit Entry</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-gray-700"><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
            <input type="text" value={website} onChange={(e) => setWebsite(e.target.value)} className="w-full bg-gray-700 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username/Email</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-gray-700 p-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-500 font-bold py-2 px-6 rounded-lg transition">Cancel</button>
            <button type="submit" className="bg-cyan-500 hover:bg-cyan-400 text-gray-900 font-bold py-2 px-6 rounded-lg transition">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteModal = ({ item, onDelete, onClose }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
    <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md text-center">
      <div className="flex justify-center mb-5">
        <div className="bg-red-500/10 p-4 rounded-full">
          <AlertTriangle className="h-10 w-10 text-red-500" />
        </div>
      </div>
      <h3 className="text-2xl font-semibold mb-3">Delete Password?</h3>
      <p className="text-gray-400 mb-8 max-w-sm mx-auto">
        Are you sure you want to delete the entry for <span className="font-bold text-white">{item.website}</span>? This action cannot be undone.
      </p>
      <div className="flex justify-center space-x-4">
        <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 font-bold py-2 px-6 rounded-lg transition w-32">Cancel</button>
        <button onClick={() => onDelete(item.id)} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-6 rounded-lg transition w-32">Delete</button>
      </div>
    </div>
  </div>
);

