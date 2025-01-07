const { ipcRenderer } = require("electron");

let progressInterval = null;
let progress = null;
let loader = null;
let convertBtn = null;
let output = null;

window.addEventListener("DOMContentLoaded", () => {
  progress = document.getElementById("file");
  loader = document.getElementById("loader");
  convertBtn = document.getElementById("btnConvert");
  output = document.getElementById("output");

  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }

  loader.style.display = "none";
  convertBtn.addEventListener("click", () => {
    if (output.innerText.length > 0) output.innerText = "";
    loader.style.display = "block";
    startProgressLoop();
    setTimeout(() => {
      ipcRenderer.send(
        "convert",
        document.getElementById("inputFile").files[0].name
      );
    }, 2000);
  });
});

window.addEventListener("DOMContentLoaded", () => {
  const inputFile = document.getElementById("inputFile");
  if (inputFile.files.length === 0) convertBtn.disabled = true;
});

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("inputFile").addEventListener("change", () => {
    if (document.getElementById("inputFile").files.length > 0) {
      convertBtn.disabled = false;
    }
  });
});

ipcRenderer.on("converted", () => {
  stopProgressLoop();
  output.innerText = "Successfully converted!";
});

ipcRenderer.on("error", () => {
  stopProgressLoop();
  output.innerText = "Whoops, something went wrong. Please try again.";
});

function startProgressLoop() {
  progressInterval = setInterval(() => {
    if (progress.value < 100) {
      progress.value += 10;
    } else {
      progress.value = 10;
    }
  }, 500);
}

function stopProgressLoop() {
  loader.style.display = "none";
  progress.value = 0;
  clearInterval(progressInterval);
}
