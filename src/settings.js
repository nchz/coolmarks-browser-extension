function getBaseUrl() {
  return chrome.management.getSelf().then(extensionInfo => {
    // Define server url depending on if it's dev or prod.
    switch (extensionInfo.installType) {
      case "development":
        return "http://localhost:8000"
        break
      case "normal":
        return "http://coolmarks.duckdns.org"
        break
      default:
        throw new Error(`Unrecognized installType: ${extensionInfo.installType}`)
    }
  })
}

export {
  getBaseUrl,
}
