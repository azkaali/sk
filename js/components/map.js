/* SkillConnect - Leaflet Map Component */

class SkillConnectMap {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.markers = {};
    this.routeLine = null;
    this.animInterval = null;
    this.defaultCenter = [37.7749, -122.4194]; // San Francisco Default
  }

  initMap() {
    const el = document.getElementById(this.containerId);
    if (!el || this.map) return;

    // Initialize Leaflet Map
    this.map = L.map(this.containerId, {
      zoomControl: false
    }).setView(this.defaultCenter, 14);

    // Dark Map Tile Layer (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);

    // Custom Zoom Controls top-right
    L.control.zoom({ position: 'topright' }).addTo(this.map);
  }

  renderProviders(providers, activeCategory = 'all') {
    if (!this.map) return;

    // Clear old provider markers
    Object.keys(this.markers).forEach(id => {
      if (id.startsWith('prov_')) {
        this.map.removeLayer(this.markers[id]);
        delete this.markers[id];
      }
    });

    const filtered = activeCategory === 'all' 
      ? providers 
      : providers.filter(p => p.category === activeCategory);

    filtered.forEach(p => {
      const iconHtml = `<div class="custom-provider-marker ${p.isOnline ? '' : 'offline'}">
        <i class="fa-solid fa-wrench"></i>
      </div>`;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-marker',
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const popupContent = `
        <div style="font-family: 'Inter', sans-serif; padding: 4px; color: #0f172a;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700;">${p.name}</h4>
          <p style="margin: 0 0 6px 0; font-size: 12px; color: #475569;"><i class="fa-solid fa-star" style="color:#f59e0b;"></i> ${p.rating} (${p.jobCount} jobs)</p>
          <span style="background:#10b981; color:white; padding:2px 6px; border-radius:10px; font-size:10px; font-weight:700;">Verified Provider</span>
        </div>
      `;

      const marker = L.marker([p.lat, p.lng], { icon: customIcon })
        .addTo(this.map)
        .bindPopup(popupContent);

      this.markers['prov_' + p.id] = marker;
    });
  }

  renderOpenJobs(jobs) {
    if (!this.map) return;

    // Clear old job markers
    Object.keys(this.markers).forEach(id => {
      if (id.startsWith('job_')) {
        this.map.removeLayer(this.markers[id]);
        delete this.markers[id];
      }
    });

    const openJobs = jobs.filter(j => j.status === 'open');

    openJobs.forEach(j => {
      const iconHtml = `<div class="custom-job-marker"><i class="fa-solid fa-briefcase"></i></div>`;
      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-job-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const popupContent = `
        <div style="font-family: 'Inter', sans-serif; padding: 4px; color: #0f172a;">
          <h4 style="margin:0 0 4px 0; font-size:13px; font-weight:700;">${j.title}</h4>
          <p style="margin:0 0 4px 0; font-size:11px; color:#475569;">${j.location}</p>
          <p style="margin:0; font-size:12px; font-weight:800; color:#10b981;">Budget: ${j.budgetRange}</p>
        </div>
      `;

      const marker = L.marker([j.lat, j.lng], { icon: customIcon })
        .addTo(this.map)
        .bindPopup(popupContent);

      this.markers['job_' + j.id] = marker;
    });
  }

  // Live En-Route Tracking Simulation
  startEnRouteTracking(startLat, startLng, endLat, endLng, onArrived) {
    if (!this.map) return;

    if (this.routeLine) this.map.removeLayer(this.routeLine);
    if (this.markers['tracking_provider']) this.map.removeLayer(this.markers['tracking_provider']);

    // Draw route line
    const points = [
      [startLat, startLng],
      [startLat + (endLat - startLat) * 0.5, startLng + (endLng - startLng) * 0.3],
      [endLat, endLng]
    ];

    this.routeLine = L.polyline(points, {
      color: '#10b981',
      weight: 4,
      dashArray: '6, 8',
      lineCap: 'round'
    }).addTo(this.map);

    this.map.fitBounds(this.routeLine.getBounds(), { padding: [40, 40] });

    // Animated Provider Marker
    const iconHtml = `<div class="custom-provider-marker" style="border-color:#f59e0b; background:#0f172a;"><i class="fa-solid fa-truck-pickup"></i></div>`;
    const animatedMarker = L.marker([startLat, startLng], {
      icon: L.divIcon({ html: iconHtml, iconSize: [38, 38], iconAnchor: [19, 19] })
    }).addTo(this.map);

    this.markers['tracking_provider'] = animatedMarker;

    let step = 0;
    const totalSteps = 40;

    if (this.animInterval) clearInterval(this.animInterval);

    this.animInterval = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      const curLat = startLat + (endLat - startLat) * progress;
      const curLng = startLng + (endLng - startLng) * progress;

      animatedMarker.setLatLng([curLat, curLng]);

      if (step >= totalSteps) {
        clearInterval(this.animInterval);
        if (onArrived) onArrived();
      }
    }, 400);
  }
}

window.appMap = new SkillConnectMap('mapContainer');
