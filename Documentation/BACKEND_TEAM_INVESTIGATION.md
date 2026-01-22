# Backend Team: API Endpoint & 403 Error Investigation

## Executive Summary

The frontend is experiencing **403 Forbidden** errors when creating tasks. We've identified and fixed several API mismatches in the frontend code, but need backend team verification to ensure everything aligns.

## Fixes Applied in Frontend

### 1. ✅ Login Token Field Mismatch - FIXED
**Issue:** Frontend expected `accessToken` but backend returns `token`

**Documentation Says:**
```json
{
  "token": "string (JWT token)",
  "refreshToken": "string (Refresh token)",
  "expiresIn": 3600,
  "tokenType": "Bearer"
}
```

**Frontend Previously Used:**
```typescript
interface LoginResponse {
    accessToken: string;  // ❌ WRONG
    ...
}
```

**Frontend Now Uses:**
```typescript
interface LoginResponse {
    token: string;  // ✅ CORRECT
    ...
}
```

**Impact:** This was likely the PRIMARY CAUSE of 403 errors. Token was `undefined`, so requests had `Authorization: Bearer undefined`.

---

### 2. ✅ getCurrentUser Method - FIXED
**Documentation Says:** `POST /api/auth/me`

**Frontend Previously Used:** `GET /api/auth/me` ❌

**Frontend Now Uses:** `POST /api/auth/me` ✅

---

## Questions for Backend Team

### 🔴 CRITICAL: Task Creation 403 Error

**Endpoint:** `POST /api/projects/{projectId}/tasks`

**Documentation Says:**
- Requires: `Authorization: Bearer {token}`
- Returns 403 if: "User is not a member of the workspace"

**Questions:**
1. How does the backend verify workspace membership when only `projectId` is provided in the URL?
   - Does it lookup the project → workspace → membership?
   - Or does it expect workspace context in the JWT token?

2. What information is in the JWT token claims?
   - Does it include `userId`?
   - Does it include `workspaceId` or workspace memberships?
   - Can you share an example decoded JWT payload?

3. When a 403 is returned for task creation, what is the exact error message/data in the response body?

---

### 🟡 IMPORTANT: Project Endpoint Inconsistency

**Documentation Shows:**
- Create: `POST /api/workspaces/{workspaceId}/projects` ✅
- List: `GET /api/workspaces/{workspaceId}/projects` ✅
- **Get Single:** `GET /api/workspaces/{workspaceId}/projects/{projectId}` ❓
- **Update:** `PUT /api/workspaces/{workspaceId}/projects/{projectId}` ❓
- **Delete:** `DELETE /api/workspaces/{workspaceId}/projects/{projectId}` ❓

**Frontend Currently Uses:**
- **Get Single:** `GET /api/projects/{projectId}` ⚠️
- **Update:** `PUT /api/projects/{projectId}` ⚠️
- **Delete:** `DELETE /api/projects/{projectId}` ⚠️

**Questions:**
1. Does the backend support BOTH patterns?
   - Full path: `/api/workspaces/{workspaceId}/projects/{projectId}`
   - Short path: `/api/projects/{projectId}`

2. If backend only supports full path, we need to update frontend code

3. Why do some endpoints (columns, tasks) use short path but projects don't?
   - Columns: `GET /api/projects/{projectId}/columns` ✅
   - Tasks: `GET /api/projects/{projectId}/tasks` ✅
   - Projects: `GET /api/projects/{projectId}` ❓

---

## API Endpoint Reference

### ✅ Endpoints Confirmed Working in Frontend

```
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/me
GET    /api/workspaces
POST   /api/workspaces
GET    /api/workspaces/{workspaceId}/projects
POST   /api/workspaces/{workspaceId}/projects
GET    /api/workspaces/{workspaceId}/members
POST   /api/workspaces/{workspaceId}/members
GET    /api/projects/{projectId}/columns
GET    /api/projects/{projectId}/tasks
PUT    /api/tasks/{taskId}
PATCH  /api/tasks/{taskId}/move
DELETE /api/tasks/{taskId}
```

