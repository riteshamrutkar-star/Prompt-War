/**
 * map.js
 * Handles Leaflet map initialization, geolocation, and mock booth generation.
 */

document.addEventListener('DOMContentLoaded', () => {
  const locateBtn = document.getElementById('locateMeBtn');
  const overlay = document.getElementById('mapOverlay');
  let map = null;

  if (locateBtn && overlay) {
    locateBtn.addEventListener('click', () => {
      // Change button text while waiting
      const originalText = locateBtn.innerHTML;
      locateBtn.innerHTML = '<span>Locating... ⏳</span>';
      locateBtn.disabled = true;

      if (!navigator.geolocation) {
        showMapError("Geolocation is not supported by your browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          initLeafletMap(latitude, longitude);
          overlay.classList.add('hidden');
        },
        (error) => {
          console.error('Error getting location', error);
          let errorMsg = "Unable to retrieve your location. Please check permissions.";
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = "Location access was denied. We cannot show nearby booths.";
          }
          showMapError(errorMsg);

          // Restore button state so they can try again if they change permissions
          locateBtn.innerHTML = originalText;
          locateBtn.disabled = false;
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }

  function showMapError(msg) {
    const errorEl = document.createElement('p');
    errorEl.style.color = 'var(--danger)';
    errorEl.style.fontWeight = 'bold';
    errorEl.style.marginTop = '1rem';
    errorEl.textContent = msg;

    // Remove old error if it exists
    const existingError = overlay.querySelector('p[style*="var(--danger)"]');
    if (existingError) existingError.remove();

    overlay.appendChild(errorEl);
  }

  function initLeafletMap(lat, lng) {
    // If map already exists, just pan to new location
    if (map) {
      map.setView([lat, lng], 14);
      return;
    }

    // Initialize Leaflet Map
    map = L.map('electionMap').setView([lat, lng], 14);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Create a custom icon for the user location
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: `<div style="background-color: var(--primary); width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    // Add User Location Marker
    L.marker([lat, lng], { icon: userIcon }).addTo(map)
      .bindPopup('<b>You are here</b><br/>Searching for nearby booths...')
      .openPopup();

    // Generate and add mock booths
    generateMockBooths(lat, lng);
  }

  function generateMockBooths(userLat, userLng) {
    const boothNames = [
      "City Hall Polling Station",
      "Community Center Branch 4",
      "Public Library Main Booth",
      "High School Gymnasium",
      "Fire Station #12"
    ];

    const bounds = L.latLngBounds();
    bounds.extend([userLat, userLng]);

    // Generate 3-5 random booths around the user (approx 1-3km radius)
    const numBooths = Math.floor(Math.random() * 3) + 3;

    for (let i = 0; i < numBooths; i++) {
      // Random offset between -0.015 and +0.015 for both lat and lng
      const latOffset = (Math.random() - 0.5) * 0.03;
      const lngOffset = (Math.random() - 0.5) * 0.03;

      const boothLat = userLat + latOffset;
      const boothLng = userLng + lngOffset;

      const name = boothNames[i % boothNames.length];
      const distance = (Math.sqrt(Math.pow(latOffset, 2) + Math.pow(lngOffset, 2)) * 111).toFixed(1); // Rough distance in km

      // Create a popup template
      const popupContent = `
        <div class="booth-popup">
          <h4>${name}</h4>
          <p><strong>Distance:</strong> ~${distance} km away</p>
          <p><strong>Hours:</strong> 7:00 AM - 8:00 PM</p>
          <p><strong>Accessibility:</strong> Wheelchair Accessible ♿</p>
          <span class="booth-status">Open on Election Day</span>
        </div>
      `;

      // Standard Leaflet marker (blue teardrop)
      const marker = L.marker([boothLat, boothLng]).addTo(map);
      marker.bindPopup(popupContent);
      bounds.extend([boothLat, boothLng]);
    }

    // Adjust map view to fit all markers
    setTimeout(() => {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }, 500);
  }
});
