(() => {
  const originalFetch = window.fetch;

  window.fetch = async (...args) => {
    const res = await originalFetch(...args);

    // Only attempt JSON responses
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return res;
    }

    try {
      const clone = res.clone();
      const text = await clone.text();

      console.log("Original response:", text);

      const edited = prompt("Edit JSON response:", text);

      if (edited === null) {
        return res; // cancel = keep original
      }

      return new Response(edited, {
        status: res.status,
        statusText: res.statusText,
        headers: res.headers
      });

    } catch (e) {
      console.error("Interceptor error:", e);
      return res;
    }
  };

  console.log("fetch interceptor enabled");
})();
