import hero from "../assets/hero.jpg";
import "./Home.css";

export default function Home() {
  return (
    <div className="home">
      <div className="hero" style={{ backgroundImage: `url(${hero})` }}>
        <div className="hero-overlay">
          <h1>#Dekadence</h1>
          <h2>Voda 2026 · 10. ročník</h2>
          <p>Vltava nás volá. Jsi připraven?</p>
          <a href="/events" className="hero-btn">Zobraz akce 🛶</a>
        </div>
      </div>
    </div>
  );
}