import React, { useCallback, useEffect, useRef, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { decryptAdminPayload } from "../utils/secureCrypto";
import { useTranslation } from "../contexts/LanguageContext";
import Seo from "../components/Seo";
import ConfirmDialog from "../components/ConfirmDialog";
import "./Admin.css";

const PRIVATE_KEY_DOC = { collection: "secure", doc: "adminPrivateKey" };

function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const siteName = t("seo.siteName") || "AllerCarte";
  const seoDefaults = t("seo.defaults") || {};
  const seo = t("seo.adminDashboard") || {};
  const [messages, setMessages] = useState([]);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [keyNotice, setKeyNotice] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [busyId, setBusyId] = useState("");
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const [contactSort, setContactSort] = useState({ key: "createdAtMs", dir: "desc" });
  const [contactSorting, setContactSorting] = useState(false);
  const contactSortTimer = useRef(null);

  const openConfirm = useCallback((collectionName, ids, description) => {
    if (!ids?.length) return;
    setConfirmAction({
      collectionName,
      ids,
      description:
        description ||
        `Are you sure you want to delete ${ids.length} entr${ids.length === 1 ? "y" : "ies"}?`,
    });
  }, []);

  const toCsv = useCallback((rows, headers) => {
    const escape = (value) => {
      if (value === null || value === undefined) return "";
      const str = String(value).replace(/"/g, '""');
      return `"${str}"`;
    };
    const headerLine = headers.map((h) => escape(h.label)).join(",");
    const bodyLines = rows
      .map((row) => headers.map((h) => escape(row[h.key])).join(","))
      .join("\n");
    return `${headerLine}\n${bodyLines}`;
  }, []);

  const downloadCsv = useCallback(
    (rows, headers, filename) => {
      if (!rows?.length) return;
      const csv = toCsv(rows, headers);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [toCsv]
  );

  const sortRows = useCallback((rows, sortSpec) => {
    const { key, dir } = sortSpec || {};
    if (!key || !dir) return rows;
    const direction = dir === "asc" ? 1 : -1;
    const copy = [...rows];
    copy.sort((a, b) => {
      const aValue = a?.[key];
      const bValue = b?.[key];
      if (typeof aValue === "number" && typeof bValue === "number") {
        return (aValue - bValue) * direction;
      }
      const aStr = (aValue ?? "").toString().toLowerCase();
      const bStr = (bValue ?? "").toString().toLowerCase();
      if (aStr < bStr) return -1 * direction;
      if (aStr > bStr) return 1 * direction;
      return 0;
    });
    return copy;
  }, []);

  const sortIndicator = useCallback((current, key) => {
    if (!current || current.key !== key) return "";
    return current.dir === "asc" ? "▲" : "▼";
  }, []);

  const nextSort = useCallback((current, key) => {
    if (!current || current.key !== key) {
      return { key, dir: key === "createdAtMs" ? "desc" : "asc" };
    }
    return { key, dir: current.dir === "asc" ? "desc" : "asc" };
  }, []);

  const SortHeader = useCallback(
    ({ label, sortKey, sortState, setSortState, onSort }) => (
      <button
        type="button"
        className="admin-sort"
        onClick={() => {
          onSort?.();
          setSortState((prev) => nextSort(prev, sortKey));
        }}
      >
        <span>{label}</span>
        <span className="admin-sort-arrow">{sortIndicator(sortState, sortKey)}</span>
      </button>
    ),
    [nextSort, sortIndicator]
  );

  const bumpSortAnimation = useCallback((timerRef, setSorting, durationMs = 220) => {
    setSorting(true);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => setSorting(false), durationMs);
  }, []);

  useEffect(() => {
    return () => {
      // Timers are stored in refs; reading `.current` at unmount is intended here.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (contactSortTimer.current) window.clearTimeout(contactSortTimer.current);
    };
  }, []);

  const fetchPrivateKey = useCallback(async () => {
    const snap = await getDoc(doc(db, PRIVATE_KEY_DOC.collection, PRIVATE_KEY_DOC.doc));
    if (!snap.exists()) {
      throw new Error("Admin private key document not found.");
    }
    const value = snap.data()?.privateKey;
    if (!value) {
      throw new Error("Private key missing in secure/adminPrivateKey document.");
    }
    return value;
  }, []);

  const decryptRecord = useCallback(
    async (data, id, type) => {
      if (!data) return {};
      try {
        if (data.encryptedKey && data.ciphertext && data.iv) {
          const decrypted = await decryptAdminPayload(data, privateKey);
          return decrypted || {};
        }
        return {
          name: "(legacy encrypted)",
          email: "(legacy encrypted)",
          message: type === "contact" ? "(legacy encrypted)" : undefined,
          age: type === "waitlist" ? "(legacy encrypted)" : undefined,
          city: type === "waitlist" ? "(legacy encrypted)" : undefined,
          allergy: type === "waitlist" ? "(legacy encrypted)" : undefined,
          diningFrequency: type === "waitlist" ? "(legacy encrypted)" : undefined,
        };
      } catch (err) {
        console.error(`Decryption failed for ${type} doc ${id}:`, err);
        return {
          name: "(decryption failed)",
          email: "(decryption failed)",
          message: type === "contact" ? "(decryption failed)" : undefined,
          age: type === "waitlist" ? "(decryption failed)" : undefined,
          city: type === "waitlist" ? "(decryption failed)" : undefined,
          allergy: type === "waitlist" ? "(decryption failed)" : undefined,
          diningFrequency: type === "waitlist" ? "(decryption failed)" : undefined,
        };
      }
    },
    [privateKey]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Without the private key everything else still loads; only the contact
      // messages stay locked.
      let key = privateKey;
      let notice = "";
      if (!key) {
        try {
          key = await fetchPrivateKey();
          setPrivateKey(key);
        } catch (keyErr) {
          if (!/private key/i.test((keyErr && keyErr.message) || "")) throw keyErr;
          key = "";
          notice =
            "The private key (secure/adminPrivateKey) is missing in this Firebase project, so contact messages stay locked. Everything else below is loaded. Analytics is not affected.";
        }
      }

      const contactSnap = await getDocs(query(collection(db, "contactMessages"), orderBy("createdAt", "desc")));
      const contactPromises = contactSnap.docs.map(async (docSnap) => {
        const createdAt = docSnap.data().createdAt?.toDate?.() || null;
        const decrypted = key
          ? await decryptRecord(docSnap.data(), docSnap.id, "contact")
          : { name: "🔒 Locked", email: "🔒 Locked", message: "🔒 Locked: private key missing" };
        return {
          id: docSnap.id,
          name: decrypted.name || "(empty)",
          email: decrypted.email || "(empty)",
          message: decrypted.message || "(empty)",
          createdAtMs: createdAt ? createdAt.getTime() : 0,
          createdAt: createdAt ? createdAt.toLocaleString() : "N/A",
        };
      });

      const [decryptedMessages] = await Promise.all([Promise.all(contactPromises)]);

      setMessages(sortRows(decryptedMessages, contactSort));
      setSelectedMessages([]);
      setKeyNotice(notice);
    } catch (err) {
      console.error("Error fetching messages or waitlist:", err);
      // A missing key only blocks reading contact messages; say so instead of
      // blaming the account, since Analytics works without it.
      const keyMissing = /private key/i.test((err && err.message) || "");
      setAuthError(
        keyMissing
          ? "Contact messages cannot be decrypted: the private key (secure/adminPrivateKey) is missing in this Firebase project. Analytics is not affected."
          : `Permission denied (${(err && (err.code || err.message)) || "unknown"}). Please sign in with a verified admin account.`
      );
    } finally {
      setLoading(false);
    }
  }, [contactSort, decryptRecord, fetchPrivateKey, privateKey, sortRows]);

  const executeDelete = useCallback(async () => {
    if (!confirmAction?.ids?.length) return;
    const { collectionName, ids } = confirmAction;
    const busyKey = ids.length > 1 ? `bulk-${collectionName}` : ids[0];
    setBusyId(busyKey);
    try {
      await Promise.all(ids.map((rowId) => deleteDoc(doc(db, collectionName, rowId))));
      await fetchData();
    } catch (error) {
      console.error("Delete failed:", error);
      setAuthError("Unable to delete entry. Check permissions.");
    } finally {
      setBusyId("");
      setConfirmAction(null);
    }
  }, [confirmAction, fetchData]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthError("Not authenticated. Please sign in as an admin.");
        setLoading(false);
        navigate("/admin", { replace: true });
        return;
      }

      try {
        setAuthError("");
        fetchData();
      } catch (err) {
        console.error("Auth/claims check failed:", err);
        setAuthError("Unable to verify admin permissions.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchData, navigate]);

  useEffect(() => {
    setMessages((prev) => sortRows(prev, contactSort));
  }, [contactSort, sortRows]);

  const handleLogout = () => {
    signOut(auth).finally(() => {
      navigate("/admin");
    });
  };

  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handleBulkDelete = useCallback(
    (collectionName, ids) => {
      if (!ids?.length) return;
      openConfirm(
        collectionName,
        ids,
        `Delete ${ids.length} selected entr${ids.length === 1 ? "y" : "ies"}?`
      );
    },
    [openConfirm]
  );

  const toggleSelect = (id, list, setter) => {
    setter((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAllVisible = (rows, setter) => {
    setter(rows.map((r) => r.id));
  };

  const clearSelection = (setter) => setter([]);

  const handleRowSelect = useCallback((event, id, list, setter) => {
    const target = event.target;
    if (target.closest("button, a, input, textarea, select, option, label, details, summary")) {
      return;
    }
    toggleSelect(id, list, setter);
  }, []);

  return (
    <main className="admin-dashboard">
      <Seo
        title={seo.title}
        description={seo.description || seoDefaults.description}
        keywords={seo.keywords || seoDefaults.keywords}
        image={seo.image || seoDefaults.image}
        canonicalPath="/admin/dashboard"
        siteName={siteName}
        noindex={Boolean(seo.noindex)}
      />
      <div className="admin-dashboard-header">
        <h2>Admin Dashboard</h2>
        <div className="admin-dashboard-actions">
          <button onClick={handleRefresh} className="admin-refresh" disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          {process.env.NODE_ENV === "development" && (
            <button onClick={() => navigate("/admin/analytics")} className="admin-refresh">
              Analytics
            </button>
          )}
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {authError && <p className="error-message">{authError}</p>}
      {keyNotice && <p className="info-message">{keyNotice}</p>}

      {loading ? (
        <p>Loading data...</p>
      ) : !authError ? (
        <>
          <section className="admin-section">
            <h3>Contact Messages</h3>
            {messages.length === 0 ? (
              <p>No messages found.</p>
            ) : (
              <div className={`messages-table-wrapper ${contactSorting ? "messages-table-wrapper--sorting" : ""}`}>
                <table className="messages-table">
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>
                        <SortHeader
                          label="Name"
                          sortKey="name"
                          sortState={contactSort}
                          setSortState={setContactSort}
                          onSort={() => bumpSortAnimation(contactSortTimer, setContactSorting)}
                        />
                      </th>
                      <th>
                        <SortHeader
                          label="Email"
                          sortKey="email"
                          sortState={contactSort}
                          setSortState={setContactSort}
                          onSort={() => bumpSortAnimation(contactSortTimer, setContactSorting)}
                        />
                      </th>
                      <th>Message</th>
                      <th>
                        <SortHeader
                          label="Created At"
                          sortKey="createdAtMs"
                          sortState={contactSort}
                          setSortState={setContactSort}
                          onSort={() => bumpSortAnimation(contactSortTimer, setContactSorting)}
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllMessages ? messages : messages.slice(0, 5)).map((msg) => (
                      <tr
                        key={msg.id}
                        className="selectable-row"
                        onClick={(e) => handleRowSelect(e, msg.id, selectedMessages, setSelectedMessages)}
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedMessages.includes(msg.id)}
                            onChange={() => toggleSelect(msg.id, selectedMessages, setSelectedMessages)}
                          />
                        </td>
                        <td>{msg.name}</td>
                        <td>{msg.email}</td>
                        <td>
                          <details>
                            <summary>View</summary>
                            <div className="admin-message">{msg.message}</div>
                          </details>
                        </td>
                        <td>{msg.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {messages.length > 0 && (
                  <div className="admin-table-actions">
                    <button
                      className="admin-export"
                      onClick={() =>
                        downloadCsv(
                          selectedMessages.length
                            ? messages.filter((m) => selectedMessages.includes(m.id))
                            : messages,
                          [
                            { key: "name", label: "Name" },
                            { key: "email", label: "Email" },
                            { key: "message", label: "Message" },
                            { key: "createdAt", label: "Created At" },
                          ],
                          "contact-messages.csv"
                        )
                      }
                    >
                      Export
                    </button>
                    <button
                      className="admin-delete"
                      onClick={() => handleBulkDelete("contactMessages", selectedMessages)}
                      disabled={!selectedMessages.length || busyId?.startsWith("bulk-contactMessages")}
                    >
                      Delete
                    </button>
                    <button
                      className="admin-export"
                      onClick={() =>
                        selectAllVisible(showAllMessages ? messages : messages.slice(0, 5), setSelectedMessages)
                      }
                    >
                      Select all
                    </button>
                    <button className="admin-export" onClick={() => clearSelection(setSelectedMessages)}>
                      Clear
                    </button>
                    {messages.length > 5 && (
                      <button className="admin-toggle" onClick={() => setShowAllMessages((prev) => !prev)}>
                        {showAllMessages ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        </>
      ) : null}
      <ConfirmDialog
        open={Boolean(confirmAction)}
        title="Confirm deletion"
        message={confirmAction?.description || ""}
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onCancel={() => setConfirmAction(null)}
        onConfirm={executeDelete}
      />
    </main>
  );
}

export default AdminDashboard;
