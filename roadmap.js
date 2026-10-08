// Renders the "Building now" section from roadmap.json.
// Edit roadmap.json to update progress; this file shouldn't need changes.
(function () {
  "use strict";

  var section = document.getElementById("building");
  var content = document.getElementById("building-content");
  var navItem = document.getElementById("nav-building");
  if (!section || !content) return;

  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // Parse "YYYY-MM-DD" as a local date (avoids timezone shifts). Returns null if invalid.
  function parseDate(str) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof str === "string" ? str.trim() : "");
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return isNaN(d.getTime()) ? null : d;
  }

  // "Oct 20" for this year, "Oct 20, 2027" otherwise. Falls back to the raw text.
  function formatDate(str) {
    var d = parseDate(str);
    if (!d) return null;
    var label = MONTHS[d.getMonth()] + " " + d.getDate();
    if (d.getFullYear() !== new Date().getFullYear()) label += ", " + d.getFullYear();
    return label;
  }

  // Any non-empty "completed" value counts as done ("null" as a string is treated as a typo for null)
  function isDone(milestone) {
    var value = milestone.completed == null ? "" : String(milestone.completed).trim();
    return value !== "" && value.toLowerCase() !== "null";
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function show() {
    section.hidden = false;
    if (navItem) navItem.hidden = false;
  }

  function showError(err) {
    console.error("[roadmap] Could not load roadmap.json:", err);
    content.replaceChildren(
      el("p", "roadmap-error", "The build tracker couldn't load right now. Check back soon.")
    );
    show();
  }

  function renderMilestone(milestone, state) {
    var li = el("li", "milestone milestone-" + state);

    var marker = el("span", "milestone-marker");
    marker.setAttribute("aria-hidden", "true");
    if (state === "done") marker.textContent = "✓";
    li.appendChild(marker);

    var body = el("div", "milestone-body");
    var head = el("div", "milestone-head");
    head.appendChild(el("span", "milestone-title", milestone.title || "Untitled milestone"));

    if (state === "next") head.appendChild(el("span", "badge badge-next", "Up next"));

    var dateText;
    if (state === "done") {
      var completed = formatDate(milestone.completed);
      dateText = "completed " + (completed || milestone.completed);
    } else {
      dateText = "target " + (formatDate(milestone.target) || "TBD");
    }
    head.appendChild(el("span", "milestone-date", dateText));
    body.appendChild(head);

    if (milestone.doneWhen) {
      body.appendChild(el("p", "milestone-criteria", "Done when: " + milestone.doneWhen));
    }

    if (state === "done" && milestone.note) {
      body.appendChild(el("p", "milestone-note", milestone.note));
    }

    if (state === "done" && milestone.image) {
      var link = el("a", "milestone-image");
      link.href = milestone.image;
      link.target = "_blank";
      link.rel = "noopener";
      var img = el("img");
      img.src = milestone.image;
      img.alt = (milestone.title || "Milestone") + " photo";
      img.loading = "lazy";
      img.decoding = "async";
      link.appendChild(img);
      body.appendChild(link);
    }

    li.appendChild(body);
    return li;
  }

  function renderProject(project) {
    var milestones = Array.isArray(project.milestones) ? project.milestones : [];
    var doneCount = milestones.filter(isDone).length;
    var total = milestones.length;
    var nextIndex = milestones.findIndex(function (m) { return !isDone(m); });
    var percent = total ? Math.round((doneCount / total) * 100) : 0;

    var card = el("article", "roadmap-card");

    // Header: name, started date, summary, tags
    var header = el("div", "roadmap-header");
    header.appendChild(el("h3", "roadmap-name", project.name || "Untitled project"));
    var started = formatDate(project.started);
    if (started) header.appendChild(el("span", "roadmap-started", "Started " + started));
    card.appendChild(header);

    if (project.summary) card.appendChild(el("p", "roadmap-summary", project.summary));

    if (Array.isArray(project.tags) && project.tags.length) {
      var tags = el("ul", "tags");
      project.tags.forEach(function (t) { tags.appendChild(el("li", null, t)); });
      card.appendChild(tags);
    }

    // Progress bar
    var progress = el("div", "roadmap-progress");
    var label = el("p", "progress-label");
    label.appendChild(el("strong", null, doneCount + " / " + total));
    label.appendChild(document.createTextNode(" milestones"));
    progress.appendChild(label);

    var track = el("div", "progress-track");
    track.setAttribute("role", "progressbar");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", String(total));
    track.setAttribute("aria-valuenow", String(doneCount));
    track.setAttribute("aria-label", (project.name || "Project") + " progress");
    var fill = el("div", "progress-fill");
    fill.dataset.percent = String(percent);
    track.appendChild(fill);
    progress.appendChild(track);
    card.appendChild(progress);

    // Milestone checklist
    var list = el("ol", "milestones");
    milestones.forEach(function (m, i) {
      var state = isDone(m) ? "done" : i === nextIndex ? "next" : "todo";
      list.appendChild(renderMilestone(m, state));
    });
    card.appendChild(list);

    return card;
  }

  function render(data) {
    var projects = data && Array.isArray(data.projects) ? data.projects : null;
    if (!projects) throw new Error('roadmap.json must contain a "projects" array');

    var building = projects.filter(function (p) { return p.status === "building"; });
    var upNext = projects.filter(function (p) { return p.status === "next"; });

    // Nothing in progress: leave the section (and its nav link) hidden
    if (!building.length) return;

    var nodes = building.map(renderProject);

    if (upNext.length) {
      var next = el("p", "roadmap-upnext");
      next.appendChild(el("strong", null, "Up next: "));
      next.appendChild(document.createTextNode(
        upNext.map(function (p) { return p.name || "Untitled project"; }).join(", ")
      ));
      nodes.push(next);
    }

    content.replaceChildren.apply(content, nodes);
    show();

    // Bars start at 0 width; force a layout so the change to the real width animates
    // (CSS disables the transition for prefers-reduced-motion)
    void content.offsetWidth;
    content.querySelectorAll(".progress-fill").forEach(function (fill) {
      fill.style.width = fill.dataset.percent + "%";
    });
  }

  fetch("roadmap.json", { cache: "no-cache" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status + " " + res.statusText);
      return res.json();
    })
    .then(render)
    .catch(showError);
})();
