# Contact form

The form on `/contact` is e-mailed to **contact@allercarte.com**. Nothing is saved
on our side: no database, no admin page, no encryption keys.

## How it works

1. The visitor sends the form.
2. The browser posts it to a small Google Apps Script (`scripts/contact-mailer.gs`)
   that runs in your own Google account.
3. The script checks it (valid e-mail, length, hidden bot field, minimum fill time,
   40 messages per hour) and sends it to `contact@allercarte.com` with the visitor's
   address as the reply-to, so you just press Reply.

Until step 2 is set up, the form opens the visitor's own mail app with the message
ready, so it never silently does nothing.

## Set it up (about 2 minutes, free)

1. Go to https://script.google.com and press **New project**. Use the Google
   account that is allowed to send e-mail for `contact@allercarte.com`.
2. Delete the sample code and paste in the whole of `scripts/contact-mailer.gs`.
3. **Deploy > New deployment > Web app**:
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**
   Approve the permission to send e-mail when Google asks.
4. Copy the **Web app URL** (it ends in `/exec`).
5. Give the site that URL:
   - locally, add `REACT_APP_CONTACT_ENDPOINT=<the URL>` to `.env`;
   - for the live site, run `gh variable set REACT_APP_CONTACT_ENDPOINT --body "<the URL>"`
     (it is a *variable*, not a secret: it is visible in the page anyway), then run the
     "Build & Deploy" workflow again.
6. Send yourself a test message from `/contact`.

If you change the script later, use **Deploy > Manage deployments > Edit > New version**,
otherwise the old version keeps running.

## Good to know

- Google Apps Script limits a free account to about 100 e-mails a day. More than
  enough for a contact form.
- The sender shown is the Google account that owns the script. Replies go to the
  visitor, not to that account.
- The privacy page says messages are e-mailed and kept only as long as needed to
  answer. Delete old ones from the mailbox from time to time.
