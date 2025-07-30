import { openDB } from "../config.js";

export async function getAllNotes() {
  const db = await openDB();

  const tx = db.transaction("notes", "readonly");
  const store = tx.objectStore("notes");

  return new Promise((resolve, reject) => {
   
    const request = store.getAll();
    
    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getNotebyID(id){
  const db = await openDB();

  const tx = db.transaction("notes", "readonly");
  const store = tx.objectStore("notes");

  return new Promise((resolve, reject) => {
 
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}