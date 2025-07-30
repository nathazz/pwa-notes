import { getAllNotes } from "../db/funcs/getNotes.js";

export async function renderNotes() {
  const notes = await getAllNotes();
  const container = document.getElementById('notes-list');
  container.innerHTML = '';

  if (notes.length === 0) {
    container.innerHTML = '<p> No notes yet...</p>';
    return;
  }

  notes.forEach(note => {
    const entry = document.createElement('note-entry');
    entry.setAttribute('id', note.id)
    entry.setAttribute('title', note.title);
    entry.setAttribute('content', note.content);
    entry.setAttribute('date', note.date);

    if (note.file) {
      entry.setAttribute('filetype', note.file.type);
      entry.file = note.file; 
    }

    container.appendChild(entry);
  });
}

window.addEventListener("DOMContentLoaded", () => {
  renderNotes(); 
});
