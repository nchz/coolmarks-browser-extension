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

export {
  setWait,
  setAdd,
  setOk,
  setError,
  setBang,
  setQuestion,
  setRand,
}
