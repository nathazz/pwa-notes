import { uuidV4Regex } from "../utils/constants.js";

document.getElementById("open-scanner").addEventListener("click", () => {
  document.getElementById("scanner-modal").classList.remove("hidden");

  const scanner = new Html5QrcodeScanner("reader", {
    qrbox: { width: 250, height: 250 },
    fps: 20,
  });

  scanner.render(
    (result) => {
      if (!uuidV4Regex.test(result)) {
        alert("Invalid Peer Code!");
        return;
      }

      document.getElementById("peer-id").value = result;
      scanner.clear();
      document.getElementById("scanner-modal").classList.add("hidden");
      document.getElementById("reader").innerHTML = "";
    },
    (error) => {
      console.warn("Scan error", error);
    },
  );
});

document.getElementById("close-scanner").addEventListener("click", () => {
  document.getElementById("scanner-modal").classList.add("hidden");
  document.getElementById("reader").innerHTML = "";
});
