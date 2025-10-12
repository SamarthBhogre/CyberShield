import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, User, Mail, Phone, Lock } from 'lucide-react';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMsg("Passwords do not match.");
      setMsgType("error");
      return;
    }
    setMsg("");
    setMsgType("");
    try {
      const res = await axios.post("http://localhost:5000/api/register", { username, email, phone, password });
      setMsg(res.data.message || "Registration successful! Please log in.");
      setMsgType("success");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setMsg(err.response?.data?.error || "Registration failed. Please try again.");
      setMsgType("error");
    }
  };

  return (
    <div className="text-white">
        <div className="text-center mb-8">
            <ShieldCheck className="mx-auto h-12 w-12 text-cyan-400" />
            <h2 className="text-3xl font-bold text-cyan-400 mt-4">Create Your Account</h2>
            <p className="text-gray-400">Join us to protect your digital life.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            {msg && (
                <p className={`text-center p-3 rounded-lg ${msgType === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {msg}
                </p>
            )}
            <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required className="w-full bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-700 rounded-lg p-3 pl-12 focus:outline-none focus:border-cyan-500 transition-all duration-300" />
            </div>
            <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-700 rounded-lg p-3 pl-12 focus:outline-none focus:border-cyan-500 transition-all duration-300" />
            </div>
            <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-700 rounded-lg p-3 pl-12 focus:outline-none focus:border-cyan-500 transition-all duration-300" />
            </div>
            <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-700 rounded-lg p-3 pl-12 focus:outline-none focus:border-cyan-500 transition-all duration-300" />
            </div>
            <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-700 rounded-lg p-3 pl-12 focus:outline-none focus:border-cyan-500 transition-all duration-300" />
            </div>
            <button type="submit" className="w-full bg-cyan-500 text-gray-900 font-bold p-3 rounded-lg hover:bg-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/20">
                Register
            </button>
        </form>
        <div className="text-center mt-6">
            <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-cyan-400 hover:underline">
                    Login here
                </Link>
            </p>
        </div>
    </div>
  );
}

