function setText(tabId, text) {
  chrome.action.setBadgeText(
    {
      tabId: tabId,
      text: text,
    },
    () => {
      // console.log("badge text changed", [tabId, text])
    },
  )
}

function setWait(tabId) {
  setText(tabId, "...")
}

function setAdd(tabId) {
  setText(tabId, "+")
}

function setOk(tabId) {
  setText(tabId, "✓")
}

function setError(tabId) {
  setText(tabId, "✗")
}

function setBang(tabId) {
  setText(tabId, "!")
}

function setQuestion(tabId) {
  setText(tabId, "?")
}

function setRand(tabId) {
  const rand = getRand()
  setText(tabId, rand)
}

function getRand() {
  return Math.random().toString().slice(2, 6)
}

function updateActionBadge(tab, linkDetails) {
  if (linkDetails) {
    // TODO add setBang when `linkDetails` don't match tab details.
    setOk(tab.id)
  } else {
    setAdd(tab.id)
  }
}

function cleanTag(tag) {
  // NOTE: Keep consistent with backend!
  tag = tag.replace(/[\s|\-|_]+/g, "_")
  tag = tag.replace(/\W/g, "")
  tag = tag.replace(/_+/g, "_")
  tag = tag.replace(/^_+|_+$/g, "")
  tag = tag.replace(/_/g, "-").toLowerCase()
  return tag
}

export {
  setWait,
  setAdd,
  setOk,
  setError,
  setBang,
  setQuestion,
  setRand,
  updateActionBadge,
  cleanTag,
}
