import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import HomePage from "./HomePage";
import AuthLayout from "./AuthLayout";
import PasswordChecker from './PasswordChecker';
import URLChecker from './URLChecker';
import PhishingDetector from './PhishingDetector';
import NewsDetector from './NewsDetector'; // 1. Import the new component

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />
        </Route>
        <Route path="/home" element={<HomePage />} />
        <Route path="/password-checker" element={<PasswordChecker />} />
        <Route path="/url-checker" element={<URLChecker />} />
        <Route path="/phishing-detector" element={<PhishingDetector />} />
        <Route path="/news-detector" element={<NewsDetector />} /> {/* 2. Add the new route */}
      </Routes>
    </Router>
  );
}

export default App;
