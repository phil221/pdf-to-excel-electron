import { app, BrowserWindow, ipcMain } from "electron";
import fs from "node:fs";
import path from "node:path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { convert } from "./converter/convert.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

ipcMain.on("convert", async (event, message) => {
  const fileToConvert = fs
    .readdirSync("../Downloads")
    .find((file) => file === message);
  if (fileToConvert) {
    try {
      await convert(`../Downloads/${fileToConvert}`);
      event.sender.send("converted");
    } catch (error) {
      event.sender.send("error", error);
    }
  } else {
    event.sender.send("error", "File not found");
  }
});
