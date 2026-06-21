import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home.jsx";
import Events from "./pages/Events";
import PastEvents from "./pages/PastEvents";
import Admin from "./pages/Admin";
import WaterSignup from "./pages/WaterSignup";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/past-events" element={<PastEvents />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/voda-prihlaseni" element={<WaterSignup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;