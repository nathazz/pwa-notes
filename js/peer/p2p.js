import { addNoteToDB } from "../db/funcs/createNotes.js";
import { getNotebyID } from "../db/funcs/getNotes.js";
import { renderNotes } from "../events/renderNotes.js";

const peer = new Peer(undefined, {
  config: {
    iceServers: [],
  },
});

let incomingConn = null;
let currentConnection = null;

peer.on("open", (id) => {
  document.getElementById("id-peer").innerText = `Your ID: ${id}`;
  document.getElementById("disconnect-btn").style.display = "none";
});

peer.on("connection", (conn) => {
  incomingConn = conn;

  document.getElementById("export-btn").innerText = `Connected: ${conn.peer}`;
  document.getElementById("disconnect-btn").style.display = "inline-block";

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
    document.getElementById("export-btn").innerText = "Send File";
    document.getElementById("disconnect-btn").style.display = "none";
  });

  conn.on("error", () => {
    alert(`Connection error with peer ${conn.peer}`);
    document.getElementById("export-btn").innerText = "Send File";
    incomingConn = null;
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

  document.getElementById("disconnect-btn").style.display = "none";
  document.getElementById("export-btn").innerText = "Send File";
  const statusEl = document.getElementById("connection-status");
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
    try {
      const response = await fetch(note.file);
      fileBlob = await response.blob();
    } catch (err) {
      console.warn(err);
    }
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

  currentConnection.send(payload);

  statusEl.textContent = "File sent";
  statusEl.className = "status-indicator sent";
  document.getElementById("peer-modal").classList.add("hidden");
});
