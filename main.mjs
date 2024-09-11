import { app, BrowserWindow, ipcMain } from "electron";
import { convert } from "./converter/convert.mjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
console.log(__dirname);
console.log(__filename);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("./index.html");

  win.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("convert", (event, message) => {
  const fileToConvert = fs
    .readdirSync("../../Downloads")
    .find((file) => file === message);
  if (fileToConvert) {
    console.log(fs.readFileSync(`../../Downloads/${fileToConvert}`));
    try {
      convert(`../../Downloads/${fileToConvert}`);
      event.sender.send("converted");
    } catch (error) {
      console.log("ERROR: ", error);
      event.sender.send("error", error);
    }
  }
});
