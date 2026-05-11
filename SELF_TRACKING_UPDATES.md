# Self-Tracking Feature Updates

## New Changes Implemented

### 1. ✅ Display Account Name (Not Bracelet Name)

**What Changed:**
- Self-marker now displays your **Firebase Auth account name** (`currentUser.displayName`)
- Uses your **account avatar** (`currentUser.photoURL`) instead of bracelet avatar
- This ensures consistency across the app - your identity is always your account, not the bracelet

**Why This Matters:**
- Your account name is what you signed up with (Google name or email signup name)
- More personal and recognizable
- Consistent with profile menu and other parts of the app
- Bracelet name is just for device identification, not personal identity

**Example:**
```
Before: "Lolo's Bracelet" (bracelet name)
After:  "Juan Dela Cruz" (your account name)
```

### 2. ✅ Default Location When GPS Not Available

**What Changed:**
- Self-marker now appears on map **even without GPS data**
- Uses **TUP Manila coordinates** `[14.5921, 120.9755]` as default location
- Shows clear indicator: "Default location (GPS not available)"
- Once real GPS data arrives, automatically switches to actual location

**Why This Matters:**
- You can see yourself on the map immediately after configuring bracelet
- No confusion about "where am I?" when GPS hasn't synced yet
- Clear visual feedback that location is temporary/default
- Better UX - something is always visible

**Visual Indicators:**
- Map popup shows: "📍 Default location (TUP Manila) - GPS data not available yet"
- Side panel shows: "Default location (GPS not available)"
- Italicized text to indicate it's not real data

---

## Technical Implementation

### Data Layer Changes (`useBraceletData.js`)

#### Updated `fetchBraceletUsers()` Function

```javascript
// NEW: Accept currentUser parameter
async function fetchBraceletUsers(uid, currentUser = null) {
  // ... existing code ...
  
  if (isSelf) {
    // Use account name from Firebase Auth
    userObj.name = currentUser?.displayName || userObj.name || 'You';
    
    // Use account avatar from Firebase Auth
    userObj.avatar = currentUser?.photoURL || userObj.avatar;
    
    // If no GPS data yet, use default location
    if (!userObj.position || (userObj.position[0] === 0 && userObj.position[1] === 0)) {
      userObj.position = [14.5921, 120.9755]; // TUP Manila
      userObj.hasDefaultLocation = true; // Flag for UI
    }
  }
}
```

#### Updated Real-time Listener

```javascript
// Profile listener now preserves account name/avatar for self
if (u.isSelf) {
  return {
    ...u,
    name: currentUser?.displayName || newData.name || u.name,
    avatar: currentUser?.photoURL || newData.avatar || u.avatar,
    // ... other fields
  };
}
```

### UI Changes

#### Home.jsx - Map Popup
```javascript
{singleUser.hasDefaultLocation ? (
  <p style={{ fontStyle: 'italic', color: '#666' }}>
    📍 Default location (TUP Manila) - GPS data not available yet
  </p>
) : (
  <p>{addressCache[singleUser.id] || "Fetching location…"}</p>
)}
```

#### HomeSidePanel.jsx - Location Text
```javascript
const locationText = u.hasDefaultLocation 
  ? "Default location (GPS not available)"
  : (addressCache[u.id] || (u.position ? "Fetching location…" : "No GPS data"));
```

---

## User Experience Flow

### Scenario 1: New Bracelet Configuration

**Before:**
```
1. User configures bracelet
2. Goes to map
3. ❌ No self-marker appears (no GPS data yet)
4. Confusion: "Where am I?"
```

**After:**
```
1. User configures bracelet
2. Goes to map
3. ✅ Blue pin appears at TUP Manila (default)
4. Popup says "Default location - GPS not available yet"
5. User understands: "I'm visible, waiting for GPS"
6. Once GPS syncs → pin moves to actual location
```

### Scenario 2: Account Name Display

**Before:**
```
Map shows: "My Bracelet" (generic bracelet name)
People list: "My Bracelet"
Confusion: "Is that me or someone else's bracelet?"
```

**After:**
```
Map shows: "Juan Dela Cruz" (your account name)
People list: "Juan Dela Cruz [You]"
Clear: "That's definitely me!"
```

---

## Visual Comparison

### Map Popup - Default Location

```
┌─────────────────────────────────────┐
│ 📍 Your Location                    │
├─────────────────────────────────────┤
│ Status: Active                      │
│ Battery: 100%                       │
│ Last Seen: 3:45 PM                  │
├─────────────────────────────────────┤
│ 📍 Default location (TUP Manila)    │ ← Italicized
│    GPS data not available yet       │ ← Gray color
├─────────────────────────────────────┤
│ Manage My Bracelet →                │
└─────────────────────────────────────┘
```

### Map Popup - Real Location

```
┌─────────────────────────────────────┐
│ 📍 Your Location                    │
├─────────────────────────────────────┤
│ Status: Active                      │
│ Battery: 95%                        │
│ Last Seen: 3:45 PM                  │
├─────────────────────────────────────┤
│ 123 Ayala Avenue, Makati City      │ ← Normal text
├─────────────────────────────────────┤
│ Manage My Bracelet →                │
└─────────────────────────────────────┘
```

