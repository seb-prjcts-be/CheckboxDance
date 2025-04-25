// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    receive: (channel, func) => {
      // Deliberately limit the channels that can be received
      const validChannels = ['window-resize'];
      if (validChannels.includes(channel)) {
        // Renderer process listening for 'window-resize' event
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  }
);

// When DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})
