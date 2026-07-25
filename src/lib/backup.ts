import { dbAddAutoBackup, dbExportAll, dbPruneAutoBackups } from './storage';
import { uid } from './utils';

const LAST_KEY = 'plandelectie-last-autobackup';
const INTERVAL_MS = 24 * 60 * 60 * 1000; // zilnic
const KEEP = 3;

/**
 * Auto-backup periodic: cel mult o dată pe zi, păstrează ultimele 3 snapshot-uri.
 * Rulat la pornirea aplicației; silențios și neintruziv.
 */
export async function maybeAutoBackup(): Promise<void> {
  try {
    const last = Number(localStorage.getItem(LAST_KEY) ?? '0');
    if (Date.now() - last < INTERVAL_MS) return;
    const data = await dbExportAll();
    if (data.plans.length === 0) return; // nimic de salvat
    await dbAddAutoBackup({ id: uid(), createdAt: new Date().toISOString(), data });
    await dbPruneAutoBackups(KEEP);
    localStorage.setItem(LAST_KEY, String(Date.now()));
  } catch {
    // backup-ul automat nu trebuie să blocheze aplicația
  }
}
