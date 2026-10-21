/* =========================================
   LIJEESHA & SHON — WEDDING ALBUM
   Envelope • Page navigation • Music
   Countdown • RSVP • Mobile swipe
========================================= */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

const scene = $("#envelopeScene");
const envelopePanel = $("#envelopePanel");
const toast = $("#toast");

let openingInProgress = false;
let hasOpenedInvitation = false;
let activePage = 0;
let navigationLocked = false;
let navigationUnlockTimer;

/* =========================================
   PAGE SETUP
========================================= */

const pageIds = [
  "top",
  "envelopePanel",
  "faith",
  "families",
  "invitation",
  "venue",
  "countdown",
  "rsvp",
  "thanks"
];

const pages = pageIds
  .map(id => document.getElementById(id))
  .filter(Boolean);

// Add the closing page, which has no ID in your HTML.
const closingPage = $(".closing");

if (closingPage) {
  pages.push(closingPage);
}

pages.forEach((page, index) => {
  page.classList.add("album-page");
  page.dataset.pageIndex = index;
});

/* =========================================
   TOAST NOTIFICATION
========================================= */

function notify(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(notify.timer);

  notify.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

/* =========================================
   MUSIC
   Mobile browsers may require a user tap.
========================================= */

const music = $("#weddingMusic");
const musicButton = $("#musicToggle");

async function startMusic() {
  if (!music) return;

  try {
    await music.play();

    if (musicButton) {
      musicButton.textContent = "♫ Pause Music";
      musicButton.classList.add("playing");
    }
  } catch (error) {
    if (musicButton) {
      musicButton.textContent = "♫ Tap to Play";
    }
  }
}

function pauseMusic() {
  if (!music) return;

  music.pause();

  if (musicButton) {
    musicButton.textContent = "♫ Play Music";
    musicButton.classList.remove("playing");
  }
}

if (musicButton && music) {
  musicButton.addEventListener("click", () => {
    if (music.paused) {
      startMusic();
    } else {
      pauseMusic();
    }
  });

  music.addEventListener("play", () => {
    musicButton.textContent = "♫ Pause Music";
    musicButton.classList.add("playing");
  });

  music.addEventListener("pause", () => {
    musicButton.textContent = "♫ Play Music";
    musicButton.classList.remove("playing");
  });

  music.addEventListener("error", () => {
    notify("Music could not be loaded. Please check engagement.mpeg.");
  });
}

/* =========================================
   ALBUM PAGE NAVIGATION
========================================= */

const navigation = document.createElement("nav");

navigation.className = "album-navigation";
navigation.setAttribute("aria-label", "Wedding album navigation");

navigation.innerHTML = `
  <button type="button" class="album-prev"
          aria-label="Previous page" title="Previous page">
    ‹
  </button>

  <span class="album-page-count" aria-live="polite">
    01 / ${String(pages.length).padStart(2, "0")}
  </span>

  <button type="button" class="album-next"
          aria-label="Next page" title="Next page">
    ›
  </button>
`;

document.body.appendChild(navigation);

const previousButton = $(".album-prev", navigation);
const nextButton = $(".album-next", navigation);
const pageCount = $(".album-page-count", navigation);

function updateNavigation(index) {
  activePage = Math.max(0, Math.min(index, pages.length - 1));

  if (pageCount) {
    pageCount.textContent =
      `${String(activePage + 1).padStart(2, "0")} / ` +
      `${String(pages.length).padStart(2, "0")}`;
  }

  if (previousButton) {
    previousButton.disabled = activePage === 0;
  }

  if (nextButton) {
    nextButton.disabled = activePage === pages.length - 1;
  }
}

function goToPage(index, options = {}) {
  const { force = false } = options;

  if (!force && navigationLocked) return;

  const safeIndex = Math.max(0, Math.min(index, pages.length - 1));
  const destination = pages[safeIndex];

  if (!destination) return;

  navigationLocked = true;
  clearTimeout(navigationUnlockTimer);

  updateNavigation(safeIndex);

  destination.scrollIntoView({
    behavior: window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches ? "auto" : "smooth",
    block: "start"
  });

  navigationUnlockTimer = setTimeout(() => {
    navigationLocked = false;
  }, 1000);
}

function nextPage() {
  goToPage(activePage + 1);
}

function previousPage() {
  goToPage(activePage - 1);
}

previousButton.addEventListener("click", previousPage);
nextButton.addEventListener("click", nextPage);

/* Update the page number during manual scrolling. */
if ("IntersectionObserver" in window) {
  const pageObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const index = Number(entry.target.dataset.pageIndex);

      updateNavigation(index);
      entry.target.classList.add("page-visible");
    });
  }, {
    threshold: 0.45
  });

  pages.forEach(page => pageObserver.observe(page));
} else {
  pages.forEach(page => page.classList.add("page-visible"));
}

