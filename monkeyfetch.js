(() => {
  const originalFetch = window.fetch;

  function createEditor(title, content) {
    return new Promise(resolve => {
      const panel = document.createElement("div");
      panel.style = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 500px;
        height: 400px;
        background: #111;
        color: #fff;
        border: 1px solid #444;
        z-index: 999999;
        padding: 10px;
        font-family: monospace;
        box-shadow: 0 0 15px rgba(0,0,0,0.5);
      `;

      const header = document.createElement("div");
      header.textContent = title;
      header.style.marginBottom = "8px";

      const textarea = document.createElement("textarea");
      textarea.value = content;
      textarea.style = `
        width: 100%;
        height: 300px;
        background: #222;
        color: #0f0;
        border: none;
        resize: none;
        font-family: monospace;
      `;

      const ok = document.createElement("button");
      ok.textContent = "Apply";
      ok.onclick = () => {
        resolve(textarea.value);
        panel.remove();
      };

      const cancel = document.createElement("button");
      cancel.textContent = "Keep Original";
      cancel.style.marginLeft = "10px";
      cancel.onclick = () => {
        resolve(content);
        panel.remove();
      };

      panel.appendChild(header);
      panel.appendChild(textarea);
      panel.appendChild(ok);
      panel.appendChild(cancel);

      document.body.appendChild(panel);
    });
  }

  window.fetch = async (...args) => {
    let [resource, config = {}] = args;

    // OUTGOING REQUEST BODY
    if (config.body) {
      try {
        const pretty = JSON.stringify(JSON.parse(config.body), null, 2);
        const edited = await createEditor("Edit Outgoing Request", pretty);
        config.body = edited;
      } catch {}
    }

    const res = await originalFetch(resource, config);

    // INCOMING RESPONSE BODY
    const contentType = res.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        const text = await res.clone().text();
        const pretty = JSON.stringify(JSON.parse(text), null, 2);

        const edited = await createEditor("Edit Incoming Response", pretty);

        return new Response(edited, {
          status: res.status,
          statusText: res.statusText,
          headers: res.headers
        });
      } catch {}
    }

    return res;
  };

  console.log("FetchMonkey panel enabled");
})();
