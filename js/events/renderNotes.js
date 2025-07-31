import { getAllNotes } from "../db/funcs/getNotes.js";

export async function renderNotes() {
  const notes = await getAllNotes();
  const container = document.getElementById("notes-list");

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }

  if (notes.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "No notes yet...";
    container.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();

  notes.forEach((note) => {
    const entry = document.createElement("note-entry");
    entry.setAttribute("id", note.id);
    entry.setAttribute("title", note.title);
    entry.setAttribute("content", note.content);
    entry.setAttribute("date", note.date);

    if (note.file) {
      entry.setAttribute("filetype", note.file.type);
      entry.file = note.file;
    }

    fragment.appendChild(entry);
  });

  container.appendChild(fragment);
}

window.addEventListener("DOMContentLoaded", () => {
  customElements.whenDefined("note-entry").then(() => {
    renderNotes();
  });
});