/* =========================================
   OPEN ENVELOPE
========================================= */

function openInvitation() {
  if (!scene || openingInProgress || hasOpenedInvitation) return;

  openingInProgress = true;
  hasOpenedInvitation = true;

  // Music is attempted as part of the user's tap.
  startMusic();

  scene.classList.add("open");

  if (envelopePanel) {
    envelopePanel.classList.add("opened");
  }

  // Let guests see the envelope animation before moving on.
  setTimeout(() => {
    const faithIndex = pages.findIndex(page => page.id === "faith");

    if (faithIndex !== -1) {
      goToPage(faithIndex, { force: true });
    }

    openingInProgress = false;
  }, 1900);
}

function revealEnvelope() {
  if (openingInProgress || hasOpenedInvitation) return;

  startMusic();

  const envelopeIndex = pages.findIndex(
    page => page.id === "envelopePanel"
  );

  if (envelopeIndex !== -1) {
    goToPage(envelopeIndex, { force: true });
  }

  // Allow the envelope to move into view before opening it.
  setTimeout(openInvitation, 700);
}

const openInvite = $("#openInvite");
const openArrow = $("#openArrow");
const waxSeal = $("#waxSeal");

if (openInvite) {
  openInvite.addEventListener("click", revealEnvelope);
}

if (openArrow) {
  openArrow.addEventListener("click", revealEnvelope);
}

if (waxSeal) {
  waxSeal.addEventListener("click", openInvitation);
}

/* =========================================
   COUNTDOWN
========================================= */

// Event: 10 December 2026 at 5:00 PM IST.
const targetDate = new Date(
  "2026-12-10T17:00:00+05:30"
).getTime();

function countdown() {
  const clockGrid = $(".clock-grid");

  if (!clockGrid) return;

  const remaining = targetDate - Date.now();

  if (remaining <= 0) {
    clockGrid.innerHTML =
      "<p>Today is the day! Let the celebration begin.</p>";
    return;
  }

  const values = {
    days: Math.floor(remaining / 86400000),
    hours: Math.floor((remaining % 86400000) / 3600000),
    minutes: Math.floor((remaining % 3600000) / 60000),
    seconds: Math.floor((remaining % 60000) / 1000)
  };

  Object.entries(values).forEach(([key, value]) => {
    const element = document.getElementById(key);

    if (element) {
      element.textContent = String(value).padStart(
        key === "days" ? 3 : 2,
        "0"
      );
    }
  });
}

countdown();
setInterval(countdown, 1000);

/* =========================================
   RSVP FORM
========================================= */
const RSVP_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxfgoMH_oHsjlzaWJN1DebKMpj3nbGNe4OZCz-mKojPPu2iaH440_g4qiyLJQCsyPNA/exec";
function escapeHTML(value) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

const rsvpForm = $("#rsvpForm");

