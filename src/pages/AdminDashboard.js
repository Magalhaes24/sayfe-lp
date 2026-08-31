import React, { useCallback, useEffect, useRef, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { decryptAdminPayload } from "../utils/secureCrypto";
import { useTranslation } from "../contexts/LanguageContext";
import Seo from "../components/Seo";
import ConfirmDialog from "../components/ConfirmDialog";
import "./Admin.css";

const PRIVATE_KEY_DOC = { collection: "secure", doc: "adminPrivateKey" };
const ADMIN_EMAIL = "franciscomagalhaes04@gmail.com";

function AdminDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const siteName = t("seo.siteName") || "besayfe";
  const seoDefaults = t("seo.defaults") || {};
  const seo = t("seo.adminDashboard") || {};
  const [messages, setMessages] = useState([]);
  const [labelUploads, setLabelUploads] = useState([]);
  const [riskReadings, setRiskReadings] = useState([]);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [showAllUploads, setShowAllUploads] = useState(false);
  const [showAllRiskReadings, setShowAllRiskReadings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [busyId, setBusyId] = useState("");
  const [imageModal, setImageModal] = useState("");
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [selectedUploads, setSelectedUploads] = useState([]);
  const [selectedRiskReadings, setSelectedRiskReadings] = useState([]);
  const [expandedIngredients, setExpandedIngredients] = useState([]);
  const [confirmAction, setConfirmAction] = useState(null);
  const [contactSort, setContactSort] = useState({ key: "createdAtMs", dir: "desc" });
  const [uploadSort, setUploadSort] = useState({ key: "createdAtMs", dir: "desc" });
  const [riskSort, setRiskSort] = useState({ key: "createdAtMs", dir: "desc" });
  const [contactSorting, setContactSorting] = useState(false);
  const [uploadsSorting, setUploadsSorting] = useState(false);
  const [riskSorting, setRiskSorting] = useState(false);
  const contactSortTimer = useRef(null);
  const uploadsSortTimer = useRef(null);
  const riskSortTimer = useRef(null);

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

  const downloadImage = useCallback((dataUrl, filename) => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

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
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (uploadsSortTimer.current) window.clearTimeout(uploadsSortTimer.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (riskSortTimer.current) window.clearTimeout(riskSortTimer.current);
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
      const key = privateKey || (await fetchPrivateKey());
      if (!privateKey) {
        setPrivateKey(key);
      }

      const contactSnap = await getDocs(query(collection(db, "contactMessages"), orderBy("createdAt", "desc")));
      const contactPromises = contactSnap.docs.map(async (docSnap) => {
        const createdAt = docSnap.data().createdAt?.toDate?.() || null;
        const decrypted = await decryptRecord(docSnap.data(), docSnap.id, "contact");
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

      const labelUploadsSnap = await getDocs(query(collection(db, "labelUploads"), orderBy("createdAt", "desc")));
      const uploads = labelUploadsSnap.docs.map((docSnap) => {
        const data = docSnap.data() || {};
        const createdAt = data.createdAt?.toDate?.() || null;
        const rawImage = data.image || "";
        const imageSrc =
          typeof rawImage === "string" && rawImage.startsWith("data:")
            ? rawImage
            : rawImage
            ? `data:image/png;base64,${rawImage}`
            : "";

        return {
          id: docSnap.id,
          barcode: data.barcode || "not found",
          productName: data.productName || "not found",
          source: data.source || "unknown",
          image: imageSrc,
          checked: Boolean(data.checked),
          createdAtMs: createdAt ? createdAt.getTime() : 0,
          createdAt: createdAt ? createdAt.toLocaleString() : "N/A",
        };
      });

      setMessages(sortRows(decryptedMessages, contactSort));
      setLabelUploads(sortRows(uploads, uploadSort));
      const riskSnap = await getDocs(query(collection(db, "riskReadings"), orderBy("createdAt", "desc")));
      const risks = riskSnap.docs.map((docSnap) => {
        const data = docSnap.data() || {};
        const createdAt = data.createdAt?.toDate?.() || null;
        const riskScore = typeof data.riskFinalScore === "number" ? data.riskFinalScore : data.riskFinalScore ?? "N/A";
        const ingredientsList = Array.isArray(data.ingredientsList) ? data.ingredientsList : [];
        return {
          id: docSnap.id,
          mode: data.mode || "unknown",
          status: data.status || "unknown",
          error: data.error || "",
          barcode: data.barcode || "not found",
          productName: data.productName || "not found",
          riskFinalScore: riskScore,
          ingredientsList,
          ingredientsPreview: ingredientsList.length ? ingredientsList.join(", ") : "-",
          createdAtMs: createdAt ? createdAt.getTime() : 0,
          createdAt: createdAt ? createdAt.toLocaleString() : "N/A",
        };
      });
      setRiskReadings(sortRows(risks, riskSort));
      setSelectedMessages([]);
      setSelectedUploads([]);
      setSelectedRiskReadings([]);
    } catch (err) {
      console.error("Error fetching messages or waitlist:", err);
      setAuthError("Permission denied or private key unavailable. Please sign in with an admin account.");
    } finally {
      setLoading(false);
    }
  }, [contactSort, decryptRecord, fetchPrivateKey, privateKey, sortRows, uploadSort, riskSort]);

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
        const tokenResult = await user.getIdTokenResult();
        const isAdmin =
          tokenResult?.claims?.admin === true ||
          (user?.email && user.email.toLowerCase() === ADMIN_EMAIL);
        if (!isAdmin) {
          setAuthError("Missing admin permissions. Please use an admin account.");
          setLoading(false);
          await signOut(auth);
          navigate("/admin", { replace: true });
          return;
        }

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

  useEffect(() => {
    setLabelUploads((prev) => sortRows(prev, uploadSort));
  }, [sortRows, uploadSort]);

  useEffect(() => {
    setRiskReadings((prev) => sortRows(prev, riskSort));
  }, [sortRows, riskSort]);

  const handleLogout = () => {
    signOut(auth).finally(() => {
      navigate("/admin");
    });
  };

  const handleRefresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const toggleChecked = useCallback(
    async (id, current) => {
      if (!id) return;
      setBusyId(id);
      try {
        await updateDoc(doc(db, "labelUploads", id), { checked: !current });
        await fetchData();
      } catch (error) {
        console.error("Toggle checked failed:", error);
        setAuthError("Unable to update entry. Check permissions.");
      } finally {
        setBusyId("");
      }
    },
    [fetchData]
  );

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

  const toggleIngredientPreview = (id) => {
    setExpandedIngredients((prev) =>
      prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]
    );
  };

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
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      {authError && <p className="error-message">{authError}</p>}

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

          {/* 
          
          <section className="admin-section">
            <h3>Waitlist Entries</h3>
            {waitlist.length === 0 ? (
              <p>No waitlist entries found.</p>
            ) : (
              <div className={`messages-table-wrapper ${waitlistSorting ? "messages-table-wrapper--sorting" : ""}`}>
                <table className="messages-table">
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>
                        <SortHeader
                          label="Name"
                          sortKey="name"
                          sortState={waitlistSort}
                          setSortState={setWaitlistSort}
                          onSort={() => bumpSortAnimation(waitlistSortTimer, setWaitlistSorting)}
                        />
                      </th>
                      <th>
                        <SortHeader
                          label="Email"
                          sortKey="email"
                          sortState={waitlistSort}
                          setSortState={setWaitlistSort}
                          onSort={() => bumpSortAnimation(waitlistSortTimer, setWaitlistSorting)}
                        />
                      </th>
                      <th>
                        <SortHeader
                          label="Age"
                          sortKey="age"
                          sortState={waitlistSort}
                          setSortState={setWaitlistSort}
                          onSort={() => bumpSortAnimation(waitlistSortTimer, setWaitlistSorting)}
                        />
                      </th>
                      <th>
                        <SortHeader
                          label="City"
                          sortKey="city"
                          sortState={waitlistSort}
                          setSortState={setWaitlistSort}
                          onSort={() => bumpSortAnimation(waitlistSortTimer, setWaitlistSorting)}
                        />
                      </th>
                      <th>
                        <SortHeader
                          label="Allergy"
                          sortKey="allergy"
                          sortState={waitlistSort}
                          setSortState={setWaitlistSort}
                          onSort={() => bumpSortAnimation(waitlistSortTimer, setWaitlistSorting)}
                        />
                      </th>
                      <th>
                        <SortHeader
                          label="Dining Frequency"
                          sortKey="diningFrequency"
                          sortState={waitlistSort}
                          setSortState={setWaitlistSort}
                          onSort={() => bumpSortAnimation(waitlistSortTimer, setWaitlistSorting)}
                        />
                      </th>
                      <th>
                        <SortHeader
                          label="Created At"
                          sortKey="createdAtMs"
                          sortState={waitlistSort}
                          setSortState={setWaitlistSort}
                          onSort={() => bumpSortAnimation(waitlistSortTimer, setWaitlistSorting)}
                        />
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllWaitlist ? waitlist : waitlist.slice(0, 5)).map((entry) => (
                      <tr
                        key={entry.id}
                        className="selectable-row"
                        onClick={(e) => handleRowSelect(e, entry.id, selectedWaitlist, setSelectedWaitlist)}
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedWaitlist.includes(entry.id)}
                            onChange={() => toggleSelect(entry.id, selectedWaitlist, setSelectedWaitlist)}
                          />
                        </td>
                        <td>{entry.name}</td>
                        <td>{entry.email}</td>
                        <td>{entry.age}</td>
                        <td>{entry.city}</td>
                        <td>{entry.allergy}</td>
                        <td>{entry.diningFrequency}</td>
                        <td>{entry.createdAt}</td>
                        <td>
                          <button
                            className="admin-delete"
                            onClick={() => handleDelete("waitlist", entry.id)}
                            disabled={busyId === entry.id}
                          >
                            {busyId === entry.id ? "..." : "Delete"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(waitlist.length > 5 || waitlist.length > 0) && (
                  <div className="admin-table-actions">
                    {waitlist.length > 0 && (
                      <>
                        <button
                          className="admin-export"
                          onClick={() =>
                            downloadCsv(
                              selectedWaitlist.length
                                ? waitlist.filter((w) => selectedWaitlist.includes(w.id))
                                : waitlist,
                              [
                                { key: "name", label: "Name" },
                                { key: "email", label: "Email" },
                                { key: "age", label: "Age" },
                                { key: "city", label: "City" },
                                { key: "allergy", label: "Allergy" },
                                { key: "diningFrequency", label: "Dining Frequency" },
                                { key: "createdAt", label: "Created At" },
                              ],
                              "waitlist.csv"
                            )
                          }
                        >
                          Export
                        </button>
                        <button
                          className="admin-export"
                          onClick={() => handleBulkDelete("waitlist", selectedWaitlist)}
                          disabled={!selectedWaitlist.length || busyId?.startsWith("bulk-waitlist")}
                        >
                          Delete
                        </button>
                        <button
                          className="admin-export"
                          onClick={() =>
                            selectAllVisible(showAllWaitlist ? waitlist : waitlist.slice(0, 5), setSelectedWaitlist)
                          }
                        >
                          Select all
                        </button>
                        <button className="admin-export" onClick={() => clearSelection(setSelectedWaitlist)}>
                          Clear
                        </button>
                      </>
                    )}
                    <button className="admin-delete" onClick={() => setShowAllWaitlist((prev) => !prev)}>
                      {showAllWaitlist ? "Show less" : "Show more"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>

          */}

          <section className="admin-section">
            <h3>Label Uploads</h3>
            {labelUploads.length === 0 ? (
              <p>No label uploads found.</p>
            ) : (
              <div className={`messages-table-wrapper ${uploadsSorting ? "messages-table-wrapper--sorting" : ""}`}>
                <table className="messages-table">
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>
                        <SortHeader
                          label="Barcode"
                          sortKey="barcode"
                          sortState={uploadSort}
                          setSortState={setUploadSort}
                          onSort={() => bumpSortAnimation(uploadsSortTimer, setUploadsSorting)}
                        />
                      </th>
                      <th>
                        <SortHeader
                          label="Product"
                          sortKey="productName"
                          sortState={uploadSort}
                          setSortState={setUploadSort}
                          onSort={() => bumpSortAnimation(uploadsSortTimer, setUploadsSorting)}
                        />
                      </th>
                      <th>
                        <SortHeader
                          label="Source"
                          sortKey="source"
                          sortState={uploadSort}
                          setSortState={setUploadSort}
                          onSort={() => bumpSortAnimation(uploadsSortTimer, setUploadsSorting)}
                        />
                      </th>
                      <th>Image</th>
                      <th>
                        <SortHeader
                          label="Created At"
                          sortKey="createdAtMs"
                          sortState={uploadSort}
                          setSortState={setUploadSort}
                          onSort={() => bumpSortAnimation(uploadsSortTimer, setUploadsSorting)}
                        />
                      </th>
                      <th>
                        <SortHeader
                          label="Checked"
                          sortKey="checked"
                          sortState={uploadSort}
                          setSortState={setUploadSort}
                          onSort={() => bumpSortAnimation(uploadsSortTimer, setUploadsSorting)}
                        />
                      </th>
                      <th>Save</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllUploads ? labelUploads : labelUploads.slice(0, 5)).map((upload) => (
                      <tr
                        key={upload.id}
                        className="selectable-row"
                        onClick={(e) => handleRowSelect(e, upload.id, selectedUploads, setSelectedUploads)}
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedUploads.includes(upload.id)}
                            onChange={() => toggleSelect(upload.id, selectedUploads, setSelectedUploads)}
                          />
                        </td>
                        <td>{upload.barcode}</td>
                        <td>{upload.productName}</td>
                        <td>{upload.source}</td>
                        <td>
                          {upload.image ? (
                            <button
                              className="admin-image-button"
                              onClick={() => setImageModal(upload.image)}
                              aria-label={`View label for ${upload.productName}`}
                            >
                              <img
                                src={upload.image}
                                alt={`Label for ${upload.productName} (${upload.barcode})`}
                                style={{ maxWidth: "140px", maxHeight: "140px", borderRadius: "6px" }}
                              />
                            </button>
                          ) : (
                            <span>(no image)</span>
                          )}
                        </td>
                        <td>{upload.createdAt}</td>
                        <td>
                          <input
                            type="checkbox"
                            checked={upload.checked}
                            onChange={() => toggleChecked(upload.id, upload.checked)}
                            disabled={busyId === upload.id}
                          />
                        </td>
                        <td>
                          {upload.image && (
                            <button
                              className="admin-export"
                              onClick={() =>
                                downloadImage(
                                  upload.image,
                                  `${upload.productName || "label"}-${upload.barcode || upload.id}.png`
                                )
                              }
                            >
                              Save
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {labelUploads.length > 0 && (
                  <div className="admin-table-actions">
                    <button
                      className="admin-export"
                      onClick={() =>
                        downloadCsv(
                          selectedUploads.length
                            ? labelUploads.filter((u) => selectedUploads.includes(u.id))
                            : labelUploads,
                          [
                            { key: "barcode", label: "Barcode" },
                            { key: "productName", label: "Product" },
                            { key: "source", label: "Source" },
                            { key: "checked", label: "Checked" },
                            { key: "createdAt", label: "Created At" },
                          ],
                          "label-uploads.csv"
                        )
                      }
                    >
                      Export
                    </button>
                    <button
                      className="admin-delete"
                      onClick={() => handleBulkDelete("labelUploads", selectedUploads)}
                      disabled={!selectedUploads.length || busyId?.startsWith("bulk-labelUploads")}
                    >
                      Delete
                    </button>
                    <button
                      className="admin-export"
                      onClick={() =>
                        selectAllVisible(showAllUploads ? labelUploads : labelUploads.slice(0, 5), setSelectedUploads)
                      }
                    >
                      Select all
                    </button>
                    <button className="admin-export" onClick={() => clearSelection(setSelectedUploads)}>
                      Clear
                    </button>
                    {labelUploads.length > 5 && (
                      <button className="admin-toggle" onClick={() => setShowAllUploads((prev) => !prev)}>
                        {showAllUploads ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="admin-section">
            <h3>Risk Readings</h3>
            {riskReadings.length === 0 ? (
              <p>No risk readings found.</p>
            ) : (
              <div className={`messages-table-wrapper ${riskSorting ? "messages-table-wrapper--sorting" : ""}`}>
                <table className="messages-table">
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>
                        <SortHeader
                          label="Mode"
                          sortKey="mode"
                          sortState={riskSort}
                          setSortState={setRiskSort}
                          onSort={() => bumpSortAnimation(riskSortTimer, setRiskSorting)}
                        />
                      </th>
                      <th>
                        <SortHeader
                          label="Status"
                          sortKey="status"
                          sortState={riskSort}
                          setSortState={setRiskSort}
                          onSort={() => bumpSortAnimation(riskSortTimer, setRiskSorting)}
                        />
                      </th>
                      <th>Product</th>
                      <th>Barcode</th>
                      <th>
                        <SortHeader
                          label="Risk"
                          sortKey="riskFinalScore"
                          sortState={riskSort}
                          setSortState={setRiskSort}
                          onSort={() => bumpSortAnimation(riskSortTimer, setRiskSorting)}
                        />
                      </th>
                      <th>
                        <SortHeader
                          label="Created At"
                          sortKey="createdAtMs"
                          sortState={riskSort}
                          setSortState={setRiskSort}
                          onSort={() => bumpSortAnimation(riskSortTimer, setRiskSorting)}
                        />
                      </th>
                      <th>Ingredients</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(showAllRiskReadings ? riskReadings : riskReadings.slice(0, 5)).map((reading) => (
                      <tr
                        key={reading.id}
                        className="selectable-row"
                        onClick={(e) =>
                          handleRowSelect(e, reading.id, selectedRiskReadings, setSelectedRiskReadings)
                        }
                      >
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedRiskReadings.includes(reading.id)}
                            onChange={() =>
                              toggleSelect(reading.id, selectedRiskReadings, setSelectedRiskReadings)
                            }
                          />
                        </td>
                        <td>{reading.mode}</td>
                        <td>{reading.status}</td>
                        <td>{reading.productName}</td>
                        <td>{reading.barcode}</td>
                        <td>{reading.riskFinalScore}</td>
                        <td>{reading.createdAt}</td>
                        <td>
                          {reading.ingredientsPreview && reading.ingredientsPreview !== "-" ? (
                            reading.ingredientsPreview.length > 25 ? (
                              <button
                                type="button"
                                className="admin-ingredient-toggle"
                                onClick={() => toggleIngredientPreview(reading.id)}
                              >
                                {expandedIngredients.includes(reading.id)
                                  ? reading.ingredientsPreview
                                  : `${reading.ingredientsPreview.slice(0, 25)}...`}
                              </button>
                            ) : (
                              reading.ingredientsPreview
                            )
                          ) : (
                            "-"
                          )}
                        </td>
                        <td>{reading.error || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {riskReadings.length > 0 && (
                  <div className="admin-table-actions">
                    <button
                      className="admin-export"
                      onClick={() =>
                        downloadCsv(
                          selectedRiskReadings.length
                            ? riskReadings.filter((r) => selectedRiskReadings.includes(r.id))
                            : riskReadings,
                          [
                            { key: "mode", label: "Mode" },
                            { key: "status", label: "Status" },
                            { key: "productName", label: "Product" },
                            { key: "barcode", label: "Barcode" },
                            { key: "riskFinalScore", label: "Risk" },
                            { key: "createdAt", label: "Created At" },
                            { key: "ingredientsPreview", label: "Ingredients" },
                            { key: "error", label: "Error" },
                          ],
                          "risk-readings.csv"
                        )
                      }
                    >
                      Export
                    </button>
                    <button
                      className="admin-delete"
                      onClick={() => handleBulkDelete("riskReadings", selectedRiskReadings)}
                      disabled={!selectedRiskReadings.length || busyId?.startsWith("bulk-riskReadings")}
                    >
                      Delete
                    </button>
                    <button
                      className="admin-export"
                      onClick={() =>
                        selectAllVisible(
                          showAllRiskReadings ? riskReadings : riskReadings.slice(0, 5),
                          setSelectedRiskReadings
                        )
                      }
                    >
                      Select all
                    </button>
                    <button className="admin-export" onClick={() => clearSelection(setSelectedRiskReadings)}>
                      Clear
                    </button>
                    {riskReadings.length > 5 && (
                      <button
                        className="admin-toggle"
                        onClick={() => setShowAllRiskReadings((prev) => !prev)}
                      >
                        {showAllRiskReadings ? "Show less" : "Show more"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </section>
        </>
      ) : null}
      {imageModal && (
        <div className="admin-modal" role="dialog" aria-modal="true" onClick={() => setImageModal("")}>
          <div className="admin-modal__inner" onClick={(e) => e.stopPropagation()}>
            <button className="admin-delete admin-modal__close" onClick={() => setImageModal("")}>
              Close
            </button>
            <img src={imageModal} alt="Label upload enlarged" className="admin-modal__image" />
          </div>
        </div>
      )}
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
