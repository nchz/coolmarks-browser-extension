import ApiClient from "./core.js"
import { updateActionBadge } from "./helpers.js"


function getTabKey(tab) {
  if (typeof (tab) == "object") {
    return tab.id.toString()
  } else {
    return tab.toString()
  }
}

async function saveTabDetails(tab) {
  // TODO Avoid fetching many times the same info due to this Chrome issue:
  // https://groups.google.com/a/chromium.org/g/chromium-extensions/c/0l5j8gZqatk
  const { url, title, favIconUrl } = tab
  const [linkDetails] = await ApiClient.create().then(client => client.checkLink(url))
  updateActionBadge(tab, linkDetails)
  console.log("saveTabDetails", [tab.id, linkDetails])
  await chrome.storage.local.set({
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

async function saveSessionTags(tags) {
  await chrome.storage.local.set({
    sessionTags: tags
  })
}

async function loadSessionTags() {
  const { sessionTags } = await chrome.storage.local.get("sessionTags")
  return sessionTags || []
}

function printAllKeys() {
  // For debugging.
  chrome.storage.local.get(null).then(console.log)
}

export {
  saveTabDetails,
  loadTabDetails,
  removeTabDetails,
  saveSessionTags,
  loadSessionTags,
  printAllKeys,
}
