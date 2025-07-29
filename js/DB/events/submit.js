import { allowedTypes, MAX_SIZE } from "../../utils/constants.js";
import { addNoteToDB } from "../funcs/addNotes.js";
import { renderNotes } from "./get.js";


const form = document.getElementById('form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = document.getElementById('entry-title').value;
  const content = document.getElementById('entry-content').value;
  const fileInput = document.getElementById('entry-attachment');

  const files = fileInput.files;
  const date = new Date();

  if (files.length > 0) {
    const file = files[0];

    const isAllowedType = allowedTypes.some(
      (type) => file.type.startsWith(type) || file.type === type
    );

    if (!isAllowedType) {
      alert('File type not allowed. Please send images, audios or compressed files.');
      fileInput.value = '';
      return;
    }

    if (file.size > MAX_SIZE) {
      alert('File too large! Maximum allowed size is 15 MB..');
      fileInput.value = '';
      return;
    }
  }

  try {
    const id = await addNoteToDB({
      title,
      content,
      date,
      file: files[0] || null,
    });

    console.log('save with id:', id);
    form.reset();
    await renderNotes();   
  } catch (error) {
    console.error('Erro to save Note:', error);
  }
});
