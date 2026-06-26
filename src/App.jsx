import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home.jsx";
import Events from "./pages/Events";
import PastEvents from "./pages/PastEvents";
import Admin from "./pages/Admin";
import WaterSignup from "./pages/WaterSignup";
import WaterDetail from "./pages/WaterDetail";
import Tents from "./pages/Tents";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/past-events" element={<PastEvents />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/voda-sign-up" element={<WaterSignup />} />
        <Route path="/voda-detail" element={<WaterDetail />} />
        <Route path="/tents" element={<Tents />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;