import { openDB } from "../config.js";

export async function removeNotes(id) {
  const db = await openDB();

  if (!id) {
    return;
  }

  const tx = db.transaction("notes", "readwrite");
  const store = tx.objectStore("notes");

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
