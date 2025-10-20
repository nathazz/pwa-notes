import { addNoteToDB } from "../db/funcs/createNotes.js";
import { getNotebyID } from "../db/funcs/getNotes.js";
import { renderNotes } from "../events/renderNotes.js";
import { uuidV4Regex } from "../utils/constants.js";

const peer = new Peer(undefined, {
  config: {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  },
});

let incomingConn = null;
let currentConnection = null;
let homeID = null;

peer.on("open", (id) => {
  homeID = id;
  document.getElementById("id-peer").innerText = `Your ID: ${id}`;
  document.getElementById("disconnect-btn").style.display = "none";

  const qrcodeContainer = document.getElementById("qrcode");
  qrcodeContainer.innerHTML = "";

  new QRCode(qrcodeContainer, {
    text: id,
    width: 80,
    height: 80,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H,
  });
});

peer.on("connection", (conn) => {
  incomingConn = conn;

  const exportBtn = document.getElementById("export-btn");
  const disconnectBtn = document.getElementById("disconnect-btn");
  const statusEl = document.getElementById("connection-status");

  exportBtn.innerText = `Connected: ${conn.peer}`;
  disconnectBtn.style.display = "inline-block";
  statusEl.textContent = "Connected";
  statusEl.className = "status-indicator connected";

  conn.on("data", async (data) => {
    const { meta, file } = data;
    let finalBlob = null;

    if (file) {
      finalBlob = new Blob([file], { type: meta.fileType || undefined });

      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(finalBlob);
      downloadLink.download = meta.title || "note-file";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }

    await addNoteToDB({
      title: meta.title,
      content: meta.content,
      date: new Date(meta.date),
      file: finalBlob,
    });

    await renderNotes();
  });

  conn.on("close", () => {
    alert(`Peer ${conn.peer} disconnected.`);
    incomingConn = null;
    exportBtn.innerText = "Send File";
    disconnectBtn.style.display = "none";
    statusEl.textContent = "Disconnected";
    statusEl.className = "status-indicator disconnected";
  });

  conn.on("error", (err) => {
    console.error("Connection error:", err);
    alert(`Connection error with peer ${conn.peer}`);
    incomingConn = null;
    exportBtn.innerText = "Send File";
    statusEl.textContent = "Disconnected";
    statusEl.className = "status-indicator disconnected";
  });
});

document.getElementById("disconnect-btn").addEventListener("click", () => {
  if (incomingConn) {
    incomingConn.close();
    incomingConn = null;
  }
  if (currentConnection) {
    currentConnection.close();
    currentConnection = null;
  }

  const statusEl = document.getElementById("connection-status");
  document.getElementById("disconnect-btn").style.display = "none";
  document.getElementById("export-btn").innerText = "Send File";
  statusEl.textContent = "Disconnected";
  statusEl.className = "status-indicator disconnected";
});

document.getElementById("export-btn").addEventListener("click", () => {
  document.getElementById("peer-modal").classList.remove("hidden");
});

document.getElementById("close-modal").addEventListener("click", () => {
  document.getElementById("peer-modal").classList.add("hidden");
});

document.getElementById("connect-btn").addEventListener("click", () => {
  const targetPeerId = document.getElementById("peer-id").value.trim();
  const statusEl = document.getElementById("connection-status");

  if (!targetPeerId) {
    alert("Please enter Peer ID to connect.");
    return;
  }

  if (!uuidV4Regex.test(targetPeerId)) {
    alert("Invalid Peer Code!");
    return;
  }

  if (homeID === targetPeerId) {
    alert("Please, don't try to put your own ID");
    return;
  }

  statusEl.textContent = "Connecting...";
  statusEl.className = "status-indicator connecting";

  currentConnection = peer.connect(targetPeerId);

  let timedOut = false;
  const timeout = setTimeout(() => {
    if (!currentConnection?.open) {
      timedOut = true;
      statusEl.textContent = "Timeout. Peer may be offline.";
      statusEl.className = "status-indicator disconnected";
      currentConnection?.close();
    }
  }, 10000);

  currentConnection.on("open", () => {
    if (timedOut) return;
    clearTimeout(timeout);
    statusEl.textContent = "Connected";
    statusEl.className = "status-indicator connected";
  });

  currentConnection.on("error", (err) => {
    console.error("Peer connection error:", err);
    statusEl.textContent = "Disconnected";
    statusEl.className = "status-indicator disconnected";
  });

  currentConnection.on("close", () => {
    statusEl.textContent = "Disconnected";
    statusEl.className = "status-indicator disconnected";
  });
});

document.getElementById("send-note").addEventListener("click", async () => {
  const noteId = document.getElementById("note-id").value.trim();
  const statusEl = document.getElementById("connection-status");

  if (!currentConnection || !currentConnection.open) {
    alert("You must connect to a peer first.");
    return;
  }

  if (!noteId) {
    alert("Please enter the Note ID");
    return;
  }

  const note = await getNotebyID(Number(noteId));
  if (!note) {
    alert("Note not found.");
    return;
  }

  let fileBlob = null;

  if (note.file instanceof Blob) {
    fileBlob = note.file;
  } else if (typeof note.file === "string") {
    const response = await fetch(note.file);
    fileBlob = await response.blob();
  }

  const payload = {
    meta: {
      title: note.title || "Untitled",
      content: note.content || "",
      date: new Date().toISOString(),
      fileType: fileBlob?.type || "",
    },
    file: fileBlob || null,
  };

  try {
    currentConnection.send(payload);
    statusEl.textContent = "File sent";
    statusEl.className = "status-indicator sent";
    document.getElementById("peer-modal").classList.add("hidden");
  } catch (err) {
    console.error("Failed to send note:", err);
    alert("Error sending note. Please try again.");
    statusEl.textContent = "Error";
    statusEl.className = "status-indicator disconnected";
  }
});
