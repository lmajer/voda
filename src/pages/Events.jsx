import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import "./Events.css";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: "", email: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      const snapshot = await getDocs(collection(db, "events"));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(data.filter(e => e.active));
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "registrations"), {
        name: form.name,
        email: form.email,
        eventId: selected.id,
        eventTitle: selected.title,
        createdAt: new Date(),
        paid: false,
      });
      setSubmitted(true);
      setForm({ name: "", email: "" });
    } catch (error) {
      console.error("Chyba při přihlašování:", error);
    }
  };

  if (loading) return <div className="events-loading">Načítám akce... 🛶</div>;

  return (
    <div className="events">
      <h1>Nadcházející akce</h1>

      <div className="event-card water-card" onClick={() => navigate("/voda-detail")}>
        <div className="event-card-header">
          <h2>🛶 Voda 2026 · #Dekadence</h2>
        </div>
        <p className="event-description">Hlavní akce roku! Klikni pro detail a přihlášení.</p>
      </div>

      <div className="events-grid">
        {events.map(event => (
          <div key={event.id} className="event-card">
            <div className="event-card-header">
              <h2>{event.title}</h2>
              <span className="event-price">{event.price} Kč</span>
            </div>
            <p className="event-date">📅 {event.date}</p>
            <p className="event-location">📍 {event.location}</p>
            <p className="event-description">{event.description}</p>
            <button className="event-btn" onClick={() => { setSelected(event); setSubmitted(false); }}>
              Přihlásit se
            </button>
          </div>
        ))}
      </div>

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            <h2>Přihlášení na: {selected.title}</h2>

            {!submitted ? (
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Tvoje jméno"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
                <input
                  type="email"
                  placeholder="Tvůj email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
                <button type="submit">Přihlásit se 🛶</button>
              </form>
            ) : (
              <div className="success">
                <p>✅ Jsi přihlášen/a!</p>
                <p>Platba bude upřesněna.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}