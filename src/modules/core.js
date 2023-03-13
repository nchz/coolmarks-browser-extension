import { getBaseUrl } from "../settings.js"


const actions = {
  CHECK: {
    url: "links/check/",
    method: "POST",
  },
  LIST: {
    url: "links/",
    method: "GET",
  },
  ADD: {
    url: "links/",
    method: "POST",
  },
  DELETE: {
    url: "links/<id>/",
    method: "DELETE",
  },
  UPDATE: {
    url: "links/<id>/",
    method: "PATCH",
  },
}

async function getCsrfToken() {
  return chrome.cookies.get({
    name: "csrftoken",
    url: await getBaseUrl(),
  }).then(cookie => cookie?.value)
}

async function api(action, data) {
  const { id, ...postData } = data
  const urlSuffix = action.url.replace("<id>", id)

  const baseUrl = await getBaseUrl()
  return fetch(`${baseUrl}/api/${urlSuffix}`, {
    method: action.method,
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": await getCsrfToken(),
    },
    body: JSON.stringify(postData),
  }).then(async res => {
    if (res.ok) {
      return action.method == "DELETE" ? {} : res.json()
    } else {
      const error = new Error(`${res.status} ${res.statusText}`)
      error.data = await res.json()
      throw error
    }
  })
    .then(resData => {
      console.log(`[OK] ${action.method} ${action.url}`, { data, resData })
      return resData
    })
    .catch(error => {
      console.log(`[ERROR] ${action.method} ${action.url}`, { data, error })
      throw error
    })
}

function checkLink(url) {
  return api(actions.CHECK, {
    location: url,
  })
}

function addLink(url, title, favIconUrl, tags) {
  return api(actions.ADD, {
    location: url,
    title: title,
    // favIconUrl: favIconUrl,
    tags: tags,
  })
}

function deleteLink(linkId) {
  return api(actions.DELETE, {
    id: linkId,
  })
}

function updateTags(linkId, tags) {
  return api(actions.UPDATE, {
    id: linkId,
    tags: tags,
  })
}

async function getStatus() {
  const baseUrl = await getBaseUrl()
  return fetch(`${baseUrl}/status/`).then(r => r.json())
}

export {
  checkLink,
  addLink,
  deleteLink,
  updateTags,
  getStatus,
}
