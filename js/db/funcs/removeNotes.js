import { openDB } from "../config.js";

export async function removeNotes(id) {
  if (!id) {
    return;
  }
  const db = await openDB();
  const tx = db.transaction("notes", "readwrite");
  const store = tx.objectStore("notes");

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
