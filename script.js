const PHOTO_DIR = "public/fotos-mae/";

// Lista de segurança para quando o site for aberto sem um servidor que liste a pasta.
// Ao adicionar novas imagens, elas entram automaticamente se o servidor listar PHOTO_DIR.
// Se isso não acontecer no seu ambiente, inclua o nome do arquivo aqui e em fotos.json.
const PRELOAD_PHOTO_FILES = [
  "514323780_23873161579009723_6198301613926346094_n.jpg",
  "514476611_23878383551820859_2836874301382285086_n.jpg",
  "558943939_24675143032144903_1371370423688772709_n.jpg",
];

const QUALITIES = [
  {
    title: "Seu jeito de cuidar",
    initial: "C",
    text: "Você cuida com presença, atenção e amor em cada detalhe.",
  },
  {
    title: "Sua inteligência",
    initial: "I",
    text: "Sua inteligência me inspira todos os dias. Admiro como você resolve tudo com sabedoria e clareza.",
  },
  {
    title: "Sua força",
    initial: "F",
    text: "Sua força ensina coragem sem perder a ternura.",
  },
  {
    title: "Seu coração enorme",
    initial: "C",
    text: "Seu coração acolhe, protege e faz todo mundo se sentir amado.",
  },
];

const MOMENT_TEXTS = [
  "Cada momento da Caroline é uma lembrança preciosa, cheia de carinho, amor e história.",
  "Esses registros mostram um pouco da pessoa maravilhosa que ela é para todos nós.",
  "Que cada lembrança represente o quanto ela é amada, admirada e especial.",
];

const PHOTO_CAPTIONS = [
  "Carinho em forma de memória",
  "Família, amor e presença",
  "Um dia para guardar no coração",
];

