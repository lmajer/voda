import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Admin.css";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [activeTab, setActiveTab] = useState("events");
  const [newEvent, setNewEvent] = useState({
    title: "", date: "", location: "", description: "", price: "", active: true
  });

useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const fetchEvents = async () => {
    const snapshot = await getDocs(collection(db, "events"));
    setEvents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const fetchRegistrations = async () => {
    const snapshot = await getDocs(collection(db, "registrations"));
    setRegistrations(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    if (user) {
      fetchEvents();
      fetchRegistrations();
    }
  }, [user]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError("");
    } catch {
      setError("Špatný email nebo heslo.");
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "events"), {
      ...newEvent,
      price: Number(newEvent.price),
      active: true,
    });
    setNewEvent({ title: "", date: "", location: "", description: "", price: "", active: true });
    fetchEvents();
  };

  const handleDeleteEvent = async (id) => {
    if (confirm("Opravdu smazat tuto akci?")) {
      await deleteDoc(doc(db, "events", id));
      fetchEvents();
    }
  };

  if (!user) {
    return (
      <div className="admin-login">
        <div className="admin-login-box">
          <h1>🏴‍☠️ Admin</h1>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="Email" value={email}
              onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Heslo" value={password}
              onChange={e => setPassword(e.target.value)} required />
            {error && <p className="admin-error">{error}</p>}
            <button type="submit">Přihlásit se</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin">
      <div className="admin-header">
        <h1>🏴‍☠️ Admin panel</h1>
        <button className="admin-logout" onClick={() => signOut(auth)}>Odhlásit se</button>
      </div>

      <div className="admin-tabs">
        <button className={activeTab === "events" ? "active" : ""} onClick={() => setActiveTab("events")}>Akce</button>
        <button className={activeTab === "registrations" ? "active" : ""} onClick={() => setActiveTab("registrations")}>Přihlášení</button>
        <button className={activeTab === "add" ? "active" : ""} onClick={() => setActiveTab("add")}>+ Přidat akci</button>
      </div>

      {activeTab === "events" && (
        <div className="admin-section">
          <h2>Všechny akce</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Název</th>
                <th>Datum</th>
                <th>Místo</th>
                <th>Cena</th>
                <th>Aktivní</th>
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.id}>
                  <td>{event.title}</td>
                  <td>{event.date}</td>
                  <td>{event.location}</td>
                  <td>{event.price} Kč</td>
                  <td>{event.active ? "✅" : "❌"}</td>
                  <td>
                    <button className="btn-delete" onClick={() => handleDeleteEvent(event.id)}>Smazat</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "registrations" && (
        <div className="admin-section">
          <h2>Přihlášení na akce</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Jméno</th>
                <th>Email</th>
                <th>Akce</th>
                <th>Zaplaceno</th>
                <th>Datum přihlášení</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map(reg => (
                <tr key={reg.id}>
                  <td>{reg.name}</td>
                  <td>{reg.email}</td>
                  <td>{reg.eventTitle}</td>
                  <td>{reg.paid ? "✅" : "❌"}</td>
                  <td>{reg.createdAt?.toDate?.()?.toLocaleDateString("cs-CZ") ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "add" && (
        <div className="admin-section">
          <h2>Přidat novou akci</h2>
          <form className="admin-form" onSubmit={handleAddEvent}>
            <input placeholder="Název akce" value={newEvent.title}
              onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} required />
            <input type="date" value={newEvent.date}
              onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} required />
            <input placeholder="Místo" value={newEvent.location}
              onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} required />
            <textarea placeholder="Popis" value={newEvent.description}
              onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} required />
            <input type="number" placeholder="Cena (Kč)" value={newEvent.price}
              onChange={e => setNewEvent({ ...newEvent, price: e.target.value })} required />
            <button type="submit">Přidat akci 🛶</button>
          </form>
        </div>
      )}
    </div>
  );
}