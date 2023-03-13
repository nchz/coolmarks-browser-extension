import { saveTabDetails, removeTabDetails, printAllKeys } from "./modules/storage.js"
import { setWait, setBang } from "./modules/helpers.js"


async function main() {
  // Handle tab events.
  // TODO check if `onReplaced` is necessary.

  chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    // `info` contains the attributes of `tab` that have changed, with their new values.
    if (info.status == "complete") {
      // This may fire many times:
      // https://groups.google.com/a/chromium.org/g/chromium-extensions/c/0l5j8gZqatk
      await saveTabDetails(tab).catch(error => {
        setBang(tabId)
        // TODO Set popup depending on error.
        console.log("[ERROR in background.js]", error)
        console.log("[ERROR in background.js]", error.data)
      })
    } else if (info.status == "loading") {
      // Redirects not yet applied?
      setWait(tabId)
    }
  })

  chrome.tabs.onRemoved.addListener(async (tabId, info) => {
    await removeTabDetails(tabId)
  })
}

chrome.storage.local.clear()
// printAllKeys()

main()

console.log("____________________________________________________________________________________________________")
console.log("____________________________________________________________________________________________________")
console.log("____________________________________________________________________________________________________")
