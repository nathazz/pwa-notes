document.addEventListener("DOMContentLoaded", () => {
  const footer = document.getElementById("footer");
  const btn = document.getElementById("installButton");
  document.getElementById("year").textContent = new Date().getFullYear();

  const setLayout = (withButton) =>
    footer.classList.toggle("footer-flex", withButton);
  const hideButtonAndCenter = () => {
    if (btn) btn.style.display = "none";
    setLayout(false);
  };

  if (window.matchMedia("(display-mode: standalone)").matches) {
    hideButtonAndCenter();
  }

  if (!("BeforeInstallPromptEvent" in window)) {
    if (btn) btn.remove();
    hideButtonAndCenter();
    return;
  }

  let deferredPrompt;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    btn.style.display = "inline-block";
    setLayout(true);
  });

  btn.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    btn.style.display = "none";
    const { outcome } = await deferredPrompt.prompt();
    deferredPrompt = null;

    if (outcome === "accepted") {
      alert("PWA installed!");
      hideButtonAndCenter();
      return;
    }

    n;
    btn.style.display = "inline-block";
    setLayout(true);
  });

  window.addEventListener("appinstalled", hideButtonAndCenter);
});
