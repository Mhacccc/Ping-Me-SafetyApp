# Self-Tracking Feature Implementation

## Overview
This document describes the implementation of the self-tracking feature, which allows users to see their own location on the map alongside the people they are monitoring.

## Design Decision
**Automatic, not toggle-based**: The feature is always enabled when the user has configured their bracelet. No additional settings or buttons are required.

**Gate condition**: Users only appear on the map if they have configured their bracelet in "My Bracelet" settings. This is the natural prerequisite.

## Implementation Details

### 1. Data Layer (`useBraceletData.js`)

#### Changes to `fetchBraceletUsers()`
- Added query to fetch the user's own bracelet where `ownerAppUserId === uid`
- Merged owned bracelet with linked bracelets (avoiding duplicates)
- Added `isSelf: true` flag to the user's own bracelet object
- Preserved nickname logic: self-marker keeps original name, others can have nicknames

#### Changes to Real-time Listeners
- Updated device status listener to monitor all bracelet IDs (linked + own)
- Updated profile listener to monitor all bracelet IDs (linked + own)
- Added `braceletUsers` to dependency arrays to ensure proper updates
- Preserved `isSelf` flag during real-time updates

### 2. Map Visualization (`mapHelpers.js`)

#### Changes to `createCustomIcon()`
- Added `isSelf` detection from user data
- Added `isSelf` to cache key for proper icon differentiation
- Added CSS classes: `self-marker`, `self-pin`, `self-bg`, `self-content`
- Blue pin styling for self-marker (vs red for others)

### 3. Map Display (`Home.jsx`)

#### Changes to Marker Popup
- Added conditional rendering for self-marker popup
- Self-marker shows:
  - "📍 Your Location" header (blue background)
  - Same status info (battery, online, last seen, SOS)
  - Blue-themed location box
  - "Manage My Bracelet" link instead of "View User Profile"
- Group markers handle self-marker:
  - Non-clickable item with blue highlight
  - Shows "(You)" suffix in name
  - No profile link for self in group

### 4. Map Styling (`Home.css`)

#### New CSS Classes
```css
.marker-pin.self-pin - Blue drop shadow
.marker-bg.self-bg - Blue hue rotation filter
.marker-content.self-content - Blue background with white border
```

### 5. People Page (`People.jsx`)

#### Changes to User List
- Modified `filteredUsers` memo to separate self from others
- Self-marker always appears first in the list
- Self-marker rendering:
  - Non-clickable (cursor: default)
  - Blue name color
  - "You" badge next to name
  - Blue border on avatar
  - No edit/delete buttons

### 6. People Styling (`People.css`)

#### New CSS Class
```css
.you-badge - Blue gradient badge with shadow
```

### 7. Home Side Panel (`HomeSidePanel.jsx`)

#### Changes to User List Items
- Added conditional rendering for self-marker
- Self-marker shows:
  - Blue name color
  - "You" badge inline with name
  - "Manage bracelet →" link (blue) instead of "View profile →"

### 8. Side Panel Styling (`HomeSidePanel.css`)

#### Updated CSS
```css
.hsp-name - Added flexbox for badge alignment
.hsp-you-badge - Blue gradient badge (smaller than People page)
```

## Visual Design

### Self-Marker Characteristics
- **Pin Color**: Blue (hue-rotated from red)
- **Pin Shadow**: Blue glow instead of black
- **Avatar Border**: White border with blue shadow
- **Badge**: Blue gradient with "YOU" text
- **Links**: Point to "My Bracelet" settings instead of profile

### Other Users
- **Pin Color**: Red (original)
- **Pin Shadow**: Black
- **Avatar Border**: None
- **Badge**: None
- **Links**: Point to user profile

## User Experience Flow

1. **No Bracelet Configured**
   - User sees only linked people on map
   - People page shows only linked people
   - No self-marker appears

2. **Bracelet Configured**
   - User automatically appears on map with blue pin
   - User appears at top of People list with "You" badge
   - Clicking self-marker opens "Your Location" popup
   - "Manage My Bracelet" link goes to bracelet settings

3. **In a Group**
   - Self-marker appears in group popup
   - Highlighted with blue background
   - Shows "(You)" suffix
   - Non-clickable (others are clickable)

## Technical Notes

### Data Flow
1. `useBraceletData` fetches owned bracelet + linked bracelets
2. Owned bracelet gets `isSelf: true` flag
3. Real-time listeners update all bracelets (including self)
4. UI components check `isSelf` flag for conditional rendering

### Performance
- Icon caching includes `isSelf` in cache key
- No additional queries (parallel fetch with linked bracelets)
- Real-time listeners reuse existing infrastructure

### Edge Cases Handled
- User hasn't configured bracelet: No self-marker appears
- User's bracelet is also linked by someone else: Appears once with `isSelf: true`
- User is in same location as others: Grouped correctly, self highlighted
- User searches for themselves: Self-marker appears in results

## Files Modified

1. `src/hooks/useBraceletData.js` - Data fetching and real-time updates
2. `src/utils/mapHelpers.js` - Icon generation with self-marker styling
3. `src/pages/home-page/Home.jsx` - Map popup conditional rendering
4. `src/pages/home-page/Home.css` - Self-marker styling
5. `src/pages/people/People.jsx` - People list with self at top
6. `src/pages/people/People.css` - "You" badge styling
7. `src/components/HomeSidePanel.jsx` - Side panel self-marker handling
8. `src/components/HomeSidePanel.css` - Side panel badge styling

## Testing Checklist

- [ ] Self-marker appears on map when bracelet is configured
- [ ] Self-marker has blue pin (not red)
- [ ] Clicking self-marker shows "Your Location" popup
- [ ] "Manage My Bracelet" link works in popup
- [ ] Self appears at top of People list with "You" badge
- [ ] Self-marker is non-editable/non-deletable in People page
- [ ] Self appears in HomeSidePanel with "You" badge
- [ ] Self-marker updates in real-time (battery, location, SOS)
- [ ] Self-marker groups correctly with others at same location
- [ ] Self-marker highlighted in group popup
- [ ] No self-marker when bracelet not configured
- [ ] Search includes self-marker
- [ ] Filters (online/SOS) include self-marker

## Future Enhancements

1. **Custom Self-Marker Icon**: Use a different icon (e.g., crosshair) instead of avatar
2. **Self-Marker Label**: Always show "You" label on map (not just in popup)
3. **Center on Self**: Add button to quickly center map on user's location
4. **Self-Marker Trail**: Show user's own movement history
5. **Privacy Mode**: Toggle to hide self from map (if needed)
