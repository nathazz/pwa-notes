import { openDB } from "../config.js";

export async function addNoteToDB(note) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('notes', 'readwrite');
    const store = tx.objectStore('notes');

    const request = store.add(note);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}
