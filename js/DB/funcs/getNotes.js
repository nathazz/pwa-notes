import { openDB } from "../config.js";

export async function getAllNotes(id = null) {
  const db = await openDB();

  const tx = db.transaction("notes", "readonly");
  const store = tx.objectStore("notes");

  return new Promise((resolve, reject) => {
    let request;

    if (id === null) {
      request = store.getAll();
    } else {
      request = store.get(id);
    }

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
