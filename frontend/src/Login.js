import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, User, Lock } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState(""); // Can be username or email
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("");
  const auth = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setMsgType("");
    try {
      const res = await axios.post("http://localhost:5000/api/login", { identifier, password });
      setMsg(res.data.message);
      setMsgType("success");
      auth.login(res.data.username); // Use the username returned from the API
      setTimeout(() => {
        navigate("/home");
      }, 1000);
    } catch (err) {
      setMsg(err.response?.data?.error || "Login failed");
      setMsgType("error");
    }
  };

  return (
    <div className="text-white">
      <div className="text-center mb-8">
        <ShieldCheck className="mx-auto h-12 w-12 text-cyan-400" />
        <h2 className="text-3xl font-bold text-cyan-400 mt-4">Welcome Back</h2>
        <p className="text-gray-400">Sign in to access your dashboard.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {msg && (
          <p className={`text-center p-3 rounded-lg ${msgType === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {msg}
          </p>
        )}
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            placeholder="Username or Email"
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            required
            className="w-full bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-700 rounded-lg p-3 pl-12 focus:outline-none focus:border-cyan-500 transition-all duration-300"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full bg-gray-900 text-white placeholder-gray-500 border-2 border-gray-700 rounded-lg p-3 pl-12 focus:outline-none focus:border-cyan-500 transition-all duration-300"
          />
        </div>
        <div className="text-right">
            <a href="#" className="text-sm text-cyan-400 hover:underline">Forgot Password?</a>
        </div>
        <button
          type="submit"
          className="w-full bg-cyan-500 text-gray-900 font-bold p-3 rounded-lg hover:bg-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/20"
        >
          Login
        </button>
      </form>
       <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-cyan-400 hover:underline">
              Register here
            </Link>
          </p>
        </div>
    </div>
  );
}