if (rsvpForm) {
  rsvpForm.addEventListener("submit", async event => {
    event.preventDefault();

    const name = $("#name").value.trim();
    const phone = $("#phone").value.trim();
    const attendance = $("#attendance").value;
    const guests = $("#guests").value;
    const thanksMessage = $("#thanksMessage");
    const submitButton = $('button[type="submit"]', rsvpForm);

    if (!name || !phone || !attendance || !guests) {
      notify("Please complete all the RSVP fields.");
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }

    const formData = new URLSearchParams({
      name: name,
      phone: phone,
      attendance: attendance,
      guests: guests
    });

    try {
      await fetch(RSVP_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData
      });

      if (thanksMessage) {
        thanksMessage.innerHTML =
          `Thank you, ${escapeHTML(name)}!<br>` +
          "Thank you for sharing your response.<br>" +
          "We look forward to celebrating<br>with you!";
      }

      const thanksIndex = pages.findIndex(
        page => page.id === "thanks"
      );

      if (thanksIndex !== -1) {
        goToPage(thanksIndex, { force: true });
      }

      notify("Thank you! Please check Google Sheets to confirm your RSVP was saved.");

      rsvpForm.reset();

    } catch (error) {
      console.error("RSVP submission error:", error);
      notify("Unable to submit your RSVP. Please try again.");

    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Submit RSVP";
      }
    }
  });
}

/* =========================================
   REPLAY INVITATION
========================================= */

const replay = $("#replay");

if (replay) {
  replay.addEventListener("click", () => {
    openingInProgress = false;
    hasOpenedInvitation = false;
    navigationLocked = false;

    if (scene) {
      scene.classList.remove("open");
    }

    if (envelopePanel) {
      envelopePanel.classList.remove("opened");
    }

    goToPage(0, { force: true });

    notify("Your invitation is ready to open again.");
  });
}

/* =========================================
   FAMILY CARD ANIMATIONS
========================================= */

const familyCards = $$(".family-card");
const familyHeart = $(".family-heart");

if ("IntersectionObserver" in window) {
  const familyObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      familyCards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add("family-card-visible");
        }, index * 250);
      });

      if (familyHeart) {
        setTimeout(() => {
          familyHeart.classList.add("family-heart-visible");
        }, 350);
      }

      familyObserver.disconnect();
    });
  }, { threshold: 0.2 });

  const familiesSection = $("#families");

  if (familiesSection) {
    familyObserver.observe(familiesSection);
  }
} else {
  familyCards.forEach(card =>
    card.classList.add("family-card-visible")
  );

  if (familyHeart) {
    familyHeart.classList.add("family-heart-visible");
  }
}

/* =========================================
   MOBILE SWIPE NAVIGATION
========================================= */

let touchStartX = 0;
let touchStartY = 0;

document.addEventListener("touchstart", event => {
  if (!event.changedTouches.length) return;

  touchStartX = event.changedTouches[0].clientX;
  touchStartY = event.changedTouches[0].clientY;
}, { passive: true });

document.addEventListener("touchend", event => {
  if (!event.changedTouches.length) return;

  // Avoid interfering with form fields and controls.
  if (event.target.closest(
    "input, select, textarea, button, a, form, .album-navigation"
  )) {
    return;
  }

  const deltaX = event.changedTouches[0].clientX - touchStartX;
  const deltaY = event.changedTouches[0].clientY - touchStartY;

  // A horizontal swipe navigates pages.
  if (
    Math.abs(deltaX) > 75 &&
    Math.abs(deltaX) > Math.abs(deltaY) * 1.3
  ) {
    if (deltaX < 0) {
      nextPage();
    } else {
      previousPage();
    }
  }
}, { passive: true });

/* =========================================
   KEYBOARD NAVIGATION
========================================= */

document.addEventListener("keydown", event => {
  if (
    event.target.matches("input, textarea, select") ||
    event.target.isContentEditable
  ) {
    return;
  }

  if (event.key === "ArrowRight") {
    nextPage();
  } else if (event.key === "ArrowLeft") {
    previousPage();
  }
});


/* =========================================
   INITIAL STATE
========================================= */

updateNavigation(0);
pages.forEach(page => page.classList.add("page-ready"));
