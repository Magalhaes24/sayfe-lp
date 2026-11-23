import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  writeBatch
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { setIgnoreSelf } from "../analytics/tracker";
import Seo from "../components/Seo";
import ConfirmDialog from "../components/ConfirmDialog";
import AnalyticsView from "./AnalyticsView";
import "./Admin.css";
import "./AdminAnalytics.css";

const MAX_BATCHES = 6000;

export default function AdminAnalytics() {
  const navigate = useNavigate();
  const [days, setDays] = useState(30);
  const [rows, setRows] = useState([]);
  const [prevRows, setPrevRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(0);
  const [confirmPurge, setConfirmPurge] = useState(false);
  const [purging, setPurging] = useState(false);
  const [purgeMsg, setPurgeMsg] = useState("");

  // Batches whose retention date (expireAt, ~13 months after writing) has passed.
  const expiredQuery = useCallback(
    (size) => query(collection(db, "analytics_batches"), where("expireAt", "<=", new Date()), limit(size)),
    []
  );

  const countExpired = useCallback(async () => {
    try {
      const snap = await getCountFromServer(
        query(collection(db, "analytics_batches"), where("expireAt", "<=", new Date()))
      );
      setExpired(snap.data().count);
    } catch (err) {
      console.error("Expired count failed:", err);
    }
  }, []);

  const purgeExpired = useCallback(async () => {
    setConfirmPurge(false);
    setPurging(true);
    setPurgeMsg("");
    let deleted = 0;
    try {
      for (;;) {
        const snap = await getDocs(expiredQuery(400));
        if (snap.empty) break;
        const batch = writeBatch(db);
        snap.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
        deleted += snap.size;
        setPurgeMsg(`A apagar… ${deleted} registos`);
      }
      setPurgeMsg(`Apagados ${deleted} registos expirados.`);
    } catch (err) {
      console.error("Purge failed:", err);
      setPurgeMsg(`Erro depois de ${deleted} registos apagados. Tenta de novo.`);
    } finally {
      setPurging(false);
      countExpired();
    }
  }, [expiredQuery, countExpired]);

  const load = useCallback(async (range) => {
    setLoading(true);
    setError("");
    try {
      // Two periods back, so every number can be compared with the one before.
      const from = Date.now() - range * 2 * 86400000;
      const snap = await getDocs(
        query(collection(db, "analytics_batches"), where("ts", ">=", from), orderBy("ts", "desc"), limit(MAX_BATCHES))
      );
      const all = snap.docs.map((d) => d.data());
      const cut = Date.now() - range * 86400000;
      setRows(all.filter((r) => r.ts >= cut));
      setPrevRows(all.filter((r) => r.ts < cut));
    } catch (err) {
      console.error("Analytics load failed:", err);
      const why = err && (err.code || err.message) ? ` (${err.code || err.message})` : "";
      setError(`Não foi possível carregar os dados${why}. Confirma as regras do Firestore e a conta de admin.`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setIgnoreSelf(true); // the owner's browser never counts as a visitor
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/admin", { replace: true });
        return;
      }
      setReady(true);
    });
  }, [navigate]);

  useEffect(() => {
    if (ready) load(days);
  }, [ready, days, load]);

  useEffect(() => {
    if (ready) countExpired();
  }, [ready, countExpired]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(rows, null, 1)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `allercarte-analytics-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="admin-dashboard aa">
      <Seo title="Analytics" canonicalPath="/admin/analytics" siteName="AllerCarte" noindex />
      <div className="admin-dashboard-header">
        <h2>Analytics</h2>
        <div className="admin-dashboard-actions">
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Período">
            <option value={7}>7 dias</option>
            <option value={30}>30 dias</option>
            <option value={90}>90 dias</option>
            <option value={395}>13 meses</option>
          </select>
          <button className="admin-refresh" onClick={() => load(days)} disabled={loading}>
            {loading ? "A carregar…" : "Atualizar"}
          </button>
          <button className="admin-refresh" onClick={exportJson} disabled={!rows.length}>Exportar JSON</button>
          <button className="logout-btn" onClick={() => navigate("/admin/dashboard")}>Voltar</button>
        </div>
      </div>

      {error && <p className="error-message">{error}</p>}
      {(expired > 0 || purgeMsg) && (
        <div className="aa-purge">
          <span>
            {purgeMsg ||
              `${expired} registos já passaram os 13 meses de conservação e devem ser apagados.`}
          </span>
          {expired > 0 && (
            <button className="logout-btn" onClick={() => setConfirmPurge(true)} disabled={purging}>
              {purging ? "A apagar…" : "Apagar expirados"}
            </button>
          )}
        </div>
      )}
      {rows.length >= MAX_BATCHES && (
        <p className="aa-note">Mostrados os {MAX_BATCHES} lotes mais recentes; escolhe um período mais curto para ver tudo.</p>
      )}

      <AnalyticsView rows={rows} prevRows={prevRows} days={days} />

      <ConfirmDialog
        open={confirmPurge}
        title="Apagar registos expirados"
        message={`Vão ser apagados ${expired} registos com mais de 13 meses. Não é possível desfazer.`}
        cancelLabel="Cancelar"
        confirmLabel="Apagar"
        onCancel={() => setConfirmPurge(false)}
        onConfirm={purgeExpired}
      />
    </div>
  );
}
