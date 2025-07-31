class NoteEntry extends HTMLElement {
  static get observedAttributes() {
    return ["id", "title", "content", "date", "filetype"];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this._file = null;
  }

  /**
   * @param {any} blob
   */
  set file(blob) {
    this._file = blob;
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString();
  }

  render() {
    const id = this.getAttribute("id") || "";
    const title = this.getAttribute("title") || "";
    const content = this.getAttribute("content") || "";
    const date = this.getAttribute("date") || "";
    const filetype = this.getAttribute("filetype") || "";

    let fileContent = "";

    if (this._file) {
      const url = URL.createObjectURL(this._file);

      if (filetype.startsWith("image/")) {
        fileContent = `<img src="${url}" class="note-image" alt="Image" style="max-width: 75%; max-height: 150px; margin: 0.75rem auto 0; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);" />
      `;
      } else if (filetype.startsWith("audio/")) {
        fileContent = `<audio controls src="${url}" style="margin-top: 0.5rem;"></audio>`;
      } else {
        fileContent = `<a href="${url}" download style="display: block; margin-top: 0.5rem;">📎 Download File</a>`;
      }
    }

    this.shadow.innerHTML = `
    <style>
      article {
        border: 1px solid #ddd;
        padding: 1rem;
        border-radius: 8px;
        background: #fff;
        margin-bottom: 1rem;
        position: relative;
      }

      h3 {
        margin: 0 0 0.5rem 0;
      }

      small {
        display: block;
        color: #888;
        margin-bottom: 0.5rem;
      }

      span {
        color: #3b82f6;
      }

      button.delete-btn {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: #ef4444;
        color: white;
        border: none;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        cursor: pointer;
      }
    </style>
    <article>
      <button class="delete-btn">Delete</button>
      <h3><span>${id}</span> - ${title}</h3>
      <small>${this.formatDate(date)}</small>
      <p>${content}</p>
      ${fileContent}
    </article>
  `;

    const deleteButton = this.shadow.querySelector(".delete-btn");
    deleteButton.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("deletenote", {
          detail: { id: Number(id) },
          bubbles: true,
          composed: true,
        }),
      );
    });
  }
}

customElements.define("note-entry", NoteEntry);
