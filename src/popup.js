import { getBaseUrl } from "./settings.js"
import { addLink, deleteLink, getStatus } from "./modules/core.js"
import { saveTabDetails, loadTabDetails } from "./modules/storage.js"
import { setWait, setError, cleanTag } from "./modules/helpers.js"

// TODO If !getStatus().authenticated then redirect to login.

var tab, tabDetails

const buttonAddLink = document.getElementById("add-link")
const buttonDeleteLink = document.getElementById("delete-link")
const tagList = document.getElementById("tag-list")
const errorList = document.getElementById("error-list")

// Read tab (just once) when popup is opened.
chrome.tabs.query({
  currentWindow: true,
  active: true
}).then(async tabs => {
  tab = tabs[0]
  tabDetails = await loadTabDetails(tab)
  if (!tabDetails) {
    // If action click comes before checking the tab, just check it.
    // This avoids the need to refresh the tab.
    await saveTabDetails(tab)
    tabDetails = await loadTabDetails(tab)
  }
  const { linkDetails } = tabDetails
  // Show either Add or Delete <button>.
  if (linkDetails) {
    buttonAddLink.classList.add("d-none")
    buttonDeleteLink.classList.remove("d-none")
  }
})

async function handleOk(res) {
  // Update local storage and close popup.
  await saveTabDetails(tab)
  window.close()
}

function handleError(error) {
  setError(tab.id)
  // Clean previous error message (if any).
  for (const elem of errorList.children) {
    elem.remove()
  }
  // Set error message.
  for (const [field, errorMessage] of Object.entries(error.data)) {
    const itemElem = document.createElement("li")
    itemElem.innerHTML = `<b>${field}:</b> ${errorMessage}`
    errorList.append(itemElem)
  }
  // Make error message visible.
  document.getElementById("error-message").classList.remove("d-none")
  // throw error
}

buttonAddLink.addEventListener("click", async () => {
  const tags = []
  for (const tag of tagList.children) {
    tags.push(tag.innerHTML)
  }
  // TODO Persist session tags.
  // TODO Allow "extra tags".

  const { url, title, favIconUrl } = tabDetails
  setWait(tab.id)
  await addLink(url, title, favIconUrl, tags).then(handleOk).catch(handleError)
})

buttonDeleteLink.addEventListener("click", async () => {
  const { linkDetails } = tabDetails
  setWait(tab.id)
  await deleteLink(linkDetails.id).then(handleOk).catch(handleError)
})

// Add a tag using <input>.
document.getElementById("add-tag").addEventListener("change", function () {
  const tag = cleanTag(this.value)
  this.value = ""
  if (tag) {
    const tagElem = document.createElement("span")
    tagElem.setAttribute("class", "badge rounded-pill bg-primary")
    tagElem.addEventListener("click", function () { this.remove() })
    tagElem.innerHTML = tag
    tagList.append(tagElem)
  }
})

// Click a tag to remove it.
document.querySelectorAll(".-tag").forEach(elem => {
  elem.addEventListener("click", function () { this.remove() })
})

// Link to dashboard.
document.getElementById("open-dashboard").setAttribute("href", `${await getBaseUrl()}/links/`)
