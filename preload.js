const { ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnConvert").addEventListener("click", () => {
    ipcRenderer.send(
      "convert",
      document.getElementById("inputFile").files[0].name
    );
  });
});

window.addEventListener("DOMContentLoaded", () => {
  const convertBtn = document.getElementById("btnConvert");
  const inputFile = document.getElementById("inputFile");
  if (inputFile.files.length === 0) convertBtn.disabled = true;
});

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("inputFile").addEventListener("change", () => {
    if (document.getElementById("inputFile").files.length > 0) {
      document.getElementById("btnConvert").disabled = false;
    }
  });
});

ipcRenderer.on("converted", () => {
  document.getElementById("output").innerText = "Successfully converted!";
});

ipcRenderer.on("error", () => {
  document.getElementById("output").innerText = "Hmmm, something went wrong...";
});
