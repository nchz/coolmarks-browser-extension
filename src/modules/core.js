import { getBaseUrl } from "../settings.js"


async function getCsrfToken(baseUrl) {
  return chrome.cookies.get({
    name: "csrftoken",
    url: baseUrl,
  }).then(cookie => cookie?.value)
}

class ApiClient {
  constructor() {
    this.baseUrl = null
    this.csrfToken = null
  }

  static async create() {
    // This method should be used to create a client instance.
    const apiClient = new ApiClient()
    apiClient.baseUrl = await getBaseUrl()
    apiClient.csrfToken = await getCsrfToken(apiClient.baseUrl)
    return apiClient
  }

  async _call(method, endpoint, body) {
    console.log("ApiClient._call()", { method, endpoint, body })
    return fetch(`${this.baseUrl}/api/${endpoint}`, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": this.csrfToken,
      },
      body: JSON.stringify(body),
    }).then(async res => {
      const data = res.json().catch(e => { })
      if (res.ok) {
        return data
      } else {
        const error = new Error(`${res.status} ${res.statusText}`)
        error.data = await data
        throw error
      }
    }).then(resData => {
      console.log(`[OK] ${method} ${endpoint}`, { body, resData })
      return resData
    }).catch((error) => {
      console.log(`[ERROR] ${method} ${endpoint}`, { body, error })
      throw error
    })
  }

  checkLink(url) {
    return this._call("POST", "links/check/", {
      location: url,
    })
  }

  listLinks() {
    return this._call("GET", "links/")
  }

  addLink(url, title, favIconUrl, tags) {
    return this._call("POST", "links/", {
      location: url,
      title: title,
      // favIconUrl: favIconUrl,
      tags: tags,
    })
  }

  deleteLink(id) {
    return this._call("DELETE", `links/${id}/`)
  }

  updateTags(id, tags) {
    return this._call("PATCH", `links/${id}/`, {
      tags: tags,
    })
  }

  async getStatus() {
    return fetch(`${this.baseUrl}/status/`).then(r => r.json())
  }
}

// TODO Can't export this due to this dependency:
// ApiClient <= storage.js <= background.js <= Don't allow top-level await.
// export default await ApiClient.create()

export default ApiClient
