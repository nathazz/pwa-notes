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
        fileContent = `<img src="${url}" class="note-image" alt="Image" />`;
      } else if (filetype.startsWith("audio/")) {
        fileContent = `<audio controls src="${url}" class="note-audio"></audio>`;
      } else {
        fileContent = `<a href="${url}" download class="note-download">📎 Download File</a>`;
      }
    }

    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
        }

        article {
          border: 1px solid var(--border, #e2e8f0);
          border-left: 4px solid var(--primary, #0ea5e9);
          padding: 1.25rem;
          border-radius: var(--radius, 12px);
          background: var(--card, #ffffff);
          box-shadow: var(--shadow, 0 1px 3px rgba(0,0,0,0.1));
          margin-bottom: 1.25rem;
          position: relative;
          transition: var(--transition, all 0.2s ease);
        }

        article:hover {
          box-shadow: var(--shadow-lg, 0 10px 15px -3px rgba(0,0,0,0.1));
          transform: translateY(-2px);
        }

        h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text, #1e293b);
        }

        span {
          color: var(--primary-dark, #0284c7);
        }

        small {
          display: block;
          color: var(--text-light, #64748b);
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        p {
          color: var(--text, #1e293b);
          line-height: 1.5;
        }

        .note-image {
          display: block;
          max-width: 100%;
          max-height: 180px;
          margin: 1rem auto 0;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .note-audio {
          display: block;
          margin-top: 1rem;
          width: 100%;
        }

        .note-download {
          display: inline-block;
          margin-top: 1rem;
          color: var(--primary, #0ea5e9);
          text-decoration: none;
          font-weight: 600;
        }

        .note-download:hover {
          text-decoration: underline;
        }

        button.delete-btn {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: #ef4444;
          color: white;
          border: none;
          padding: 0.4rem 0.75rem;
          border-radius: 6px;
          font-size: 0.85rem;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          transition: background 0.2s;
        }

        button.delete-btn:hover {
          background: #dc2626;
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
