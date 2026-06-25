import { useState } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import emailjs from "@emailjs/browser";
import "./WaterSignup.css";

export default function WaterSignup() {
  const [form, setForm] = useState({
    email: "",
    shirtName: "",
    shirtSize: "",
    tent: "",
    student: "ne",
    shirtCut: "pánský",
    duration: "celá",
    durationSpecification: "",
    transport: "vlak",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const emailLower = form.email.trim().toLowerCase();

      const q = query(collection(db, "waterSignups"), where("email", "==", emailLower));
      const existing = await getDocs(q);

      if (!existing.empty) {
        setError("Tento email je už na Vodu přihlášený. Pokud potřebuješ něco změnit, napiš nám.");
        return;
      }

      await addDoc(collection(db, "waterSignups"), {
        ...form,
        email: emailLower,
        paid: false,
        createdAt: new Date(),
      });

      setSubmitted(true);

      const qrUrl = `${window.location.origin}/qr-platba.png`;
      emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          to_email: emailLower,
          shirt_name: form.shirtName,
          qr_code_url: qrUrl,
        },
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      ).catch(err => console.error("Email se nepodařilo odeslat:", err));

    } catch (err) {
      console.error(err);
      setError("Něco se nepovedlo, zkus to znovu.");
    }
  };

  if (submitted) {
    return (
      <div className="water-signup">
        <div className="water-success">
          <h1>🛶 Jsi přihlášen/a!</h1>
          <p>Těšíme se na tebe na Vodě 2026.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="water-signup">
      <h1>Přihlášení na Vodu 2026</h1>
      <p className="water-subtitle">#Dekadence · 10. ročník</p>

      <form className="water-form" onSubmit={handleSubmit}>
        <label>
          Tvůj email
          <input
            type="email"
            value={form.email}
            onChange={e => handleChange("email", e.target.value)}
            required
          />
        </label>
        <label>
          Jméno na tričku
          <input
            type="text"
            value={form.shirtName}
            onChange={e => handleChange("shirtName", e.target.value)}
            required
          />
        </label>
        <label>
          Velikost trika
          <select
            value={form.shirtSize}
            onChange={e => handleChange("shirtSize", e.target.value)}
            required
          >
            <option value="">Vyber velikost</option>
            <option value="XS">XS</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
            <option value="XXL">XXL</option>
          </select>
        </label>
        <label>Jsem student do 26 let a mám platný studentký průkaz</label>
        <div className="water-radio-group">
          <label className="water-radio">
            <input
              type="radio"
              name="student"
              value="ano"
              checked={form.student === "ano"}
              onChange={e => handleChange("student", e.target.value)}
            />
            Ano
          </label>
          <label className="water-radio">
            <input
              type="radio"
              name="student"
              value="ne"
              checked={form.student === "ne"}
              onChange={e => handleChange("student", e.target.value)}
            />
            Ne
          </label>
        </div>
        <label>Střih trika</label>
        <div className="water-radio-group">
          <label className="water-radio">
            <input
              type="radio"
              name="shirtCut"
              value="pánský"
              checked={form.shirtCut === "pánský"}
              onChange={e => handleChange("shirtCut", e.target.value)}
            />
            Pánský
          </label>
          <label className="water-radio">
            <input
              type="radio"
              name="shirtCut"
              value="dámský"
              checked={form.shirtCut === "dámský"}
              onChange={e => handleChange("shirtCut", e.target.value)}
            />
            Dámský
          </label>
        </div>


        <label>Délka pobytu</label>
        <div className="water-radio-group">
          <label className="water-radio">
            <input
              type="radio"
              name="duration"
              value="celá"
              checked={form.duration === "celá"}
              onChange={e => handleChange("duration", e.target.value)}
            />
            Jedu na celou dobu
          </label>
          <label className="water-radio">
            <input
              type="radio"
              name="duration"
              value="část"
              checked={form.duration === "část"}
              onChange={e => handleChange("duration", e.target.value)}
            />
            Jedu jen na část
          </label>
        </div>
        

        {form.duration === "část" && (
          <div className="water-duration-range">
            <label>
              Specifikuj jak pojedeš
              <input
                type="text"
                placeholder="Např. pouze 1. a 2. den"
                value={form.durationSpecification}
                onChange={e => handleChange("durationSpecification", e.target.value)}
                required
              />
            </label>
          </div>
        )}

        <label>Doprava</label>
        <div className="water-radio-group">
          <label className="water-radio">
            <input
              type="radio"
              name="transport"
              value="vlak"
              checked={form.transport === "vlak"}
              onChange={e => handleChange("transport", e.target.value)}
            />
            Jedu se všemi vlakem tam i zpět
          </label>
          <label className="water-radio">
            <input
              type="radio"
              name="transport"
              value="vlakZpet"
              checked={form.transport === "vlakZpet"}
              onChange={e => handleChange("transport", e.target.value)}
            />
            Jedu se všemi vlakem jen zpět
          </label>
          <label className="water-radio">
            <input
              type="radio"
              name="transport"
              value="vlakTam"
              checked={form.transport === "vlakTam"}
              onChange={e => handleChange("transport", e.target.value)}
            />
            Jedu se všemi vlakem jen tam
          </label>
          <label className="water-radio">
            <input
              type="radio"
              name="transport"
              value="vlastní"
              checked={form.transport === "vlastní"}
              onChange={e => handleChange("transport", e.target.value)}
            />
            Mám vlastní dopravu
          </label>
        </div>

        {error && <p className="water-error">{error}</p>}

        <button type="submit">Přihlásit se na Vodu 🛶</button>
      </form>
    </div>
  );
}