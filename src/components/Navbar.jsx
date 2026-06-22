import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import defaultLogo from "../assets/logo.jpg";
import "./Navbar.css";

export default function Navbar() {
  const [title, setTitle] = useState("#Dekadence – Voda 2026");
  const [logoUrl, setLogoUrl] = useState(defaultLogo);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      const snapshot = await getDoc(doc(db, "waterEventInfo", "current"));
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.title) setTitle(data.title);
        if (data.logoUrl) setLogoUrl(data.logoUrl);
      }
    };
    fetchInfo();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logoUrl} alt="Logo" />
        <span>{title}</span>
      </div>

      <button
        className="navbar-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
      >
        ☰
      </button>

      <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <Link to="/" onClick={closeMenu}>Domů</Link>
        <Link to="/events" onClick={closeMenu}>Akce</Link>
        <Link to="/past-events" onClick={closeMenu}>Minulé vody</Link>
        <Link to="/voda-sign-up" onClick={closeMenu}>Přihlášení na vodu</Link>
      </div>
    </nav>
  );
}