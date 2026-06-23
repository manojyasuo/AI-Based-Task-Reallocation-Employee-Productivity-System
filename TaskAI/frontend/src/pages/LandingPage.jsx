import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  // ✅ YOUR IMAGES
  const images = [
    '/images/backimage.png',
    '/images/corp.png',
    'images/backim.png',
    '/images/dash.png',
    '/images/work.png',
    '/images/ai.png'
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // 🔥 AUTO CHANGE BACKGROUND
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="landing-container"
      style={{
        backgroundImage: `url(${images[currentIndex]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1s ease-in-out'
      }}
    >

      {/* 🔥 TASKAI TOP LEFT */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 30,
        zIndex: 10
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: 800,
          background: 'linear-gradient(90deg, #f59e0b, #22c55e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          TaskAI
        </h2>
      </div>

      {/* HERO SECTION */}
      <main
        className="hero-section"
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
      >

        {/* TITLE */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{
            fontSize: '4rem',
            fontWeight: 800,
            color: '#fff',
            marginBottom: '15px'
          }}
        >
          Welcome to TaskAI
        </motion.h1>

        {/* TAGLINE */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: '1.5rem',
            color: '#fff',
            maxWidth: '700px',
            marginBottom: '30px',
            fontWeight: 600
          }}
        >
          AI-Based Task Reallocation & 
          <span style={{ color: '#22c55e' }}> Employee Productivity</span> System
        </motion.p>

        {/* LOGIN BUTTON */}
       <button
  className="login-btn multi-color-btn"
  onClick={() => navigate('/login')}
>
  Login
</button>

      </main>
    </div>
  );
};

export default LandingPage;