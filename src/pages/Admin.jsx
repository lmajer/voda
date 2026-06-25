import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./Admin.css";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [waterSignups, setWaterSignups] = useState([]);

  const [activeTab, setActiveTab] = useState("events");

  const [editingPast, setEditingPast] = useState(null);

  const [newEvent, setNewEvent] = useState({
    title: "", date: "", location: "", description: "", price: "", active: true
  });

  const [newPast, setNewPast] = useState({
    year: "", title: "", description: "", youtubeUrl: "", photoUrl: ""
  });
  const [uploadingPastPhoto, setUploadingPastPhoto] = useState(false);

  const [waterInfo, setWaterInfo] = useState({
    title: "", dateFrom: "", dateTo: "", location: "", description: "", price: "", logoUrl: ""
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);

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

  const fetchPastEvents = async () => {
    const snapshot = await getDocs(collection(db, "pastEvents"));
    setPastEvents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const fetchWaterSignups = async () => {
    const snapshot = await getDocs(collection(db, "waterSignups"));
    setWaterSignups(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const fetchWaterInfo = async () => {
  const snapshot = await getDoc(doc(db, "waterEventInfo", "current"));
  if (snapshot.exists()) setWaterInfo(snapshot.data());
};

  const handleSaveWaterInfo = async (e) => {
    e.preventDefault();
    await setDoc(doc(db, "waterEventInfo", "current"), {
      ...waterInfo,
      price: Number(waterInfo.price),
    });
    alert("Uloženo!");
  };

  const handleDeleteWaterSignup = async (id) => {
    if (confirm("Opravdu smazat tuto přihlášku na Vodu?")) {
      await deleteDoc(doc(db, "waterSignups", id));
      fetchWaterSignups();
    }
  };
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      setWaterInfo(prev => ({ ...prev, logoUrl: data.secure_url }));
    } catch (err) {
      console.error("Upload selhal:", err);
      alert("Nahrání loga se nepodařilo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const updateRank = async (id, rank) => {
    setWaterSignups(prev =>
      prev.map(s => (s.id === id ? { ...s, rank } : s))
    );
    await updateDoc(doc(db, "waterSignups", id), { rank });
  };

  const handlePastPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPastPhoto(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      setNewPast(prev => ({ ...prev, photoUrl: data.secure_url }));
    } catch (err) {
      console.error("Upload selhal:", err);
      alert("Nahrání fotky se nepodařilo.");
    } finally {
      setUploadingPastPhoto(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchEvents();
      fetchRegistrations();
      fetchPastEvents();
      fetchWaterSignups();
      fetchWaterInfo();
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

  const handleSubmitPast = async (e) => {
    e.preventDefault();
    if (editingPast) {
      await updateDoc(doc(db, "pastEvents", editingPast), {
        ...newPast,
        year: Number(newPast.year),
      });
      setEditingPast(null);
    } else {
      await addDoc(collection(db, "pastEvents"), {
        ...newPast,
        year: Number(newPast.year),
      });
    }
    setNewPast({ year: "", title: "", description: "", youtubeUrl: "", photoUrl: "" });
    fetchPastEvents();
    setActiveTab("past");
  };

  const handleEditPast = (p) => {
    setNewPast({
      year: p.year,
      title: p.title,
      description: p.description,
      youtubeUrl: p.youtubeUrl || "",
      photoUrl: p.photoUrl || "",
    });
    setEditingPast(p.id);
    setActiveTab("addPast");
  };

  const handleCancelEditPast = () => {
    setEditingPast(null);
    setNewPast({ year: "", title: "", description: "", youtubeUrl: "", photoUrl: "" });
  };

  const handleDeletePast = async (id) => {
    if (confirm("Opravdu smazat tento záznam?")) {
      await deleteDoc(doc(db, "pastEvents", id));
      fetchPastEvents();
    }
  };

  const togglePaid = async (id, currentStatus) => {
    setWaterSignups(prev =>
      prev.map(s => (s.id === id ? { ...s, paid: !currentStatus } : s))
    );
    await updateDoc(doc(db, "waterSignups", id), { paid: !currentStatus });
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
        <button className={activeTab === "registrations" ? "active" : ""} onClick={() => setActiveTab("registrations")}>Přihlášení na akce</button>
        <button className={activeTab === "addEvent" ? "active" : ""} onClick={() => setActiveTab("addEvent")}>+ Přidat akci</button>
        <button className={activeTab === "past" ? "active" : ""} onClick={() => setActiveTab("past")}>Minulé vody</button>
        <button className={activeTab === "addPast" ? "active" : ""} onClick={() => setActiveTab("addPast")}>+ Přidat minulou vodu</button>
        <button className={activeTab === "water" ? "active" : ""} onClick={() => setActiveTab("water")}>Přihlášení na Vodu 2026</button>
        <button className={activeTab === "waterInfo" ? "active" : ""} onClick={() => setActiveTab("waterInfo")}>Info o Vodě</button>
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

      {activeTab === "addEvent" && (
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

      {activeTab === "past" && (
        <div className="admin-section">
          <h2>Minulé vody</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Rok</th>
                <th>Název</th>
                <th>Popis</th>
                <th>YouTube</th>
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {pastEvents.map(p => (
                <tr key={p.id}>
                  <td>{p.year}</td>
                  <td>{p.title}</td>
                  <td>{p.description}</td>
                  <td><a href={p.youtubeUrl} target="_blank" rel="noreferrer">Video</a></td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEditPast(p)}>Upravit</button>
                    <button className="btn-delete" onClick={() => handleDeletePast(p.id)}>Smazat</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "addPast" && (
        <div className="admin-section">
          <h2>{editingPast ? "Upravit vodu" : "Přidat minulou vodu"}</h2>
          <form className="admin-form" onSubmit={handleSubmitPast}>
            <label className="admin-form-label">
              Rok
            </label>
            <input placeholder="Rok (např. 2024)" type="number" value={newPast.year}
              onChange={e => setNewPast({ ...newPast, year: e.target.value })} required />
            <label className="admin-form-label">
              Název
            </label>
            <input placeholder="Název (např. #Symfonie – Voda 2024)" value={newPast.title}
              onChange={e => setNewPast({ ...newPast, title: e.target.value })} required />
            <label className="admin-form-label">
              Popis
            </label>
            <textarea placeholder="Popis" value={newPast.description}
              onChange={e => setNewPast({ ...newPast, description: e.target.value })} required />
            <label className="admin-form-label">
              YouTube URL (pokud existuje)
            </label>
            <input placeholder="YouTube URL (nepovinné)" value={newPast.youtubeUrl}
              onChange={e => setNewPast({ ...newPast, youtubeUrl: e.target.value })} />

            <label className="admin-form-label">
              Nebo nahraj fotku (pokud video neexistuje)
              <input type="file" accept="image/*" onChange={handlePastPhotoUpload} />
            </label>
            {uploadingPastPhoto && <p>Nahrávám fotku...</p>}
            {newPast.photoUrl && (
              <img src={newPast.photoUrl} alt="Náhled" className="admin-logo-preview" />
            )}

            <div className="admin-form-buttons">
              <button type="submit">{editingPast ? "Uložit změny ✏️" : "Přidat 🎬"}</button>
              {editingPast && (
                <button type="button" className="btn-cancel" onClick={handleCancelEditPast}>
                  Zrušit úpravu
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {activeTab === "water" && (
        <div className="admin-section">
          <h2>Přihlášení na Vodu 2026 ({waterSignups.length})</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Hodnost</th>
                <th>Jméno na tričku</th>
                <th>Email</th>
                <th>Velikost</th>
                <th>Student</th>
                <th>Střih</th>
                <th>Délka pobytu</th>
                <th>Doprava</th>
                <th>Zaplaceno</th>
                <th>Akce</th>
              </tr>
            </thead>
            <tbody>
              {waterSignups.map(s => (
                <tr key={s.id}>
                  <td>
                    <select
                      className="admin-rank-select"
                      value={s.rank || ""}
                      onChange={e => updateRank(s.id, e.target.value)}
                    >
                      <option value="">—</option>
                      <option value="Plavčík">Plavčík</option>
                      <option value="Plavčice">Plavčice</option>
                      <option value="Kadet">Kadet</option>
                      <option value="Kadetka">Kadetka</option>
                      <option value="Důstojník">Důstojník</option>
                      <option value="Důstojnice">Důstojnice</option>
                      <option value="Kapitán">Kapitán</option>
                      <option value="Kapitánka">Kapitánka</option>
                      <option value="Komodor">Komodor</option>
                      <option value="Komodorka">Komodorka</option>
                      <option value="Admirál">Admirál</option>
                      <option value="Admirálka">Admirálka</option>
                    </select>
                  </td>
                  <td>{s.shirtName}</td>
                  <td>{s.email}</td>
                  <td>{s.shirtSize}</td>
                  <td>{s.shirtCut}</td>
                  <td>{s.student === "ano" ? "Ano" : "Ne"}</td>
                  <td>
                    {s.duration === "celá"
                      ? "Celá doba"
                      : `${s.durationSpecification || "Specifikuj délku"}`}
                  </td>
                  <td>{s.transport === "vlak" ? "Vlak se všemi" : "Vlastní"}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={s.paid || false}
                      onChange={() => togglePaid(s.id, s.paid)}
                    />
                  </td>
                  <td>
                    <button className="btn-delete" onClick={() => handleDeleteWaterSignup(s.id)}>Smazat</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "waterInfo" && (
        <div className="admin-section">
          <h2>Upravit informace o Vodě</h2>
          <form className="admin-form" onSubmit={handleSaveWaterInfo}>
            <input placeholder="Název (např. #Dekadence – Voda 2026)" value={waterInfo.title}
              onChange={e => setWaterInfo({ ...waterInfo, title: e.target.value })} required />
            <div className="admin-date-range">
              <label className="admin-form-label">
                Od
                <input type="date" value={waterInfo.dateFrom}
                  onChange={e => setWaterInfo({ ...waterInfo, dateFrom: e.target.value })} required />
              </label>
              <label className="admin-form-label">
                Do
                <input type="date" value={waterInfo.dateTo}
                  onChange={e => setWaterInfo({ ...waterInfo, dateTo: e.target.value })} required />
              </label>
            </div>
            <label className="admin-form-label">
                Místo
            <input placeholder="Místo" value={waterInfo.location}
              onChange={e => setWaterInfo({ ...waterInfo, location: e.target.value })} required />
              </label>
              <label className="admin-form-label">
                Popis
            <textarea placeholder="Popis" value={waterInfo.description}
              onChange={e => setWaterInfo({ ...waterInfo, description: e.target.value })} required />
              </label>
            <label className="admin-form-label">
                Cena (Kč)
            <input type="number" placeholder="Cena (Kč)" value={waterInfo.price}
              onChange={e => setWaterInfo({ ...waterInfo, price: e.target.value })} required />
              </label>
            <label className="admin-form-label">
                Logo
                <input type="file" accept="image/*" onChange={handleLogoUpload} />
              </label>
              {uploadingLogo && <p>Nahrávám logo...</p>}
              {waterInfo.logoUrl && (
                <img src={waterInfo.logoUrl} alt="Náhled loga" className="admin-logo-preview" />
              )}
            <button type="submit">Uložit 🛶</button>
          </form>
        </div>
      )}
    </div>
  );
}