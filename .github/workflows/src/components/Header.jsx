import React from "react";

function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <span className="brand-logo">ML</span>
        <h1 className="brand-title">MyAnime Library</h1>
      </div>
      <div className="header-right">
        <span className="header-tagline">
          Local files | Streaming URLs | AniList metadata
        </span>
      </div>
    </header>
  );
}

export default Header;
