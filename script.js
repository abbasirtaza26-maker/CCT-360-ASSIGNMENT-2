let dots = document.getElementById("dots");
let headline = document.getElementById("headline");
let details = document.getElementById("details");
let rumble = document.getElementById("rumble");
let ping = document.getElementById("ping");
let alertSound = document.getElementById("alert");
let soundButton = document.getElementById("soundButton");

let urls = [
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson"
];
let quakes = [];
let soundOn = false;

rumble.volume = 0.2;

// ---------- BUTTONS ----------
function chooseFeed(number) {
  alertSound.currentTime = 0;
  alertSound.play();
  loadQuakes(number);
}

// ---------- GET THE LIVE DATA ----------
function loadQuakes(number) {
  headline.textContent = "Listening to the Earth...";
  fetch(urls[number])
    .then(response => response.json())
    .then(data => showQuakes(data))
    .catch(error => {
      headline.textContent = "Could not reach the USGS. Try again.";
    });
}

// ---------- LET THE DATA BUILD THE PAGE ----------
function showQuakes(data) {
  quakes = data.features;
  dots.innerHTML = "";

  let biggest = 0;
  let biggestIndex = -1;

  for (let i = 0; i < quakes.length; i++) {
    let mag = quakes[i].properties.mag;
    let lon = quakes[i].geometry.coordinates[0];
    let lat = quakes[i].geometry.coordinates[1];

    if (mag === null || mag < 0) {
      mag = 0;
    }
    if (mag > biggest) {
      biggest = mag;
      biggestIndex = i;
    }

    // position, size and colour all come from the data
    let size = 4 + mag * 2;
    let colour = "#7fdbff";
    if (mag >= 6) {
      colour = "#ffffff";
    } else if (mag >= 5) {
      colour = "#ff3b3b";
    } else if (mag >= 4) {
      colour = "#ff8c42";
    } else if (mag >= 2) {
      colour = "#ffd27a";
    }

    let dot = document.createElement("div");
    dot.className = "quake";
    dot.style.left = (lon + 180) / 360 * 100 + "%";
    dot.style.top = (90 - lat) / 180 * 100 + "%";
    dot.style.width = size + "px";
    dot.style.height = size + "px";
    dot.style.marginLeft = -size / 2 + "px";
    dot.style.marginTop = -size / 2 + "px";
    dot.style.backgroundColor = colour;
    dot.addEventListener("click", () => showQuake(i));
    dots.appendChild(dot);
  }

  // the biggest quake sets the headline, the page colour and the rumble volume
  if (biggestIndex === -1) {
    headline.textContent = "The Earth is quiet. No earthquakes in this time range.";
    document.body.style.backgroundColor = "#080c1a";
    rumble.volume = 0.1;
  } else {
    headline.textContent = quakes.length + " earthquakes. The biggest was M" + biggest + ", " + quakes[biggestIndex].properties.place + ".";

    if (biggest < 4) {
      document.body.style.backgroundColor = "#080c1a";
    } else if (biggest < 5) {
      document.body.style.backgroundColor = "#1a1030";
    } else if (biggest < 6) {
      document.body.style.backgroundColor = "#2b0f1a";
    } else {
      document.body.style.backgroundColor = "#4a0a0a";
    }

    rumble.volume = Math.max(0.1, Math.min(biggest / 8, 1));
  }
}

// ---------- CLICK A DOT ----------
function showQuake(index) {
  let mag = quakes[index].properties.mag;
  let depth = quakes[index].geometry.coordinates[2];
  if (mag === null) {
    mag = 0;
  }
  details.textContent = "Magnitude " + mag + " | " + quakes[index].properties.place + " | Depth " + depth + " km";

  ping.volume = Math.max(0.2, Math.min(mag / 7, 1));
  ping.currentTime = 0;
  ping.play();
}

// ---------- RUMBLE BUTTON ----------
function toggleSound() {
  if (soundOn === false) {
    rumble.play();
    soundOn = true;
    soundButton.textContent = "Pause rumble";
  } else {
    rumble.pause();
    soundOn = false;
    soundButton.textContent = "Play rumble";
  }
}

loadQuakes(1);