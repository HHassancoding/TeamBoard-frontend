# Troubleshooting 403 Error on Task Creation

## Problem
Users receive a **403 Forbidden** error when attempting to create tasks.

## Root Causes & Fixes

### 1. Authentication Token Mismatch ✅ FIXED
**Problem:** The backend returns `token` in the login response, but the frontend was looking for `accessToken`.

**Symptom:** Token was being stored as `undefined` in localStorage, causing all authenticated requests to fail.

**Fix Applied:**
- Updated `LoginResponse` interface to use `token` instead of `accessToken`
- Updated login function to store `response.data.token`

**Files Changed:**
- `src/services/authService.ts`

### 2. getCurrentUser Method Mismatch ✅ FIXED
**Problem:** Frontend used `GET /api/auth/me` but backend expects `POST /api/auth/me`.

**Fix Applied:**
- Changed getCurrentUser to use POST instead of GET

**Files Changed:**
- `src/services/authService.ts`

### 3. Enhanced Error Logging ✅ ADDED
**Added console logging to help debug issues:**
- API request logging (method, URL, token presence)
- API response logging (status, data)
- Detailed error logging for failed requests
- User-friendly 403 error message

**Files Changed:**
- `src/services/api.ts`
- `src/components/Board/CreateTaskModal.tsx`

## How to Test the Fix

### Prerequisites
1. Ensure backend is running and accessible
2. Create a `.env.local` file with:
   ```
   VITE_API_BASE_URL=http://localhost:8080
   ```
   Or for production:
   ```
   VITE_API_BASE_URL=https://teamboard-backend.onrender.com
   ```

### Test Steps
1. **Clear existing tokens:**
   - Open browser DevTools → Application → Local Storage
   - Delete `accessToken` and `refreshToken`
   - Or run: `localStorage.clear()`

2. **Login again:**
   - Navigate to login page
   - Enter credentials
   - Check console for: `"🔑 API Request: POST /api/auth/login"`
   - Verify login response in console

3. **Verify token storage:**
   - Open DevTools → Application → Local Storage
   - Confirm `accessToken` exists and has a value (not undefined)
   - Should start with something like: `eyJhbGciOiJIUzI1NiI...`

4. **Navigate to a project board:**
   - Should see: `"🔑 Token present: true (eyJhbGciOiJIUzI1...)"`
   - If you see `"🔑 Token present: false"`, the token wasn't stored correctly

5. **Try creating a task:**
   - Click "Create Task" button
   - Fill in task details
   - Submit
   - Check console for API logs

6. **Expected console output:**
   ```
   🔑 API Request: POST /api/projects/1/tasks
   🔑 Token present: true (eyJhbGciOiJIUzI1...)
   ✅ API Response: POST /api/projects/1/tasks 201
   ```

7. **If you still get 403:**
   Check the console logs for:
   ```
   ❌ API Error: POST /api/projects/1/tasks
   ❌ Status: 403
   ❌ Error data: <error message from backend>
   ```

## Remaining Potential Issues

### Issue A: User Not Actually a Workspace Member
**Symptom:** 403 error with message "You are not a member of this workspace"

**Cause:** The user account is not added as a member to the workspace.

**Solution:**
1. Have workspace owner invite the user
2. Or add the user through the workspace members UI
3. Backend team: Verify workspace membership checking logic

### Issue B: Token Claims Missing Workspace Info
**Symptom:** 403 error even though user is a workspace member

**Cause:** JWT token might not contain necessary claims for workspace membership validation.

**Backend Investigation Needed:**
- Does the JWT token include user ID?
- Does the backend correctly lookup workspace membership from user ID + project ID?
- Is there a race condition in membership verification?

### Issue C: Project Endpoint Mismatch
**Current Status:** Under investigation

**Frontend uses:** `GET /api/projects/{projectId}`
**Documentation shows:** `GET /api/workspaces/{workspaceId}/projects/{projectId}`

**Next Steps:**
- Test if backend supports both patterns
- If not, update frontend to use full path with workspaceId

## Debugging Checklist

When encountering 403 errors:

- [ ] Check browser console for detailed error logs
- [ ] Verify `accessToken` exists in localStorage (not undefined)
- [ ] Confirm token is being sent in request headers
- [ ] Check backend logs for more detailed error messages
- [ ] Verify user is a member of the workspace
- [ ] Verify project belongs to the workspace
- [ ] Check JWT token claims (decode at jwt.io)
- [ ] Ensure backend API matches documentation

## Backend Team: Questions to Answer

1. **Token Response Format:**
   - ✅ Confirmed: Login returns `token` (not `accessToken`)

2. **getCurrentUser Endpoint:**
   - ✅ Confirmed: Should be `POST /api/auth/me` (not GET)

3. **Project Endpoints:**
   - ❓ Does `GET /api/projects/{projectId}` exist?
   - ❓ Or must it be `GET /api/workspaces/{workspaceId}/projects/{projectId}`?

4. **Workspace Membership Verification:**
   - ❓ How does backend verify workspace membership for task creation?
   - ❓ Does it derive workspace from projectId, or need it explicitly?
   - ❓ What JWT claims are used for authorization?

5. **403 Error Messages:**
   - ❓ What exact message does backend return for:
     - User not a workspace member?
     - Invalid token?
     - Missing permissions?

## Contact
For further assistance, check backend logs or contact the backend team with:
- Console error logs
- Request/response details
- User account and workspace IDs
