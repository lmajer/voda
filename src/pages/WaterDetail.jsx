import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import "./WaterDetail.css";

export default function WaterDetail() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const snapshot = await getDoc(doc(db, "waterEventInfo", "current"));
      if (snapshot.exists()) setInfo(snapshot.data());
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="water-detail-loading">Načítám... 🛶</div>;
  if (!info) return <div className="water-detail-loading">Info o Vodě zatím není vyplněné.</div>;

  function formatDateRange(from, to) {
    if (!from || !to) return "";
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const options = { day: "numeric", month: "long" };
    const fromStr = fromDate.toLocaleDateString("cs-CZ", options);
    const toStr = toDate.toLocaleDateString("cs-CZ", { ...options, year: "numeric" });
    return `${fromStr} – ${toStr}`;
  }

  return (
    <div className="water-detail">
      <h1>{info.title}</h1>
      <p className="water-detail-meta">📅 {formatDateRange(info.dateFrom, info.dateTo)} · 📍 {info.location}</p>
      <p className="water-detail-price">{info.price} Kč</p>
      <p className="water-detail-description" style={{ whiteSpace: "pre-line" }}>{info.description}</p>
      <button className="water-detail-btn" onClick={() => navigate("/voda-sign-up")}>
        Přihlásit se na Vodu 🛶
      </button>
    </div>
  );
}