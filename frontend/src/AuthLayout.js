import React from "react";
import { NavLink, Outlet } from "react-router-dom";

export default function AuthLayout() {
  const activeLinkStyle = 'bg-cyan-500 text-gray-900';
  const inactiveLinkStyle = 'bg-transparent text-cyan-400 hover:bg-gray-700';

  return (
    <div 
      className="min-h-screen flex items-center justify-center font-sans p-4" 
      style={{ background: "radial-gradient(ellipse at top, #1e293b, #0f172a)" }}
    >
      <div className="w-full max-w-md">
        <div className="bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-cyan-500/20">
          <nav className="flex">
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `w-1/2 p-4 text-lg font-bold text-center transition-all duration-300 ${isActive ? activeLinkStyle : inactiveLinkStyle}`
              }
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `w-1/2 p-4 text-lg font-bold text-center transition-all duration-300 ${isActive ? activeLinkStyle : inactiveLinkStyle}`
              }
            >
              Register
            </NavLink>
          </nav>
          <div className="p-8">
            <Outlet />
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-6">
          &copy; 2025 CyberShield Security. All rights reserved.
        </p>
      </div>
    </div>
  );
}

