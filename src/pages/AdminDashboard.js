import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import CryptoJS from "crypto-js";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [waitlist, setWaitlist] = useState([]); // ✅ Added waitlist state
  const [loading, setLoading] = useState(true);
  const encryptionKey = process.env.REACT_APP_ENCRYPTION_KEY;

  // 🔐 Helper to decrypt safely
  const decryptField = (ciphertext) => {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8) || "(empty)";
    } catch (e) {
      console.error("Decryption error:", e);
      return "(decryption failed)";
    }
  };

  // ✅ Auth check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAdminAuthenticated");
    if (!isAuthenticated) navigate("/admin");
  }, [navigate]);

  // ✅ Fetch both contact and waitlist data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch contact messages
        const contactSnap = await getDocs(collection(db, "contactMessages"));
        const decryptedMessages = contactSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: decryptField(data.name),
            email: decryptField(data.email),
            message: decryptField(data.message),
            createdAt: data.createdAt?.toDate().toLocaleString() || "N/A",
          };
        });

        // Fetch waitlist
        const waitlistSnap = await getDocs(collection(db, "waitlist"));
        const decryptedWaitlist = waitlistSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: decryptField(data.name),
            email: decryptField(data.email),
            age: decryptField(data.age),
            city: decryptField(data.city),
            allergy: decryptField(data.allergy),
            diningFrequency: decryptField(data.diningFrequency),
            createdAt: data.createdAt?.toDate().toLocaleString() || "N/A",
          };
        });

        setMessages(decryptedMessages);
        setWaitlist(decryptedWaitlist);
      } catch (err) {
        console.error("Error fetching messages or waitlist:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [encryptionKey]);

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuthenticated");
    navigate("/admin");
  };

  return (
    <main className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h2>🔐 Admin Dashboard</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          {/* === CONTACT MESSAGES === */}
          <section className="admin-section">
            <h3>📬 Contact Messages</h3>
            {messages.length === 0 ? (
              <p>No messages found.</p>
            ) : (
              <div className="messages-table-wrapper">
                <table className="messages-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Message</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((msg) => (
                      <tr key={msg.id}>
                        <td>{msg.name}</td>
                        <td>{msg.email}</td>
                        <td>{msg.message}</td>
                        <td>{msg.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* === WAITLIST ENTRIES === */}
          <section className="admin-section">
            <h3>📋 Waitlist Entries</h3>
            {waitlist.length === 0 ? (
              <p>No waitlist entries found.</p>
            ) : (
              <div className="messages-table-wrapper">
                <table className="messages-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Age</th>
                      <th>City</th>
                      <th>Allergy</th>
                      <th>Dining Frequency</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitlist.map((entry) => (
                      <tr key={entry.id}>
                        <td>{entry.name}</td>
                        <td>{entry.email}</td>
                        <td>{entry.age}</td>
                        <td>{entry.city}</td>
                        <td>{entry.allergy}</td>
                        <td>{entry.diningFrequency}</td>
                        <td>{entry.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default AdminDashboard;
