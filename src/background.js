import { addLink, deleteLink, getStatus } from "./modules/core.js"
import { saveTabDetails, loadTabDetails, removeTabDetails, printAllKeys } from "./modules/storage.js"
import { setWait, setError } from "./modules/helpers.js"


async function main() {
  // Handle tab events.
  // TODO check if `onReplaced` is necessary.

  chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    // `info` contains the attributes of `tab` that have changed, with their new values.
    if (info.status == "complete") {
      await saveTabDetails(tab)
    } else if (info.status == "loading") {
      // Redirects not yet applied?
      setWait(tabId)
    }
  })

  chrome.tabs.onRemoved.addListener(async (tabId, info) => {
    await removeTabDetails(tabId)
  })

  // Handle click action.

  chrome.action.onClicked.addListener(async tab => {
    setWait(tab.id)
    const tabDetails = await loadTabDetails(tab)
    if (tabDetails) {
      const { linkDetails, url, title, favIconUrl } = tabDetails
      // Either add or delete current tab.
      if (linkDetails) {
        await deleteLink(linkDetails.id).catch(error => {
          setError(tab.id)
          throw error
        })
      } else {
        await addLink(url, title, favIconUrl).catch(error => {
          setError(tab.id)
          throw error
        })
      }
      // Update local storage.
      await saveTabDetails(tab)
    } else {
      // If action click comes before checking tab, just check it.
      await saveTabDetails(tab)
    }
  })
}

chrome.storage.local.clear()
// printAllKeys()

main()

console.log("____________________________________________________________________________________________________")
console.log("____________________________________________________________________________________________________")
console.log("____________________________________________________________________________________________________")
