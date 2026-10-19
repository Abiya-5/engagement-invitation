/* =====================================
   WEDDING INVITATION - MAIN JAVASCRIPT
===================================== */

const scene = document.getElementById("envelopeScene");
const toast = document.getElementById("toast");

let openingInProgress = false;

/* =====================================
   NOTIFICATION MESSAGE
===================================== */

function notify(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(notify.timer);

  notify.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3200);
}

/* =====================================
   OPEN ENVELOPE
   THEN SCROLL TO A WORD OF FAITH
===================================== */

function openInvitation() {
  if (!scene || openingInProgress) return;

  openingInProgress = true;

  const envelopePanel = document.getElementById("envelopePanel");

  // Start envelope opening animation.
  scene.classList.add("open");

  if (envelopePanel) {
    envelopePanel.classList.add("opened");
  }

  // Wait for the envelope animation before scrolling.
  setTimeout(() => {
    const faithSection = document.getElementById("faith");

    if (faithSection) {
      faithSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

    openingInProgress = false;
  }, 2500);
}

/* =====================================
   OPEN INVITATION BUTTON
===================================== */

const openInvite = document.getElementById("openInvite");

if (openInvite) {
  openInvite.addEventListener("click", () => {
    if (openingInProgress) return;

    const envelopePanel = document.getElementById("envelopePanel");

    if (envelopePanel) {
      envelopePanel.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }

    setTimeout(openInvitation, 700);
  });
}

/* =====================================
   ENVELOPE ARROW AND WAX SEAL
===================================== */

const openArrow = document.getElementById("openArrow");

if (openArrow) {
  openArrow.addEventListener("click", openInvitation);
}

const waxSeal = document.getElementById("waxSeal");

if (waxSeal) {
  waxSeal.addEventListener("click", openInvitation);
}

/* =====================================
   WEDDING COUNTDOWN
===================================== */

const target = new Date("2026-12-26T17:00:00+05:30").getTime();

function countdown() {
  const clockGrid = document.querySelector(".clock-grid");

  if (!clockGrid) return;

  const remaining = target - Date.now();

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

  Object.entries(values).forEach(([key, number]) => {
    const element = document.getElementById(key);

    if (element) {
      element.textContent = String(number).padStart(
        key === "days" ? 3 : 2,
        "0"
      );
    }
  });
}

countdown();
setInterval(countdown, 1000);

/* =====================================
   RSVP FORM
===================================== */

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

const rsvpForm = document.getElementById("rsvpForm");

if (rsvpForm) {
  rsvpForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const thanksMessage = document.getElementById("thanksMessage");

    if (thanksMessage) {
      thanksMessage.innerHTML =
        `Thank you, ${escapeHTML(name)}!<br>` +
        "Your response has been recorded.<br>" +
        "We look forward to celebrating<br>with you!";
    }

    const thanks = document.getElementById("thanks");

    if (thanks) {
      thanks.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

    notify(`Thank you, ${name}! Your RSVP preview is ready.`);

    event.currentTarget.reset();
  });
}

/* =====================================
   REPLAY INVITATION
===================================== */

const replay = document.getElementById("replay");

if (replay) {
  replay.addEventListener("click", () => {
    openingInProgress = false;

    if (scene) {
      scene.classList.remove("open");
    }

    const envelopePanel = document.getElementById("envelopePanel");

    if (envelopePanel) {
      envelopePanel.classList.remove("opened");
    }

    const top = document.getElementById("top");

    if (top) {
      top.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }

    notify("Your invitation is ready to open again.");
  });
}

/* =====================================
   A WORD OF FAITH & OUR FAMILIES
   SCROLL ANIMATIONS
===================================== */

function initializeSectionAnimations() {
  const sectionIds = ["faith", "families"];

  sectionIds.forEach(id => {
    const section = document.getElementById(id);

    if (!section) return;

    section.style.opacity = "0";
    section.style.transform = "translateY(25px)";
    section.style.transition =
      "opacity 1s ease, transform 1s ease";

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        section.style.opacity = "1";
        section.style.transform = "translateY(0)";

        // Animate family cards one by one.
        if (id === "families") {
          const cards = section.querySelectorAll(".family-card");

          cards.forEach((card, index) => {
            card.style.opacity = "0";
            card.style.transform = "translateY(20px)";
            card.style.transition =
              "opacity 0.8s ease, transform 0.8s ease";

            setTimeout(() => {
              card.style.opacity = "1";
              card.style.transform = "translateY(0)";
            }, 250 * index);
          });

          const heart = section.querySelector(".family-heart");

          if (heart) {
            heart.style.opacity = "0";
            heart.style.transition = "opacity 1s ease";

            setTimeout(() => {
              heart.style.opacity = "1";
            }, 350);
          }
        }

        observer.unobserve(section);
      });
    }, {
      threshold: 0.15
    });

    observer.observe(section);
  });
}

/* =====================================
   WEDDING BACKGROUND MUSIC
===================================== */

function initializeMusic() {
  const music = document.getElementById("weddingMusic");
  const button = document.getElementById("musicToggle");

  if (!music || !button) return;

  async function startMusic() {
    try {
      await music.play();

      button.textContent = "♫ Pause Music";
      button.classList.add("playing");
    } catch (error) {
      // Browser autoplay restrictions may block playback.
      button.textContent = "♫ Tap to Play";
    }
  }

  // Try autoplay when the page loads.
  startMusic();

  // Retry when the visitor interacts with the page.
  function playOnFirstInteraction() {
    if (music.paused) {
      startMusic();
    }

    document.removeEventListener("click", playOnFirstInteraction);
    document.removeEventListener("touchstart", playOnFirstInteraction);
    document.removeEventListener("keydown", playOnFirstInteraction);
  }

  document.addEventListener("click", playOnFirstInteraction);
  document.addEventListener("touchstart", playOnFirstInteraction);
  document.addEventListener("keydown", playOnFirstInteraction);

  // Music play/pause button.
  button.addEventListener("click", async () => {
    if (music.paused) {
      await startMusic();
    } else {
      music.pause();

      button.textContent = "♫ Tap to Play";
      button.classList.remove("playing");
    }
  });
}

/* =====================================
   INITIALIZE ALL FEATURES
===================================== */

document.addEventListener("DOMContentLoaded", () => {
  initializeSectionAnimations();
  initializeMusic();
});