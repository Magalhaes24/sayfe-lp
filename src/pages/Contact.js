import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useTranslation } from "../contexts/LanguageContext";
import { encryptForAdmin } from "../utils/secureCrypto";
import "./Contact.css";
import Seo from "../components/Seo";

const initialFormState = {
  name: "",
  email: "",
  message: "",
};

const CONTACT_EMAIL = "francisco@besayfe.com";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 2000;
const SUBMIT_COOLDOWN_MS = 10_000;

function Contact() {
  const { t } = useTranslation();
  const siteName = t("seo.siteName") || "besayfe";
  const seoDefaults = t("seo.defaults") || {};
  const seo = t("seo.contact") || {};
  const [formData, setFormData] = useState(initialFormState);
  const [status, setStatus] = useState({ type: "", key: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);

  const statusClass = status.type
    ? `form-status status-${status.type}`
    : "form-status";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (Date.now() < cooldownUntil) {
      setStatus({ type: "error", key: "contact.status.error" });
      return;
    }

    const trimmedData = {
      name: formData.name.trim().slice(0, MAX_NAME_LENGTH),
      email: formData.email.trim().slice(0, MAX_EMAIL_LENGTH),
      message: formData.message.trim().slice(0, MAX_MESSAGE_LENGTH),
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
      const encryptedPayload = await encryptForAdmin(trimmedData);

      await addDoc(collection(db, "contactMessages"), {
        ...encryptedPayload,
        createdAt: serverTimestamp(),
      });

      setStatus({ type: "success", key: "contact.status.success" });
      setFormData(initialFormState);
      setCooldownUntil(Date.now() + SUBMIT_COOLDOWN_MS);
    } catch (error) {
      console.error("Firestore Error:", error);
      setStatus({ type: "error", key: "contact.status.error" });
      setCooldownUntil(Date.now() + SUBMIT_COOLDOWN_MS);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="App">
      <Seo
        title={seo.title}
        description={seo.description || seoDefaults.description}
        keywords={seo.keywords || seoDefaults.keywords}
        image={seo.image || seoDefaults.image}
        canonicalPath="/contact"
        siteName={siteName}
      />
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
                  maxLength={MAX_NAME_LENGTH}
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
                  maxLength={MAX_EMAIL_LENGTH}
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
                  maxLength={MAX_MESSAGE_LENGTH}
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

            <p className="contact-direct">
              {t("contact.directLabel")}{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Contact;
