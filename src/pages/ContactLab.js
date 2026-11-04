import React, { useRef, useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useTranslation } from "../contexts/LanguageContext";
import { encryptForAdmin } from "../utils/secureCrypto";
import Seo from "../components/Seo";
import { RiseTitle, useReveal } from "../components/lab/LabKit";
import "./HomeLab.css";
import "./ContactLab.css";

// Same limits and submission as the live Contact page: the message is
// encrypted in the browser and stored in Firestore.
const initialForm = { name: "", email: "", message: "" };
const CONTACT_EMAIL = "francisco@besayfe.com";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX = { name: 80, email: 254, message: 2000 };
const SUBMIT_COOLDOWN_MS = 10_000;

const COPY = {
  pt: {
    sentTitle: "Mensagem enviada.",
    again: "Enviar outra mensagem",
    count: (n, max) => `${n} de ${max}`
  },
  en: {
    sentTitle: "Message sent.",
    again: "Send another message",
    count: (n, max) => `${n} of ${max}`
  }
};

function Field({ id, label, error, multiline = false, value, ...rest }) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <div className={`lx-field${error ? " has-error" : ""}${multiline ? " lx-field--area" : ""}`}>
      <Tag
        id={id}
        name={id}
        value={value}
        placeholder=" "
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      <label htmlFor={id}>{label}</label>
      <p className="lx-field__error" id={`${id}-error`} role={error ? "alert" : undefined}>
        {error || ""}
      </p>
    </div>
  );
}

function Spinner() {
  return <span className="lx-spinner" aria-hidden="true" />;
}

function ContactLab() {
  const { t, language } = useTranslation();
  const copy = COPY[language] || COPY.pt;
  const seo = t("seo.contact") || {};
  const seoDefaults = t("seo.defaults") || {};

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", key: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);

  const rootRef = useRef(null);
  useReveal(rootRef);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: "" }));
  };

  // Email is checked when the field is left, not on every key.
  const onEmailBlur = (e) => {
    const v = e.target.value.trim();
    if (v && !emailPattern.test(v)) {
      setErrors((er) => ({ ...er, email: t("contact.status.invalidEmail") }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (Date.now() < cooldownUntil) {
      setStatus({ type: "error", key: "contact.status.error" });
      return;
    }

    const data = {
      name: form.name.trim().slice(0, MAX.name),
      email: form.email.trim().slice(0, MAX.email),
      message: form.message.trim().slice(0, MAX.message)
    };

    const missing = {};
    if (!data.name) missing.name = " ";
    if (!data.email) missing.email = " ";
    if (!data.message) missing.message = " ";
    if (Object.keys(missing).length) {
      setErrors(missing);
      setStatus({ type: "error", key: "contact.status.incomplete" });
      return;
    }
    if (!emailPattern.test(data.email)) {
      setErrors({ email: t("contact.status.invalidEmail") });
      setStatus({ type: "", key: "" });
      return;
    }

    setSubmitting(true);
    setStatus({ type: "info", key: "contact.status.sending" });
    try {
      const encrypted = await encryptForAdmin(data);
      await addDoc(collection(db, "contactMessages"), {
        ...encrypted,
        createdAt: serverTimestamp()
      });
      setForm(initialForm);
      setErrors({});
      setStatus({ type: "", key: "" });
      setSent(true);
      setCooldownUntil(Date.now() + SUBMIT_COOLDOWN_MS);
    } catch (error) {
      console.error("Firestore Error:", error);
      setStatus({ type: "error", key: "contact.status.error" });
      setCooldownUntil(Date.now() + SUBMIT_COOLDOWN_MS);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="lx lx-contact" ref={rootRef}>
      <Seo
        title={seo.title}
        description={seo.description || seoDefaults.description}
        canonicalPath="/contact/"
        siteName={t("seo.siteName") || "AllerCarte"}
      />

      <section className="lx-contact__section">
        <div className="lx-shell lx-contact__grid">
          <div className="lx-contact__intro">
            <p className="lx-eyebrow lx-rise" style={{ "--d": "0ms" }}>
              {t("nav.contact")}
            </p>
            <RiseTitle text={t("contact.title")} className="lx-contact__title" />
            <p className="lx-lead lx-rise" style={{ "--d": "350ms" }}>
              {t("contact.intro")}
            </p>
            <div className="lx-contact__direct lx-rise" style={{ "--d": "450ms" }}>
              <span>{t("contact.directLabel")}</span>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </div>
          </div>

          <div className="lx-contact__card lx-rise" style={{ "--d": "250ms" }}>
            {/* Both states stay mounted and cross-fade, so the card never jumps. */}
            <form
              className={`lx-form${sent ? " is-away" : ""}`}
              onSubmit={onSubmit}
              noValidate
              inert={sent}
            >
              <Field
                id="name"
                label={t("contact.fields.name")}
                value={form.name}
                onChange={onChange}
                maxLength={MAX.name}
                autoComplete="name"
                error={errors.name}
                required
              />
              <Field
                id="email"
                type="email"
                label={t("contact.fields.email")}
                value={form.email}
                onChange={onChange}
                onBlur={onEmailBlur}
                maxLength={MAX.email}
                autoComplete="email"
                inputMode="email"
                error={errors.email}
                required
              />
              <Field
                id="message"
                multiline
                rows={6}
                label={t("contact.fields.message")}
                value={form.message}
                onChange={onChange}
                maxLength={MAX.message}
                error={errors.message}
                required
              />
              <p className="lx-form__count" aria-live="off">
                {copy.count(form.message.length, MAX.message)}
              </p>

              <button type="submit" className="lx-btn lx-form__submit" disabled={submitting}>
                {submitting && <Spinner />}
                {submitting ? t("contact.submitting") : t("contact.submit")}
              </button>

              <p
                className={`lx-form__status${status.type ? ` is-${status.type}` : ""}`}
                role="status"
                aria-live="polite"
              >
                {status.key ? t(status.key) : ""}
              </p>
            </form>

            <div className={`lx-sent${sent ? " is-shown" : ""}`} inert={!sent}>
              <span className="lx-sent__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </span>
              <h2>{copy.sentTitle}</h2>
              <p>{t("contact.status.success")}</p>
              <button
                type="button"
                className="lx-more lx-sent__again"
                onClick={() => setSent(false)}
              >
                {copy.again}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactLab;
