document.addEventListener("DOMContentLoaded", () => {
  const pageId = document.body.dataset.pageId || location.pathname.split("/").pop().replace(/\.html$/i, "") || "index";
  const storageKey = `xunxin-editable-template-v3:${pageId}`;
  const emptyMarker = document.documentElement.dataset.emptyMarker || "\u8bf7\u586b\u5199";
  const photoInput = document.getElementById("photoInput");
  const photoImg = document.getElementById("photoImg");
  const editableFields = Array.from(document.querySelectorAll("[contenteditable][data-key]"));

  function collectData() {
    const data = {};
    editableFields.forEach((field) => {
      data[field.dataset.key] = field.textContent.trim();
    });
    data.photo = photoImg.src;
    return data;
  }

  function saveData() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(collectData()));
    } catch (error) {
      console.warn("save failed", error);
    }
  }

  function loadData() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;

      const data = JSON.parse(raw);
      editableFields.forEach((field) => {
        const value = data[field.dataset.key];
        if (typeof value === "string") field.textContent = value;
      });
      if (typeof data.photo === "string" && data.photo) {
        photoImg.src = data.photo;
      }
    } catch (error) {
      console.warn("load failed", error);
    }
  }

  async function loadDefaultData() {
    try {
      const response = await fetch(`data/${pageId}.json`, { cache: "no-store" });
      if (!response.ok) return;

      const data = await response.json();
      editableFields.forEach((field) => {
        const value = data[field.dataset.key];
        if (typeof value === "string") field.textContent = value;
      });
      if (typeof data.photo === "string" && data.photo) {
        photoImg.src = data.photo;
      }
    } catch (error) {
      console.warn("default data load failed", error);
    }
  }

  let saveTimer = 0;

  editableFields.forEach((field) => {
    field.addEventListener("input", () => {
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(saveData, 250);
    });

    field.addEventListener("focus", () => {
      if (field.textContent.trim() === emptyMarker) {
        field.textContent = "";
      }
    });

    field.addEventListener("blur", () => {
      if (!field.textContent.trim()) {
        field.textContent = emptyMarker;
      }
      saveData();
    });
  });

  photoInput.addEventListener("change", () => {
    const file = photoInput.files && photoInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      photoImg.src = reader.result;
      saveData();
    });
    reader.readAsDataURL(file);
  });

  loadDefaultData().then(loadData);
});
