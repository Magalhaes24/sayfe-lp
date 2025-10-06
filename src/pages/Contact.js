import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useTranslation } from "../contexts/LanguageContext";
import "./Contact.css";

const initialFormState = {
  name: "",
  email: "",
  message: ""
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Contact() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState(initialFormState);
  const [status, setStatus] = useState({ type: "", key: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusClass = status.type ? `form-status status-${status.type}` : "form-status";

  const handleChange = event => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      message: formData.message.trim()
    };

    if (!trimmedData.name || !trimmedData.email || !trimmedData.message) {
      setStatus({ type: "error", key: "contact.status.incomplete" });
      return;
    }

    if (!emailPattern.test(trimmedData.email)) {
      setStatus({ type: "error", key: "contact.status.invalidEmail" });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "info", key: "contact.status.sending" });

    try {
      await addDoc(collection(db, "contactMessages"), {
        ...trimmedData,
        createdAt: new Date()
      });
      setStatus({ type: "success", key: "contact.status.success" });
      setFormData(initialFormState);
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", key: "contact.status.error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="App">
      <main className="page-main contact-main">
        <section className="contact">
          <div className="section-shell contact-shell">
            <h2 className="contact-title">{t("contact.title")}</h2>
            <p className="contact-text">{t("contact.intro")}</p>

            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="name">{t("contact.fields.name")}</label>
                <input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t("contact.fields.placeholders.name")}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">{t("contact.fields.email")}</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("contact.fields.placeholders.email")}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">{t("contact.fields.message")}</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t("contact.fields.placeholders.message")}
                  required
                />
              </div>
              <button type="submit" className="cta-btn" disabled={isSubmitting}>
                {isSubmitting ? t("contact.submitting") : t("contact.submit")}
              </button>

              {status.key && (
                <p className={statusClass} role="status" aria-live="polite">
                  {t(status.key)}
                </p>
              )}
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Contact;
