import { getBaseUrl } from "./settings.js"
import { addLink, deleteLink, updateTags, getStatus } from "./modules/core.js"
import { saveTabDetails, loadTabDetails } from "./modules/storage.js"
import { setWait, setError, cleanTagName } from "./modules/helpers.js"

// TODO If !getStatus().authenticated then redirect to login.

var tab, tabDetails

const buttonAddLink = document.getElementById("add-link")
const buttonDeleteLink = document.getElementById("delete-link")
const buttonUpdateTags = document.getElementById("update-tags")

const inputAddTag = document.getElementById("add-tag")
const spanTagCount = document.getElementById("tag-count")
const divTagList = document.getElementById("tag-list")

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
    buttonUpdateTags.classList.remove("d-none")
    // Show saved metadata.
    const addedDate = new Date(Date.parse(linkDetails.dt))
    const addedString = addedDate.toLocaleString(undefined, { dateStyle: "full", timeStyle: "medium" })
    buttonDeleteLink.nextElementSibling.innerHTML = `Added: ${addedString}`
    // Show saved tags.
    for (const tagName of linkDetails.tags) {
      addTagElem(tagName)
    }
  }
})

function addTagElem(tagName) {
  const tagElem = document.createElement("button")
  tagElem.setAttribute("class", "mb-1 me-1 pt-0 btn btn-sm rounded-pill btn-outline-primary")
  tagElem.addEventListener("click", function () {
    // Focus either next or previous tag on removal.
    const nextElem = this.nextElementSibling
    const prevElem = this.previousElementSibling
    if (nextElem) {
      nextElem.focus()
    } else if (prevElem) {
      prevElem.focus()
    } else {
      inputAddTag.focus()
    }
    // Click a tag to remove it.
    this.remove()
    updateTagCount()
  })
  tagElem.innerHTML = tagName
  divTagList.append(tagElem)
  updateTagCount()
}

function updateTagCount() {
  spanTagCount.innerHTML = divTagList.children.length
}

function collectTags() {
  const tags = []
  for (const tagElem of divTagList.children) {
    tags.push(tagElem.innerHTML)
  }
  return tags
}

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
    itemElem.innerHTML = `<b>${field}:</b> ${JSON.stringify(errorMessage)}`
    errorList.append(itemElem)
  }
  // Make error message visible.
  document.getElementById("error-message").classList.remove("d-none")
  // throw error
}

buttonAddLink.addEventListener("click", async () => {
  const { url, title, favIconUrl } = tabDetails
  const tags = collectTags()
  // TODO Persist session tags.
  setWait(tab.id)
  await addLink(url, title, favIconUrl, tags).then(handleOk).catch(handleError)
})

buttonDeleteLink.addEventListener("click", async () => {
  const { linkDetails } = tabDetails
  setWait(tab.id)
  await deleteLink(linkDetails.id).then(handleOk).catch(handleError)
})

buttonUpdateTags.addEventListener("click", async () => {
  const { linkDetails } = tabDetails
  const tags = collectTags()
  setWait(tab.id)
  await updateTags(linkDetails.id, tags).then(handleOk).catch(handleError)
})

// Add a tag using <input>.
inputAddTag.addEventListener("change", function () {
  const tagName = cleanTagName(this.value)
  this.value = ""
  if (tagName) {
    addTagElem(tagName)
  }
})

// Link to dashboard.
document.getElementById("open-dashboard").setAttribute("href", `${await getBaseUrl()}/api/links/`)
