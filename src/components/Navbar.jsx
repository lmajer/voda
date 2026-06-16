import { Link } from "react-router-dom";
import logo from "../assets/logo.jpg";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src={logo} alt="Logo" />
        <span>#Dekadence – Voda 2026</span>
      </div>
      <div className="navbar-links">
        <Link to="/">Domů</Link>
        <Link to="/events">Akce</Link>
        <Link to="/gallery">Galerie</Link>
      </div>
    </nav>
  );
}