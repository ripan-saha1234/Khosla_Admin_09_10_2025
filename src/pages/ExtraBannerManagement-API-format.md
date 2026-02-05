# Extra Banner Management – API request/response format

Base URL: `https://qixve8qntk.execute-api.ap-south-1.amazonaws.com/dev`

---

## 1. GET banners (list)

**Endpoint:** `GET /banners`  
**Fallback:** `GET /slider?tableType=extrabanners`

| | Earlier | Now |
|---|--------|-----|
| **Request** | No body | No body (unchanged) |
| **Response** | `{ data: [ { position, imageurl, description?, redirecturl?, text?, ... } ] }` or array of same | Same. Each banner can include `redirecturl`. |

---

## 2. POST upload URL (presigned)

**Endpoint:** `POST /banners/upload-url`

| | Earlier | Now |
|---|--------|-----|
| **Request** | `{ "fileExtension": "jpg" }` | Unchanged |
| **Response** | `{ data: { uploadUrl, fileUrl, contentType } }` | Unchanged |

---

## 3. POST upsert banner (create/update after upload)

**Endpoint:** `POST /banners/upsert`

| | Earlier | Now |
|---|--------|-----|
| **Request** | `{ "position": number, "imageurl": string, "description": string, "redirecturl": string, "text": string }` | Same. `redirecturl` is now always sent from the new per-slot “Redirect URL” input (or existing banner value). |
| **Response** | Backend success response | Unchanged |

Earlier, `redirecturl` was often sent as `""` when no value was set. Now the admin can set a redirect URL per banner in the UI, and that value is sent on upsert.

---

## 4. PUT update banner (metadata only)

**Endpoint:** `PUT /banners/:position`

| | Earlier | Now |
|---|--------|-----|
| **Request** | `{ "imageurl": string, "description": string, "redirecturl": string, "text": string }` | Same. `redirecturl` is still sent (from Edit dialog or existing data). |
| **Response** | Backend success response | Unchanged |

---

## 5. DELETE banner

**Endpoint:** `DELETE /banners/:position`

| | Earlier | Now |
|---|--------|-----|
| **Request** | No body | No body (unchanged) |
| **Response** | Backend success response | Unchanged |

---

## Summary

- **GET /banners** – No change; response may include `redirecturl` per banner.
- **POST /banners/upload-url** – No change.
- **POST /banners/upsert** – Same body; `redirecturl` is now populated from the new “Redirect URL” input when uploading.
- **PUT /banners/:position** – No change; still sends `redirecturl`.
- **DELETE /banners/:position** – No change.

No backend contract change is required; the backend already accepts and stores `redirecturl`. The only change is that the admin UI now has a dedicated “Redirect URL” field per banner and sends that value on upload/upsert.
