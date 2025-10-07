import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useTranslation } from "../contexts/LanguageContext";
import CryptoJS from "crypto-js"; // 🔐 encryption
import "./WaitlistForm.css";

const initialFormState = {
  name: "",
  email: "",
  age: "",
  city: "",
  allergy: "",
  diningFrequency: "1-4"
};

function WaitlistForm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialFormState);
  const [status, setStatus] = useState({ key: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setStatus({ key: "waitlist.submitting", type: "info" });
    setIsSubmitting(true);

    try {
      const secret = process.env.REACT_APP_ENCRYPTION_KEY;

      // 🔒 Encrypt each field individually
      const encryptedData = {};
      Object.keys(formData).forEach((key) => {
        encryptedData[key] = CryptoJS.AES.encrypt(
          String(formData[key]),
          secret
        ).toString();
      });

      await addDoc(collection(db, "waitlist"), {
        ...encryptedData,
        createdAt: serverTimestamp(),
      });

      setStatus({ key: "waitlist.success", type: "success" });
      setFormData(initialFormState);
    } catch (error) {
      console.error("❌ Firestore Error:", error);
      setStatus({ key: "waitlist.error", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="App">
      <main className="page-main waitlist-main">
        <section className="waitlist">
          <div className="section-shell waitlist-shell">
            <div className="waitlist-intro">
              <h2 dangerouslySetInnerHTML={{ __html: t("waitlist.title") }}></h2>
              <p dangerouslySetInnerHTML={{ __html: t("waitlist.intro") }}></p>
            </div>

            <div className="form-container">
              <form onSubmit={handleSubmit} noValidate>
                <label htmlFor="name">{t("waitlist.fields.name")}</label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="email">{t("waitlist.fields.email")}</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="age">{t("waitlist.fields.age")}</label>
                <input
                  id="age"
                  type="number"
                  min="0"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="city">{t("waitlist.fields.city")}</label>
                <input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="allergy">{t("waitlist.fields.allergy")}</label>
                <input
                  id="allergy"
                  name="allergy"
                  value={formData.allergy}
                  onChange={handleChange}
                  required
                />

                <label htmlFor="diningFrequency">
                  {t("waitlist.fields.diningFrequency")}
                </label>
                <select
                  id="diningFrequency"
                  name="diningFrequency"
                  value={formData.diningFrequency}
                  onChange={handleChange}
                >
                  <option value="1-4">1-4</option>
                  <option value="5-8">5-8</option>
                  <option value="8-12">8-12</option>
                  <option value="12+">12+</option>
                </select>

                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? t("waitlist.submitting") : t("waitlist.submit")}
                </button>
              </form>

              {status.key && (
                <p
                  className={`status-message${
                    status.type ? ` status-${status.type}` : ""
                  }`}
                  role="status"
                  aria-live="polite"
                  dangerouslySetInnerHTML={{ __html: t(status.key) }}
                ></p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default WaitlistForm;