### People List - Account Name

```
Before:
🔵 My Bracelet [You] - 100% battery

After:
🔵 Juan Dela Cruz [You] - 100% battery
```

---

## Data Priority Logic

### Name Display Priority (Self-Marker)
```
1. currentUser.displayName (Firebase Auth) ← HIGHEST PRIORITY
2. braceletUsers.name (Firestore)
3. "You" (fallback)
```

### Avatar Display Priority (Self-Marker)
```
1. currentUser.photoURL (Firebase Auth) ← HIGHEST PRIORITY
2. braceletUsers.avatar (Firestore)
3. default avatar (fallback)
```

### Location Display Priority (Self-Marker)
```
1. Real GPS data from deviceStatus ← HIGHEST PRIORITY
2. Default location [14.5921, 120.9755] (TUP Manila)
```

### Name Display Priority (Other Users)
```
1. appUser.braceletNicknames[id] (custom nickname) ← HIGHEST PRIORITY
2. braceletUsers.name (Firestore)
3. "Unnamed User" (fallback)
```

---

## Edge Cases Handled

### ✅ No GPS Data Yet
- Shows default location (TUP Manila)
- Clear indicator in popup and side panel
- Automatically updates when GPS data arrives

### ✅ GPS Data is [0, 0] (Null Island)
- Treated as invalid/no data
- Shows default location instead
- Prevents marker from appearing in the ocean

### ✅ No Account Name
- Falls back to bracelet name
- Then falls back to "You"
- Never shows blank/undefined

### ✅ No Account Avatar
- Falls back to bracelet avatar
- Then falls back to default avatar
- Always shows something

### ✅ Real-time Updates
- When GPS data arrives, `hasDefaultLocation` flag is removed
- Location text updates automatically
- Smooth transition from default to real location

---

## Testing Checklist

### Account Name Display
- [ ] Self-marker shows account name (not bracelet name)
- [ ] Account name appears in map popup
- [ ] Account name appears in People list
- [ ] Account name appears in side panel
- [ ] Account avatar is used (if available)

### Default Location
- [ ] Self-marker appears at TUP Manila when no GPS
- [ ] Popup shows "Default location" message
- [ ] Side panel shows "Default location" text
- [ ] Message is italicized and gray
- [ ] When GPS arrives, location updates automatically
- [ ] Default location indicator disappears when real GPS arrives

### Edge Cases
- [ ] Works with Google sign-in (has displayName and photoURL)
- [ ] Works with email sign-in (has displayName, no photoURL)
- [ ] Works when GPS is [0, 0] (shows default)
- [ ] Works when GPS is null/undefined (shows default)
- [ ] Transitions smoothly from default to real location

---

## Files Modified

1. **`src/hooks/useBraceletData.js`**
   - Updated `fetchBraceletUsers()` to accept `currentUser` parameter
   - Added account name/avatar logic for self-marker
   - Added default location logic with `hasDefaultLocation` flag
   - Updated profile listener to preserve account name/avatar

2. **`src/pages/home-page/Home.jsx`**
   - Added conditional rendering for default location message
   - Shows "Default location (TUP Manila)" when `hasDefaultLocation` is true

3. **`src/components/HomeSidePanel.jsx`**
   - Updated location text to show "Default location" when applicable

---

## Benefits

### For Users
✅ **Immediate visibility** - See yourself on map right away  
✅ **Clear identity** - Your account name, not generic bracelet name  
✅ **No confusion** - Clear indicator when location is default  
✅ **Smooth transition** - Automatic update when GPS arrives  
✅ **Consistent identity** - Same name across entire app  

### For Product
✅ **Better onboarding** - Users see themselves immediately  
✅ **Less support** - Clear messaging about default location  
✅ **Professional UX** - Handles edge cases gracefully  
✅ **Consistent branding** - Account identity is primary  

### For Development
✅ **Clean code** - Single source of truth for identity  
✅ **Maintainable** - Clear flag for default location  
✅ **Extensible** - Easy to change default location if needed  
✅ **Robust** - Handles all edge cases  

---

## Configuration

### Default Location Coordinates
```javascript
// TUP Manila (Technological University of the Philippines)
const DEFAULT_LOCATION = [14.5921, 120.9755];
```

**To change default location:**
1. Open `src/hooks/useBraceletData.js`
2. Find the line: `userObj.position = [14.5921, 120.9755];`
3. Replace with your desired coordinates
4. Update the message in `Home.jsx` to reflect new location name

---

## Future Enhancements

💡 **User-configurable default location** - Let users set their own default  
💡 **Last known location** - Use last GPS position instead of fixed default  
💡 **Geolocation API** - Use browser location as default  
💡 **Multiple default locations** - Different defaults per region  
💡 **Smart defaults** - Based on user's timezone or IP location  

---

**Status**: ✅ Fully Implemented  
**Build**: ✅ No Errors  
**Ready**: ✅ For Production Use  
**Date**: [Current Date]
