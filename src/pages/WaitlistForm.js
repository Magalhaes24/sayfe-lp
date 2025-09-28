import React, { useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import "./WaitlistForm.css";

function WaitlistForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    city: "",
    allergy: "",
    diningFrequency: "1-4",
  });

  const [status, setStatus] = useState({ message: "", type: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: "Submitting...", type: "" });

    try {
      await addDoc(collection(db, "waitlist"), {
        ...formData,
        age: Number(formData.age),
        createdAt: new Date(),
      });
      setStatus({
        message: "✅ Thank you! You're now on the waitlist.",
        type: "success",
      });
      setFormData({
        name: "",
        email: "",
        age: "",
        city: "",
        allergy: "",
        diningFrequency: "1-4",
      });
    } catch (error) {
      console.error(error);
      setStatus({
        message: "❌ Error submitting. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <div className="App">
      {/* ✅ Navbar (same as Home) */}
      <nav className="navbar">
        <h1 className="logo">SaYfe</h1>
        <Link to="/contact" className="nav-btn">Contact</Link> 
      </nav>

      {/* ✅ Form Section */}
      <div className="form-container">
        <h2>Join Our Waitlist</h2>
        <p className="form-description">
          Fill in your details and be the first to experience SaYfe.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label>Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
          />

          <label>City</label>
          <input
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
          />

          <label>Allergy</label>
          <input
            name="allergy"
            value={formData.allergy}
            onChange={handleChange}
            required
          />

          <label>Dining Out per Month</label>
          <select
            name="diningFrequency"
            value={formData.diningFrequency}
            onChange={handleChange}
          >
            <option value="1-4">1-4</option>
            <option value="5-8">5-8</option>
            <option value="8-12">8-12</option>
            <option value="12+">12+</option>
          </select>

          <button type="submit">Join Now</button>
        </form>

        {/* ✅ Back Button */}
        <Link to="/" className="back-btn">
          ← Back to Home
        </Link>

        {/* ✅ Status Message */}
        {status.message && (
          <p
            className={`status-message ${
              status.type === "success" ? "status-success" : "status-error"
            }`}
          >
            {status.message}
          </p>
        )}
      </div>

      {/* ✅ Footer (same as Home) */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} SaYfe — All rights reserved.</p>
      </footer>
    </div>
  );
}

export default WaitlistForm;
