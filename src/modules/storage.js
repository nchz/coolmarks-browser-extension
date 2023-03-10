import { checkLink } from "./core.js"
import { setAdd, setOk, setError, setBang, setQuestion } from "./helpers.js"


function getTabKey(tab) {
  if (typeof (tab) == "object") {
    return tab.id.toString()
  } else {
    return tab.toString()
  }
}

async function saveTabDetails(tab) {
  const { url, title, favIconUrl } = tab
  const [linkDetails] = await checkLink(url)
  // Update action badge.
  if (linkDetails) {
    // TODO add setBang when linkDetails don't match tab details.
    setOk(tab.id)
  } else {
    setAdd(tab.id)
  }
  console.log("saveTabDetails", [tab.id, linkDetails])
  chrome.storage.local.set({
    [getTabKey(tab)]: {
      linkDetails: linkDetails,
      url: url,
      title: title,
      favIconUrl: favIconUrl,
    }
  })
}

async function loadTabDetails(tab) {
  const tabKey = getTabKey(tab)
  const tabDetails = await chrome.storage.local.get(tabKey)
  console.log("loadTabDetails", [tab.id, tabDetails])
  return tabDetails[tabKey]
}

async function removeTabDetails(tabId) {
  await chrome.storage.local.remove(getTabKey(tabId))
  console.log("removeTabDetails", tabId)
}

function printAllKeys() {
  // For debugging.
  chrome.storage.local.get(null).then(console.log)
}

export {
  saveTabDetails,
  loadTabDetails,
  removeTabDetails,
  printAllKeys,
}
