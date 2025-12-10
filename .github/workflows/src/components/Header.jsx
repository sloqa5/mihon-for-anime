import React, { useState, useEffect } from "react";

function Header() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('videoStreamTheme');
    if (savedTheme) {
      setIsDarkTheme(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    document.body.className = isDarkTheme ? 'theme-dark' : 'theme-light';
    localStorage.setItem('videoStreamTheme', isDarkTheme ? 'dark' : 'light');
  }, [isDarkTheme]);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <header className="header">
      <div className="header-left">
        <span className="brand-logo">VS</span>
        <h1 className="brand-title">Video Stream</h1>
      </div>
      <div className="header-right">
        <span className="header-tagline">
          Local files | Streaming URLs | Video metadata
        </span>
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={isDarkTheme ? "Switch to light theme" : "Switch to dark theme"}
        >
          {isDarkTheme ? "☀️" : "🌙"}
        </button>
      </div>
    </header>
  );
}

export default Header;
