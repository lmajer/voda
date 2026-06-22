import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import "./PastEvents.css";

export default function PastEvents() {
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const snapshot = await getDocs(collection(db, "pastEvents"));
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => b.year - a.year);
      setPastEvents(data);
      setLoading(false);
    };
    fetch();
  }, []);

  const getYouTubeId = (url) => {
    const match = url.match(/(?:youtu\.be\/|v=)([^&?\s]+)/);
    return match ? match[1] : null;
  };

  if (loading) return <div className="past-loading">Načítám... 🛶</div>;

  return (
    <div className="past">
      <h1>Minulé vody</h1>
      {pastEvents.length === 0 && (
        <p className="past-empty">Zatím žádné záznamy. 🏴‍☠️</p>
      )}
      <div className="past-list">
        {pastEvents.map(event => (
          <div key={event.id} className="past-card">
            <div className="past-card-info">
              <span className="past-year">{event.year}</span>
              <h2>{event.title}</h2>
              <p>{event.description}</p>
            </div>
            {event.youtubeUrl && getYouTubeId(event.youtubeUrl) ? (
              <div className="past-video">
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(event.youtubeUrl)}`}
                  title={event.title}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            ) : event.photoUrl ? (
              <div className="past-video">
                <img src={event.photoUrl} alt={event.title} className="past-photo" />
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}