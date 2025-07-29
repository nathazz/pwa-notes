import { getAllNotes } from "../DB/funcs/getNotes.js";

const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const qrcodeContainer = document.getElementById("overlay-qrcode");
const overlay = document.getElementById("export-overlay");
const closeOverlayBtn = document.getElementById("close-export-overlay");

let peerExport = null;
let peerImport = null;
let connection = null;

function generateQRCode(text) {
  qrcodeContainer.innerHTML = "";
  new QRCode(qrcodeContainer, {
    text,
    width: 256,
    height: 256,
    correctLevel: QRCode.CorrectLevel.H,
  });
}

function addNoteToUI(title, content) {
  const notesList = document.getElementById("notes-list");
  const article = document.createElement("article");
  article.innerHTML = `<h3>${title}</h3><p>${content}</p>`;
  notesList.appendChild(article);
}

function initExportPeer() {
  if (peerExport) {
    peerExport.destroy();
    peerExport = null;
  }

  peerExport = new Peer();

  peerExport.on("open", (id) => {
    generateQRCode(id);
    overlay.style.display = "flex";

    let existingIdText = document.getElementById("peer-id-text");
    if (!existingIdText) {
      existingIdText = document.createElement("p");
      existingIdText.id = "peer-id-text";
      existingIdText.style.userSelect = "all";
      existingIdText.style.marginTop = "10px";
      existingIdText.style.fontWeight = "bold";
      existingIdText.style.color = "#333";
      qrcodeContainer.parentNode.appendChild(existingIdText);
    }
    existingIdText.textContent = `Peer ID: ${id}`;
  });

  peerExport.on("connection", (conn) => {
    console.log("Incoming connection from:", conn.peer);
    connection = conn;

 connection.on("data", (data) => {
  console.log("Data received:", data);

  if (data instanceof ArrayBuffer) {
    const blob = new Blob([data]);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "received_file";
    a.click();
    alert("File received and downloaded!");
  }

  else if (typeof data === "object" && data !== null) {
    if (Array.isArray(data.allNotes)) {
      data.allNotes.forEach((note) => {
        addNoteToUI(note.title || "(no title)", note.content || "(no content)");
      });
      alert("All notes received!");
    }
    else if (data.title || data.content) {
      addNoteToUI(data.title, data.content);
      alert("Note received!");
    }
  }

  else {
    console.warn("Unknown data received:", data);
  }
});

    connection.on("error", (err) => {
      console.error("Connection error:", err);
      alert("Connection error: " + err);
    });
  });

  peerExport.on("error", (err) => {
    console.error("Peer error:", err);
    alert("Peer error: " + err);
  });
}

async function sendNoteOrFile() {
  if (!connection || connection.open === false) {
    alert("No open connection to send data!");
    return;
  }

  const title = document.getElementById("entry-title").value.trim();
  const content = document.getElementById("entry-content").value.trim();
  const fileInput = document.getElementById("entry-attachment");
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      connection.send(reader.result);
      alert(`File "${file.name}" sent!`);
    };
    reader.readAsArrayBuffer(file);
    return;
  }

  if (title || content) {
    connection.send({ title, content });
    alert("Note sent!");
    return;
  }
B
  try {
    const allNotes = await getAllNotes();
    connection.send({ allNotes });
    alert("All notes sent!");
  } catch (error) {
    console.error("Failed to get all notes:", error);
    alert("Error getting notes.");
  }
}

function initImportPeerAndConnect(peerId) {
  if (peerImport) {
    peerImport.destroy();
    peerImport = null;
  }

  peerImport = new Peer();

  peerImport.on("open", () => {
    console.log("Import Peer opened, connecting to:", peerId);
    connection = peerImport.connect(peerId);

    connection.on("open", () => {
      console.log("Connection opened with peer", peerId);
      sendAllNotes();  
    });

    connection.on("error", (err) => {
      console.error("Connection error:", err);
      alert("Connection error: " + err);
    });
  });

  peerImport.on("error", (err) => {
    console.error("Import Peer error:", err);
    alert("Import peer error: " + err);
  });
}

exportBtn.addEventListener("click", () => {
  initExportPeer();
});

importBtn.addEventListener("click", () => {
  const peerId = prompt("Enter the peer ID from the QR code:");
  if (!peerId) {
    alert("You must enter a valid peer ID!");
    return;
  }
  initImportPeerAndConnect(peerId);
});

closeOverlayBtn.addEventListener("click", () => {
  overlay.style.display = "none";
});
