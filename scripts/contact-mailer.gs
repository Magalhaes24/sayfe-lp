/**
 * Receives the website's contact form and e-mails it to contact@allercarte.com.
 *
 * Runs in your own Google account (Google Apps Script), so no new company
 * handles the messages. Nothing is stored: the script forwards the message and
 * forgets it. See CONTACT.md for the 2-minute setup.
 */

const TO = "contact@allercarte.com";
const LIMITS = { name: 80, email: 254, message: 2000 };
const MAX_PER_HOUR = 40; // the whole form, to stop a flood
const MIN_FILL_MS = 2500; // a person needs more than this to fill the form

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Keeps a value on one line, so nobody can add extra mail headers.
function oneLine(value, max) {
  return String(value || "").replace(/[\r\n\t]+/g, " ").trim().slice(0, max);
}

function tooMany() {
  const cache = CacheService.getScriptCache();
  const used = Number(cache.get("sent") || 0);
  if (used >= MAX_PER_HOUR) return true;
  cache.put("sent", String(used + 1), 3600);
  return false;
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    const name = oneLine(body.name, LIMITS.name);
    const email = oneLine(body.email, LIMITS.email);
    const message = String(body.message || "").trim().slice(0, LIMITS.message);

    if (!name || !message || !EMAIL.test(email)) return reply({ ok: false, error: "invalid" });
    if (Number(body.ms) < MIN_FILL_MS) return reply({ ok: false, error: "too fast" });
    if (tooMany()) return reply({ ok: false, error: "busy" });

    MailApp.sendEmail({
      to: TO,
      replyTo: email,
      name: "AllerCarte (site)",
      subject: "[AllerCarte] " + name,
      body:
        "Nome: " + name + "\n" +
        "E-mail: " + email + "\n" +
        "Língua do site: " + oneLine(body.lang, 5) + "\n\n" +
        message
    });
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: "error" });
  }
}

// Opening the address in a browser only says the script is alive.
function doGet() {
  return reply({ ok: true, service: "AllerCarte contact form" });
}