const HERO_PHOTO_INDEX = 2;
const IMAGE_EXTENSIONS = /\.(avif|gif|jpe?g|png|webp)$/i;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function normalizePhotoName(value) {
  if (!value || value.includes("://")) {
    return "";
  }

  const clean = decodeURIComponent(value)
    .split("?")[0]
    .split("#")[0]
    .replace(/^\.?\//, "")
    .replace(/^public\/fotos-mae\//, "");

  if (!IMAGE_EXTENSIONS.test(clean) || clean.includes("/")) {
    return "";
  }

  return clean;
}

function uniquePhotoList(list) {
  return [...new Set(list.map(normalizePhotoName).filter(Boolean))];
}

async function readDirectoryPhotos() {
  const response = await fetch(PHOTO_DIR, { cache: "no-store" });

  if (!response.ok) {
    return [];
  }

  const html = await response.text();
  const documentFromHtml = new DOMParser().parseFromString(html, "text/html");
  const links = [...documentFromHtml.querySelectorAll("a")]
    .map((link) => link.getAttribute("href"))
    .filter(Boolean);

  return uniquePhotoList(links);
}

async function readManifestPhotos() {
  const response = await fetch(`${PHOTO_DIR}fotos.json`, { cache: "no-store" });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return uniquePhotoList(Array.isArray(data) ? data : data.photos);
}

async function discoverPhotos() {
  const strategies = [readDirectoryPhotos, readManifestPhotos];

  for (const strategy of strategies) {
    try {
      const photos = await strategy();
      if (photos.length) {
        return photos;
      }
    } catch (error) {
      console.warn("Não foi possível carregar fotos por esta estratégia.", error);
    }
  }

  return uniquePhotoList(PRELOAD_PHOTO_FILES);
}

function photoUrl(fileName) {
  return `${PHOTO_DIR}${encodeURIComponent(fileName)}`;
}

function FloatingHearts() {
  const container = document.querySelector("[data-floating-hearts]");
  if (!container) {
    return;
  }

  const symbols = ["♡", "✦", "✧", "♡", "✦"];
  const colors = ["#ce7f95", "#d4a84b", "#b6cfa7", "#e7aab7"];
  const total = reduceMotion ? 8 : 26;

  container.innerHTML = Array.from({ length: total }, (_, index) => {
    const symbol = symbols[index % symbols.length];
    const color = colors[index % colors.length];
    const left = (index * 37) % 100;
    const drift = index % 2 === 0 ? `${14 + index}px` : `-${18 + index}px`;
    const duration = 12 + (index % 7) * 1.4;
    const delay = -(index % 11) * 1.25;
    const size = 0.85 + (index % 5) * 0.18;

    return `<span class="floating-heart" style="--left: ${left}%; --drift: ${drift}; --duration: ${duration}s; --delay: ${delay}s; --size: ${size}rem; --color: ${color};">${symbol}</span>`;
  }).join("");
}

class ConfettiEffect {
  constructor() {
    this.canvas = document.querySelector("#confetti-canvas");
    this.context = this.canvas?.getContext("2d");
    this.particles = [];
    this.colors = ["#f7cad4", "#fff6d8", "#f5d98b", "#ffffff", "#dce9d6"];
    this.animationFrame = null;

    if (!this.canvas || !this.context || reduceMotion) {
      return;
    }

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    const ratio = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * ratio;
    this.canvas.height = window.innerHeight * ratio;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  burst(originX = window.innerWidth / 2, originY = window.innerHeight * 0.2) {
    if (!this.context || reduceMotion) {
      return;
    }

    const amount = window.innerWidth < 640 ? 56 : 88;
    for (let index = 0; index < amount; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 2.5 + Math.random() * 4.5;
      this.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 2.8,
        size: 5 + Math.random() * 7,
        gravity: 0.1 + Math.random() * 0.045,
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.25,
        color: this.colors[index % this.colors.length],
        life: 1,
        decay: 0.010 + Math.random() * 0.007,
      });
    }

    if (!this.animationFrame) {
      this.animate();
    }
  }

  animate() {
    this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    this.particles = this.particles.filter((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += particle.gravity;
      particle.rotation += particle.spin;
      particle.life -= particle.decay;

      if (particle.life <= 0 || particle.y > window.innerHeight + 40) {
        return false;
      }

      this.context.save();
      this.context.globalAlpha = Math.max(particle.life, 0);
      this.context.translate(particle.x, particle.y);
      this.context.rotate(particle.rotation);
      this.context.fillStyle = particle.color;
      this.context.fillRect(
        -particle.size / 2,
        -particle.size / 2,
        particle.size,
        particle.size * 0.62,
      );
      this.context.restore();
      return true;
    });

    if (this.particles.length) {
      this.animationFrame = requestAnimationFrame(() => this.animate());
    } else {
      this.animationFrame = null;
      this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
  }
}

function releaseHeartBurst(originX = window.innerWidth / 2, originY = window.innerHeight * 0.55) {
  if (reduceMotion) {
    return;
  }

  const total = 18;
  for (let index = 0; index < total; index += 1) {
    const heart = document.createElement("span");
    const angle = (Math.PI * 2 * index) / total;
    const distance = 70 + Math.random() * 95;
    heart.className = "burst-heart";
    heart.textContent = "♡";
    heart.style.left = `${originX}px`;
    heart.style.top = `${originY}px`;
    heart.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    heart.style.setProperty("--y", `${Math.sin(angle) * distance - 70}px`);
    heart.style.setProperty("--delay", `${index * 18}ms`);
    document.body.appendChild(heart);
    window.setTimeout(() => heart.remove(), 1500);
  }
}

function Hero(photos) {
  const hero = document.querySelector("[data-hero]");
  const heroPhoto = document.querySelector("[data-hero-photo]");
  const empty = document.querySelector("[data-hero-photo-empty]");

  if (!hero || !heroPhoto || !empty) {
    return;
  }

  if (!photos.length) {
    heroPhoto.hidden = true;
    empty.style.display = "grid";
    return;
  }

  const mainPhoto = photoUrl(photos[HERO_PHOTO_INDEX] ?? photos[0]);
  hero.style.setProperty("--hero-image", `url("${mainPhoto}")`);
  heroPhoto.src = mainPhoto;
  heroPhoto.hidden = false;
  empty.style.display = "none";
}

function Qualidades() {
  const container = document.querySelector("[data-qualities]");
  if (!container) {
    return;
  }

  container.innerHTML = QUALITIES.map((quality) => `
    <article class="quality-card reveal">
      <span aria-hidden="true">${quality.initial}</span>
      <h3>${quality.title}</h3>
      <p>${quality.text}</p>
    </article>
  `).join("");
}

function MomentosEspeciais(photos) {
  const container = document.querySelector("[data-moments]");
  if (!container) {
    return;
  }

  const selected = photos.slice(0, 3);

  if (!selected.length) {
    container.innerHTML = MOMENT_TEXTS.map((text) => `
      <article class="moment-card moment-card-text reveal">
        <p>${text}</p>
      </article>
    `).join("");
    return;
  }

  container.innerHTML = selected.map((fileName, index) => `
    <article class="moment-card reveal">
      <img
        src="${photoUrl(fileName)}"
        alt="Momento especial da Caroline ${index + 1}"
        loading="lazy"
      />
      <span class="moment-caption">${PHOTO_CAPTIONS[index % PHOTO_CAPTIONS.length]}</span>
      <p>${MOMENT_TEXTS[index]}</p>
    </article>
  `).join("");
}

function revealOnScroll() {
  const elements = document.querySelectorAll(".section-heading, .letter-card, .quality-card, .moment-card, .final-content");
  elements.forEach((element) => element.classList.add("reveal"));

  if (!("IntersectionObserver" in window) || reduceMotion) {
    elements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 },
  );

  elements.forEach((element) => observer.observe(element));
}

function formatTime(value) {
  if (!Number.isFinite(value)) {
    return "0:00";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function bindMusicPlayer() {
  const player = document.querySelector("[data-music-player]");
  const audio = document.querySelector("[data-music-audio]");
  const button = document.querySelector("[data-music-toggle]");
  const icon = document.querySelector("[data-player-icon]");
  const progress = document.querySelector("[data-music-progress]");
  const currentTime = document.querySelector("[data-current-time]");
  const duration = document.querySelector("[data-duration]");
  const status = document.querySelector("[data-music-status]");
  const presence = document.querySelector("[data-music-presence]");

  if (!player || !audio || !button || !icon || !progress || !currentTime || !duration || !status) {
    return;
  }

  function setProgress(percent) {
    progress.value = String(percent);
    progress.style.setProperty("--progress", `${percent}%`);
  }

  function setPlayingState(isPlaying) {
    player.classList.toggle("is-playing", isPlaying);
    presence?.classList.toggle("is-visible", isPlaying);
    document.body.classList.toggle("music-is-playing", isPlaying);
    button.setAttribute("aria-label", isPlaying ? "Pausar The Climb" : "Tocar The Climb");
    icon.textContent = isPlaying ? "❚❚" : "▶";
    status.textContent = isPlaying ? "Tocando The Climb" : "Pausada";
  }

  audio.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    const percent = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    currentTime.textContent = formatTime(audio.currentTime);
    setProgress(percent);
  });

  audio.addEventListener("ended", () => {
    setPlayingState(false);
    status.textContent = "Pronta para tocar novamente";
    setProgress(0);
  });

  audio.addEventListener("error", () => {
    setPlayingState(false);
    status.textContent = "Coloque o áudio em public/audio/the-climb.mp3";
  });

  progress.addEventListener("input", () => {
    const percent = Number(progress.value);
    setProgress(percent);

    if (audio.duration) {
      audio.currentTime = (percent / 100) * audio.duration;
    }
  });

  button.addEventListener("click", async () => {
    if (audio.paused) {
      try {
        await audio.play();
        setPlayingState(true);
      } catch (error) {
        status.textContent = "Não consegui tocar este arquivo";
        console.warn("Não foi possível tocar o áudio.", error);
      }
      return;
    }

    audio.pause();
    setPlayingState(false);
  });
}

function bindButtons(confetti) {
  const scrollButton = document.querySelector("[data-scroll-message]");
  const backTopButton = document.querySelector("[data-back-top]");
  const surpriseButton = document.querySelector("[data-surprise-button]");
  const surpriseMessage = document.querySelector("[data-surprise-message]");

  scrollButton?.addEventListener("click", (event) => {
    event.preventDefault();
    document.querySelector("#mensagem")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });

    const rect = scrollButton.getBoundingClientRect();
    confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  });

  backTopButton?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  surpriseButton?.addEventListener("click", () => {
    const rect = surpriseButton.getBoundingClientRect();
    if (surpriseMessage) {
      surpriseMessage.hidden = false;
      surpriseMessage.classList.add("is-open");
    }
    surpriseButton.textContent = "Carinho aberto 💖";
    confetti.burst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    releaseHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  });

}

function bindFinalAnimation(confetti) {
  const finalSection = document.querySelector(".final-section");

  if (!finalSection || !("IntersectionObserver" in window)) {
    return;
  }

  let alreadyPlayed = false;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || alreadyPlayed) {
          return;
        }

        alreadyPlayed = true;
        confetti.burst(window.innerWidth / 2, window.innerHeight * 0.35);
        releaseHeartBurst(window.innerWidth / 2, window.innerHeight * 0.55);
        observer.disconnect();
      });
    },
    { threshold: 0.45 },
  );

  observer.observe(finalSection);
}

async function init() {
  FloatingHearts();
  Qualidades();

  const photos = await discoverPhotos();
  Hero(photos);
  MomentosEspeciais(photos);
  revealOnScroll();

  const confetti = new ConfettiEffect();
  bindButtons(confetti);
  bindMusicPlayer();
  bindFinalAnimation(confetti);
  window.setTimeout(() => confetti.burst(), 450);
}

init();
