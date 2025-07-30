import { removeNotes } from "../db/funcs/removeNotes.js";

document.addEventListener("deletenote", async (e) => {
  const id = e.detail.id;

  try {
    await removeNotes(id);
    e.target.remove();
  } catch (err) {
    console.error("Failed to delete note:", err);
  }
});
