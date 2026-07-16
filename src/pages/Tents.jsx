import { useEffect, useState } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where } from "firebase/firestore";
import { db } from "../firebase";
import "./Tents.css";

export default function Tents() {
  const [verifiedEmail, setVerifiedEmail] = useState(
    sessionStorage.getItem("tentsVerifiedEmail") || null
  );
  const [checkEmail, setCheckEmail] = useState("");
  const [checkError, setCheckError] = useState("");
  const [checking, setChecking] = useState(false);

  const [tents, setTents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newTentName, setNewTentName] = useState("");
  const [newTentCapacity, setNewTentCapacity] = useState("");
  const [joinName, setJoinName] = useState({});
  const [joinNote, setJoinNote] = useState({});
  const [joinError, setJoinError] = useState({});

  const fetchTents = async () => {
    const snapshot = await getDocs(collection(db, "tents"));
    setTents(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => {
    if (verifiedEmail) fetchTents();
  }, [verifiedEmail]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setChecking(true);
    setCheckError("");

    const emailLower = checkEmail.trim().toLowerCase();
    const q = query(collection(db, "waterSignups"), where("email", "==", emailLower));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      setCheckError("Tento e-mail není přihlášený na Vodu 2026. Zkontroluj, jestli jsi se přihlásil/a.");
      setChecking(false);
      return;
    }

    sessionStorage.setItem("tentsVerifiedEmail", emailLower);
    setVerifiedEmail(emailLower);
    setChecking(false);
  };

  const handleCreateTent = async (e) => {
    e.preventDefault();
    if (!newTentName.trim() || !newTentCapacity) return;

    await addDoc(collection(db, "tents"), {
      name: newTentName.trim(),
      capacity: Number(newTentCapacity),
      people: [],
      createdBy: verifiedEmail,
    });
    setNewTentName("");
    setNewTentCapacity("");
    fetchTents();
  };

  const handleJoinTent = async (tentId) => {
    const name = joinName[tentId]?.trim();
    if (!name) return;

    const tent = tents.find(t => t.id === tentId);
    const currentCount = (tent.people || []).length;

    if (currentCount >= tent.capacity) {
      setJoinError(prev => ({ ...prev, [tentId]: "Tento stan je už plný." }));
      return;
    }

    const newPerson = {
      name,
      note: joinNote[tentId]?.trim() || "",
      email: verifiedEmail,
    };

    const updatedPeople = [...(tent.people || []), newPerson];
    await updateDoc(doc(db, "tents", tentId), { people: updatedPeople });

    setJoinName(prev => ({ ...prev, [tentId]: "" }));
    setJoinNote(prev => ({ ...prev, [tentId]: "" }));
    setJoinError(prev => ({ ...prev, [tentId]: "" }));
    fetchTents();
  };

  const handleRemovePerson = async (tentId, personIndex) => {
    const tent = tents.find(t => t.id === tentId);
    const updatedPeople = tent.people.filter((_, i) => i !== personIndex);
    await updateDoc(doc(db, "tents", tentId), { people: updatedPeople });
    fetchTents();
  };

  const handleDeleteTent = async (tentId) => {
    if (confirm("Opravdu smazat celý stan?")) {
      await deleteDoc(doc(db, "tents", tentId));
      fetchTents();
    }
  };

  if (!verifiedEmail) {
    return (
      <div className="tents-verify">
        <div className="tents-verify-box">
          <h1>⛺ Stany</h1>
          <p>Zadej e-mail, kterým ses přihlásil/a na Vodu 2026.</p>
          <form onSubmit={handleVerify}>
            <input
              type="email"
              placeholder="Tvůj e-mail"
              value={checkEmail}
              onChange={e => setCheckEmail(e.target.value)}
              required
            />
            {checkError && <p className="tents-error">{checkError}</p>}
            <button type="submit" disabled={checking}>
              {checking ? "Ověřuji..." : "Pokračovat"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) return <div className="tents-loading">Načítám stany... ⛺</div>;

  return (
    <div className="tents">
      <h1>⛺ Stany</h1>
      <div className="tents-subtitle">
        <p>Jak to funguje:</p>
        <ul>
          <li>Pokud máš vlastní stan, vyplň tam kapacitu včetně sebe (pokud tam chceš být sám, vyplň do kapacity číslo 1).</li>
          <li>Pokud nemáš vlastní stan a vidíš volné místo v některém stanu, nejdřív se domluv s jeho majitelem, zda se tam můžeš napsat.</li>
        </ul>
      </div>

      <form className="tents-create-form" onSubmit={handleCreateTent}>
        <input
          type="text"
          placeholder="Název / označení nového stanu"
          value={newTentName}
          onChange={e => setNewTentName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Kapacita"
          min="1"
          value={newTentCapacity}
          onChange={e => setNewTentCapacity(e.target.value)}
          required
        />
        <button type="submit">+ Vytvořit stan</button>
      </form>

      <div className="tents-list">
        {tents.map(tent => {
          const count = (tent.people || []).length;
          const isFull = count >= tent.capacity;

          return (
            <div key={tent.id} className="tent-card">
              <div className="tent-card-header">
                <h2>
                  {tent.name}{" "}
                  <span className="tent-capacity">
                    ({count}/{tent.capacity}){isFull && " 🔒 plný"}
                  </span>
                </h2>
                {tent.createdBy === verifiedEmail && (
                  <button className="btn-delete" onClick={() => handleDeleteTent(tent.id)}>
                    Smazat stan
                  </button>
                )}
              </div>

              <ul className="tent-people">
                {(tent.people || []).map((p, i) => (
                  <li key={i}>
                    <span className="tent-person-name">{p.name}</span>
                    {p.note && <span className="tent-person-note"> — {p.note}</span>}
                    {p.email === verifiedEmail && (
                      <button className="tent-remove-btn" onClick={() => handleRemovePerson(tent.id, i)}>
                        ✕
                      </button>
                    )}
                  </li>
                ))}
                {(!tent.people || tent.people.length === 0) && (
                  <li className="tent-empty">Zatím nikdo</li>
                )}
              </ul>

              {!isFull && (
                <div className="tent-join-form">
                  <input
                    type="text"
                    placeholder="Tvoje jméno"
                    value={joinName[tent.id] || ""}
                    onChange={e => setJoinName(prev => ({ ...prev, [tent.id]: e.target.value }))}
                  />
                  <input
                    type="text"
                    placeholder="Poznámka (nepovinné)"
                    value={joinNote[tent.id] || ""}
                    onChange={e => setJoinNote(prev => ({ ...prev, [tent.id]: e.target.value }))}
                  />
                  <button onClick={() => handleJoinTent(tent.id)}>Přidat se</button>
                </div>
              )}
              {joinError[tent.id] && <p className="tents-error">{joinError[tent.id]}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}