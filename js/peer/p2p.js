import { getNotebyID } from "../db/funcs/getNotes.js";

const peer = new Peer();

peer.on("open", (id) => {
  document.getElementById("id-peer").innerText = `Your ID: ${id}`;
});

let incomingConn = null;
let currentConnection = null;

peer.on("connection", (conn) => {
  incomingConn = conn;

  document.getElementById("connected-peer-id").innerText = conn.peer;
  document.getElementById("connection-info").style.display = "block";

  conn.on("data", async (zipBlob) => {
    const zip = await JSZip.loadAsync(zipBlob);
    const title = await zip.file("title.txt").async("string");
    const content = await zip.file("content.txt").async("string");
    const fileBlob = await zip.file("attachment.bin").async("blob");
  });

  conn.on("close", () => {
    alert(`Peer ${conn.peer} disconnected.`);
    document.getElementById("connection-info").style.display = "none";
    incomingConn = null;
  });

  conn.on("error", () => {
    alert(`Connection error with peer ${conn.peer}`);
    document.getElementById("connection-info").style.display = "none";
    incomingConn = null;
  });
});

document.getElementById("disconnect-btn").addEventListener("click", () => {
  if (incomingConn) {
    incomingConn.close();
    document.getElementById("connection-info").style.display = "none";
    incomingConn = null;
  }
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

  statusEl.textContent = "Connecting...";
  statusEl.className = "status-indicator connecting";

  currentConnection = peer.connect(targetPeerId);

  currentConnection.on("open", () => {
    statusEl.textContent = "Connected";
    statusEl.className = "status-indicator connected";
  });

  currentConnection.on("error", () => {
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

  if (!currentConnection || currentConnection.open === false) {
    alert("You must connect to a peer first.");
    return;
  }

  if (!noteId) {
    alert("Please enter the Note ID");
    return;
  }

  const note = await getNotebyID(noteId);

  if (!note) {
    alert("Note not found.");
    return;
  }

  const zip = new JSZip();
  zip.file("title.txt", note.title || "Untitled");
  zip.file("content.txt", note.content || "");

  if (note.file) {
    const response = await fetch(note.file);
    const fileBlob = await response.blob();
    zip.file("attachment.bin", fileBlob);
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });

  currentConnection.send(zipBlob);
  statusEl.textContent = "File sent";
  statusEl.className = "status-indicator sent";

  document.getElementById("peer-modal").classList.add("hidden");
});
