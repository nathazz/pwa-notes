import { allowedTypes, MAX_SIZE } from "../utils/constants.js";
import { addNoteToDB } from "../db/funcs/createNotes.js";
import { renderNotes } from "./renderNotes.js";

const form = document.getElementById("form");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const title = document.getElementById("entry-title").value;
  const content = document.getElementById("entry-content").value;
  const fileInput = document.getElementById("entry-attachment").files;

  if (fileInput.length > 0) {
    const file = fileInput[0];

    const isAllowedType = allowedTypes.some(
      (type) => file.type.startsWith(type) || file.type === type,
    );

    if (!isAllowedType) {
      alert(
        "File type not allowed. Please send images, audios or compressed files.",
      );
      fileInput.value = "";
      return;
    }

    if (file.size > MAX_SIZE) {
      alert("File too large! Maximum allowed size is 15 MB..");
      fileInput.value = "";
      return;
    }
  }

  try {
    await addNoteToDB({
      title,
      content,
      date: new Date(),
      file: fileInput[0] || null,
    });

    form.reset();
    await renderNotes();
  } catch (error) {
    console.error("Erro to save Note:", error);
  }
});