### ⚠️ Endpoints Potentially Incorrect

```
GET    /api/projects/{projectId}           → Should be /api/workspaces/{wId}/projects/{pId} ?
PUT    /api/projects/{projectId}           → Should be /api/workspaces/{wId}/projects/{pId} ?
DELETE /api/projects/{projectId}           → Should be /api/workspaces/{wId}/projects/{pId} ?
```

### ❌ Endpoint Causing 403 Error

```
POST   /api/projects/{projectId}/tasks     → Returns 403 Forbidden
```

---

## Task Creation Request Details

**Endpoint:** `POST /api/projects/{projectId}/tasks`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {JWT token from login}
```

**Request Body:**
```json
{
  "title": "Task title",
  "description": "Optional description",
  "columnId": 1,
  "assignedTo": 2,
  "priority": "MEDIUM",
  "dueDate": "2025-01-20"
}
```

**Expected Response (201 Created):**
```json
{
  "id": 1,
  "title": "Task title",
  "projectId": 1,
  "columnId": 1,
  ...
}
```

**Actual Response (403 Forbidden):**
```
Status: 403
Body: ??? (what error message does backend return?)
```

---

## Debugging Steps for Backend Team

### 1. Verify Token Handling
- Log the incoming `Authorization` header in task creation endpoint
- Decode the JWT and log the claims
- Verify userId is extracted correctly from token

### 2. Verify Workspace Membership Check
- Log the workspace membership lookup process
- Which workspace is being checked? (derived from projectId?)
- Is the user ID from JWT matched against workspace members?
- Are there any NULL/undefined values in the check?

### 3. Verify Project → Workspace Lookup
- When `POST /api/projects/{projectId}/tasks` is called
- How does backend determine which workspace to check?
- Is there a JOIN query: `projects` → `workspaces` → `workspace_members`?
- Are there any database query errors or NULL results?

### 4. Check Error Response Format
- What exact message is returned in the 403 response body?
- Is it a string or JSON object?
- Frontend expects: `error.response.data` to contain the message

---

## Frontend Debug Logs Now Available

We've added comprehensive logging. When testing, you'll see in browser console:

```
🔑 API Request: POST /api/projects/1/tasks
🔑 Token present: true (eyJhbGciOiJIUzI1...)
❌ API Error: POST /api/projects/1/tasks
❌ Status: 403
❌ Error data: {error message from backend}
```

This will help identify exactly what's failing.

---

## Test Scenario

### Setup
1. User registers: `POST /api/auth/register`
2. User logs in: `POST /api/auth/login` → receives token
3. User creates workspace: `POST /api/workspaces` (becomes owner)
4. User creates project in workspace: `POST /api/workspaces/1/projects`
5. User views project board: Navigates to `/workspace/1/project/1`
6. User clicks "Create Task"

### Expected Result
- Task created successfully (201 Created)

### Actual Result
- 403 Forbidden

### Questions
- At step 5, does the user appear as a workspace member in database?
- At step 6, what does backend log when membership check fails?
- Is there a race condition between creating workspace and membership record?

---

## Next Steps

### Frontend Side (Waiting for Backend Clarification)
1. ⏳ Test with fixes applied
2. ⏳ Verify token is now stored correctly
3. ⏳ Update project endpoints if backend requires full path
4. ⏳ Add any additional headers/parameters backend needs

### Backend Side (Needs Investigation)
1. 🔍 Verify task creation endpoint authorization logic
2. 🔍 Confirm project endpoint paths (full vs short)
3. 🔍 Share JWT token structure/claims
4. 🔍 Share exact 403 error response format
5. 🔍 Test workspace membership verification

---

## Contact

Frontend changes are in PR: `copilot/fix-403-error-creating-task`

All logs will show in browser console with emojis:
- 🔑 Auth/token related
- ✅ Successful API calls
- ❌ Failed API calls
- 🚫 401 errors

Please share backend logs for the failing request so we can compare both sides.
