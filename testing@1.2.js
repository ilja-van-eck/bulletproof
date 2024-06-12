CustomEase.create("main", "0.44, 0.01, 0, 1");
CustomEase.create("reveal", "0.53, 0.02, 0, 0.99");
CustomEase.create("slow-out", "0.19, 1, 0.22, 1");

gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin, CustomEase, SplitText, Flip);
document.querySelector(".app").classList.add("is-loading");

let lenis;
let slideIsChanging = false;
let slideZ = 2;

if (Webflow.env("editor") === undefined) {
  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -13 * t)),
  });

  lenis.on("scroll", ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });

  gsap.ticker.lagSmoothing(0);

  $("[data-lenis-start]").on("click", function () {
    lenis.start();
  });
  $("[data-lenis-stop]").on("click", function () {
    lenis.stop();
  });
  $("[data-lenis-toggle]").on("click", function () {
    $(this).toggleClass("stop-scroll");
    if ($(this).hasClass("stop-scroll")) {
      lenis.stop();
    } else {
      lenis.start();
    }
  });
}
document.addEventListener("DOMContentLoaded", function () {
  var images = document.querySelectorAll("img");
  images.forEach(function (img) {
    img.addEventListener("dragstart", function (event) {
      event.preventDefault();
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const easing = "power4.out";
  let h4Elements = gsap.utils.toArray("[data-reveal-line]");
  h4Elements.forEach((element, index) => {
    gsap.set(element, { y: "100%" });
    gsap.to(element, {
      y: "0%",
      duration: 0.8,
      ease: easing,
      scrollTrigger: {
        trigger: ".section.intro",
        start: "top 45%",
        end: "top 50%",
        toggleActions: "play none none reverse",
      },
      delay: index * 0.1,
    });
  });

  // Parallax effect for the image container
  let introImageContainer = document.querySelector(".h_intro-img");
  gsap.set(introImageContainer, { scale: 0 });
  gsap.to(introImageContainer, {
    scale: 1,
    duration: 1,
    ease: "power4.out",
    scrollTrigger: {
      trigger: ".section.intro",
      start: "top 65%",
      end: "top 50%",
      scrub: true,
    },
  });
});

/* SPLITTING OF LETTERS */
function initSplit() {
  let letterWraps = document.querySelectorAll(".letter-wrap");
  letterWraps.forEach((letterWrap) => {
    let items = letterWrap.querySelectorAll("p");
    var split = new SplitText(items, { type: "chars", charsClass: "char" });
  });
}
initSplit();

/* LOADER */
function initLoader() {
  lenis.stop();
  let homeImageWrap = document.querySelector(".bg_img-wrap");
  let allHomeImages = document.querySelectorAll(".hero_bg-img");
  let heroImageCover = document.querySelectorAll(".hero_img-cover");
  let titles = document.querySelectorAll("[data-reveal]");
  let homeImages = Array.from(allHomeImages).slice(1);
  let bullet = document.querySelector(".load_logo.bullet");
  let proof = document.querySelector(".load_logo.proof");
  let videoWrap = document.querySelector(".cover.hero-vid");
  let videoContainer = document.querySelector(".hero_vid-wrap");
  let videos = Array.from(videoContainer.querySelectorAll("video"));
  let duration = 0.7;
  let startDelay = 0.55;
  let clipPaths = [
    "inset(38vh 40vw)",
    "inset(32vh 38vw)",
    "inset(30vh 30vw)",
    "inset(15vh 25vw)",
  ];

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  shuffle(videos);

  videos.forEach((video) => {
    video.style.display = "none";
  });

  function playVideosSequentially(videos, startIndex) {
    let currentVideoIndex = startIndex;

    function playNextVideo() {
      videos.forEach((video, index) => {
        video.style.display = index === currentVideoIndex ? "block" : "none";
      });

      let currentVideo = videos[currentVideoIndex];
      currentVideo.currentTime = 0;
      currentVideo.play();
      currentVideo.onended = () => {
        currentVideo.style.display = "none";
        currentVideoIndex = (currentVideoIndex + 1) % videos.length;
        playNextVideo();
      };
    }

    playNextVideo();
  }
  let initialVideoIndex = videos.length - 1;

  let timeline = gsap.timeline({
    onStart: () => {
      videos[initialVideoIndex].style.display = "block";
      videos[initialVideoIndex].currentTime = 0;
    },
    onComplete: () => {
      document.querySelector(".app").classList.remove("is-loading");
      lenis.resize();
      lenis.start();
      ScrollTrigger.refresh();
      videos[initialVideoIndex].play();
      videos[initialVideoIndex].onended = () => {
        videos[initialVideoIndex].style.display = "none";
        playVideosSequentially(videos, 0);
      };
    },
  });

  bullet.style.transition =
    "top 0.5s cubic-bezier(0.44, 0.01, 0, 1), left 0.5s cubic-bezier(0.44, 0.01, 0, 1)";
  proof.style.transition =
    "bottom 0.5s cubic-bezier(0.44, 0.01, 0, 1), right 0.5s cubic-bezier(0.44, 0.01, 0, 1)";

  gsap.from(homeImageWrap, {
    y: "25vh",
    delay: startDelay,
    duration: 1.2,
    ease: "main",
  });

  gsap.to(heroImageCover, {
    scaleY: 0,
    rotate: 0.001,
    duration: 1.5,
    delay: startDelay,
    ease: "main",
  });

  clipPaths.forEach((clipPath, index) => {
    let values = clipPath.match(/\d+vh|\d+vw/g);
    let topValueVH = parseInt(values[0]);
    let leftValueVW = parseInt(values[1]);

    timeline.to(
      homeImageWrap,
      {
        clipPath: clipPath,
        delay: startDelay + 0.2,
        duration: duration,
        ease: "main",
        onUpdate: function () {
          bullet.style.top = `${topValueVH}vh`;
          bullet.style.left = `${leftValueVW}vw`;
          proof.style.bottom = `${topValueVH}vh`;
          proof.style.right = `${leftValueVW}vw`;
        },
      },
      index * duration,
    );
  });

  timeline
    .to(
      videoContainer,
      {
        duration: duration,
        ease: "main",
        clipPath: "inset(0% 0px 0px 0px)",
      },
      ">",
    )
    .to(videoWrap, {
      clipPath: "inset(0vh 0vw)",
      duration: 1.3,
      ease: "reveal",
    })
    .to(
      titles,
      {
        x: 0,
        duration: 1.3,
        ease: "reveal",
      },
      "<",
    )
    .from(
      "[data-nav-fade]",
      {
        autoAlpha: 0,
        y: "-2rem",
        duration: 1,
        ease: "reveal",
      },
      "<",
    )
    .to(
      bullet,
      { xPercent: 400, yPercent: 400, duration: 1.3, ease: "reveal" },
      "<",
    )
    .to(
      proof,
      { xPercent: -400, yPercent: 400, duration: 1.3, ease: "reveal" },
      "<",
    )
    .set(homeImages[0], { opacity: 1 }, 1.55)
    .set(homeImages[1], { opacity: 1 }, 1.8)
    .set(homeImages[2], { opacity: 1 }, 2.15) //
    .set(homeImages[3], { opacity: 1 }, 2.325)
    .set(homeImages[4], { opacity: 1 }, 2.5)
    .set(homeImages[5], { opacity: 1 }, 2.675)
    .set(homeImages[6], { opacity: 1 }, 2.85) //
    .set(homeImages[7], { opacity: 1 }, 2.99)
    .set(homeImages[8], { opacity: 1 }, 3.13)
    .set(homeImages[9], { opacity: 1 }, 3.27)
    .set(homeImages[10], { opacity: 1 }, 3.41)
    .set(homeImages[11], { opacity: 1 }, 3.55) //
    .set(homeImages[12], { opacity: 1 }, 3.66)
    .set(homeImages[13], { opacity: 1 }, 3.782)
    .set(homeImages[14], { opacity: 1 }, 3.9)
    .set(homeImages[15], { opacity: 1 }, 4.01)
    .set(homeImages[16], { opacity: 1 }, 4.14)
    .set(homeImages[17], { opacity: 1 }, 4.24) //
    .set(videoContainer, { opacity: 1 }, 4.35);

  // homeImages.forEach((img, index) => {
  //   timeline.fromTo(
  //     img,
  //     {
  //       //clipPath: "inset(100% 0px 0px 0px)",
  //       opacity: 0,
  //     },
  //     {
  //       //clipPath: "inset(0% 0px 0px 0px)",
  //       duration: 0.001,
  //       opacity: 1,
  //       ease: "main",
  //       delay: startDelay + duration + 0.2,
  //     },
  //     index * duration,
  //   );
  // });
}

/* ————— TOGGLE PRELOADER HERE ——————— */
initLoader();
//document.querySelector(".app").classList.remove("is-loading");

/* HERO PARALLAX */
function initHeroParallax() {
  let heroParallax = gsap.timeline({
    scrollTrigger: {
      trigger: "[data-hero-trigger]",
      start: "top bottom",
      end: "top top",
      scrub: true,
    },
    defaults: {
      ease: "linear",
    },
  });

  heroParallax
    .to("[data-hero-target]", {
      y: "40vh",
    })
    .to("#hero_text-1", { x: "15vw" }, 0)
    .to("#hero_text-2", { x: "4vw" }, 0)
    .to("#hero_text-3", { x: "-8vw" }, 0)
    .to("#hero_text-4", { x: "-5vw" }, 0)
    .to("#hero_text-5", { x: "25vw" }, 0);
}
document.addEventListener("DOMContentLoaded", initHeroParallax);

/* LETTER B SCROLL */
function initBscroll() {
  let path = document.querySelector("#b-mask path");
  let initialState = path.getAttribute("d");
  let workWrap = document.querySelector(".work-wrap");
  let chars = workWrap.querySelectorAll(".char");
  let fullScreen = `
    M0,0
    L${window.innerWidth * 0.25},0
    L${window.innerWidth * 0.75},0
    L${window.innerWidth},0
    L${window.innerWidth},${window.innerHeight * 0.25}
    L${window.innerWidth},${window.innerHeight * 0.75}
    L${window.innerWidth},${window.innerHeight}
    L${window.innerWidth * 0.75},${window.innerHeight}
    L${window.innerWidth * 0.25},${window.innerHeight}
    L0,${window.innerHeight}
    L0,${window.innerHeight * 0.75}
    L0,${window.innerHeight * 0.25}
    Z
  `;
  let bInner = document.querySelector(".b-inner path");
  let bOuterPath = document.querySelector(".b-outer path");
  let bInnerPath = bInner.getAttribute("d");
  let bInnerLine = `M0.989777 508L0.989716 468.5V465.852V381V378.818V357V103.5V72.5L0.990013 30.5L0.996254 14.5L0.993576 6.5L0.989716 0.5V48.5V187.5V242.5V328V331.5V332.5V484.5V597V616V584.5V553L0.989258 538.5L0.989777 508Z`;

  randomizeCharPositions();
  gsap.set([".wpf_info-wrap", ".stamp p"], { autoAlpha: 0 });

  // REVEAL
  let revealTl = gsap.timeline({
    defaults: { duration: 1.4, ease: "reveal" },
    paused: true,
  });

  revealTl
    .to(bOuterPath, { opacity: 0, duration: 0.1 })
    .to(workWrap, { background: "D9D9D9", duration: 0.1 })
    .from(
      ".wfb_wrap",
      {
        opacity: 0,
        duration: 0.3,
      },
      0,
    )
    .to(
      path,
      {
        morphSVG: {
          shape: fullScreen,
          shapeIndex: 18,
          //origin: "10% 30%",
          type: "rotational",
        },
        duration: 0.9,
        // delay: 0.5,
      },
      0.05,
    )
    .to(
      ".b-inner",
      {
        scale: 0,
        duration: 0.45,
      },
      0,
    )
    .to(
      workWrap,
      {
        width: "100vw",
        height: "100dvh",
        duration: 0.9,
      },
      0,
    )
    .to(
      chars,
      {
        xPercent: 0,
        yPercent: 0,
        rotate: 0.0001,
        duration: 1,
      },
      0.4,
    )
    .fromTo(
      ".wpf_info-wrap",
      { autoAlpha: 0, yPercent: 50 },
      { autoAlpha: 1, yPercent: 0, duration: 1 },
      0.75,
    )
    .fromTo(
      ".stamp p",
      { autoAlpha: 0, yPercent: 75 },
      { autoAlpha: 1, yPercent: 0, duration: 1, stagger: 0.01 },
      "<",
    );

  // REVERSE B
  let revealReverseTl = gsap.timeline({
    defaults: { duration: 1.4, ease: "reveal" },
    paused: true,
  });

  revealReverseTl
    .to(".stamp p", { autoAlpha: 0, yPercent: 75, duration: 1, stagger: 0.01 })
    .to(".wpf_info-wrap", { autoAlpha: 0, yPercent: 50, duration: 1 }, "<")
    .to(
      chars,
      {
        yPercent: gsap.utils.random([140, -140]),
        rotate: 0.001,
        duration: 1,
      },
      0,
    )
    .to(
      path,
      {
        morphSVG: {
          shape: initialState,
          origin: "10% 30%",
          type: "rotational",
        },
        duration: 0.85,
      },
      0.25,
    )
    .to(
      workWrap,
      {
        width: "35vw",
        height: "47vw",
        duration: 0.9,
      },
      "<+=0.05",
    )
    .to(
      ".b-inner",
      {
        scale: 1,
        duration: 0.9,
      },
      "<",
    )
    .to(
      ".wfb_wrap",
      {
        opacity: 0,
        duration: 0.25,
      },
      ">-=0.3",
    )
    .to(bOuterPath, { opacity: 1, duration: 0.1 }, ">-=0.1");

  let introTl = gsap.timeline({
    defaults: { duration: 1, ease: "linear" },
    scrollTrigger: {
      trigger: "[data-hero-trigger]",
      start: "bottom 90%",
      end: "bottom 40%",
      scrub: true,
      //markers: true,
      onEnter: () => {
        gsap.fromTo(
          bOuterPath,
          { strokeDashoffset: -2750 },
          { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" },
        );
        gsap.fromTo(
          bInner,
          { strokeDashoffset: -1950 },
          {
            strokeDashoffset: 0,
            duration: 1.6,
            delay: 0.25,
            ease: "power2.inOut",
          },
        );
      },
      onLeaveBack: () => {
        gsap.to(bOuterPath, {
          strokeDashoffset: -2750,
          duration: 1.6,
          ease: "power2.inOut",
        });
        gsap.to(bInner, {
          strokeDashoffset: -1950,
          duration: 1.6,
          delay: 0.25,
          ease: "power2.inOut",
        });
      },
    },
  });
  introTl.from(".b-work__wrap", { yPercent: -45 });

  ScrollTrigger.create({
    trigger: "[data-hero-trigger]",
    start: "bottom 40%",
    end: "bottom top",
    // markers: true,
    onEnter: () => {
      gsap.delayedCall(0.35, () => {
        revealTl.progress(0).timeScale(1).play();
      });
      lenis.scrollTo(".full-h", {
        lock: true,
        duration: 1.2,
        onComplete: () => {
          ScrollTrigger.create({
            trigger: "[data-hero-trigger]",
            start: "bottom 5%",
            onLeaveBack: () => {
              revealReverseTl.progress(0).timeScale(1).play();
              lenis.scrollTo(".wfb_anchor", {
                lock: true,
                duration: 1.4,
                onComplete: () => {
                  ScrollTrigger.refresh();
                },
              });
            },
          });
        },
      });
    },
  });

  // let drawBtimeline = gsap.timeline({
  //   defaults: { duration: 1, ease: "linear" },
  //   scrollTrigger: {
  //     trigger: "[data-hero-trigger]",
  //     start: "bottom 80%",
  //     end: "bottom 40%",
  //     scrub: true,
  //     markers: true,
  //   },
  // });

  // drawBtimeline.fromTo(".b-work__wrap", { y: "-30vh" }, { y: "0vh" });
}
initBscroll();

function initFullBleedSlider() {
  let wrap = document.querySelector('[data-slider="wrap"]');
  let slides = wrap.querySelectorAll('[data-slider="slide"]');
  let crumbs = wrap.querySelectorAll('[data-slider="crumb"]');
  let clients = wrap.querySelectorAll('[data-slider="client"]');
  let totalSlidesNr = wrap.querySelector('[data-slider="total-slides"]');
  let activeSlideNr = wrap.querySelector('[data-slider="active-slide"]');

  slides[0].classList.add("active");
  crumbs[0].classList.add("active");

  let totalSlides = slides.length;
  totalSlidesNr.innerHTML = totalSlides;

  crumbs.forEach((crumb, index) => {
    crumb.addEventListener("click", () => {
      let currentSlide = wrap.querySelector(".wfb_full-bleed.active");
      let newSlide = slides[index];

      if (currentSlide === newSlide || slideIsChanging) return;
      slideIsChanging = true;
      slideZ++;

      crumbs.forEach((c) => c.classList.remove("active"));
      crumb.classList.add("active");

      activeSlideNr.innerHTML = index + 1;

      randomizeCharPositions(newSlide);

      animateOut(currentSlide);
      animateIn(newSlide, 0);

      gsap.to(clients, {
        yPercent: -index * 100,
        duration: 1,
        ease: "slow-out",
      });
    });
  });
}

function animateOut(currentSlide) {
  let letters = currentSlide.querySelectorAll(".char");
  letters.forEach((l) => {
    gsap.to(l, {
      yPercent: gsap.utils.random([-115, 115]),
      duration: 0.6,
      ease: "slow-out",
    });
  });
  gsap
    .timeline()
    .set(
      currentSlide,
      {
        display: "none",
      },
      1.2,
    )
    .call(() => currentSlide.classList.remove("active"));
}

function animateIn(newSlide, delay = 0) {
  let letters = newSlide.querySelectorAll(".char");
  let images = newSlide.querySelectorAll(".bg_img");
  gsap
    .timeline()
    .set(
      newSlide,
      {
        display: "block",
      },
      "+=" + delay,
    )
    .set(newSlide, { zIndex: slideZ }, 0)
    .set(images, { clipPath: "inset(0% 0% 0% 100%)" }, 0)
    .to(images, {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 1.2,
      ease: "slow-out",
    })
    .to(
      letters,
      {
        xPercent: 0,
        yPercent: 0,
        duration: 0.8,
        ease: "slow-out",
        onComplete: () => {
          slideIsChanging = false;
        },
      },
      "<+=0.2",
    )
    .call(() => newSlide.classList.add("active"));
}
initFullBleedSlider();

function initHomeWork() {
  let filterButtonList = document.querySelector('[data-work-filter="list"]');
  let filterButtonGrid = document.querySelector('[data-work-filter="grid"]');
  let listWrap = document.querySelector(".home-work__list-w");
  let listItems = document.querySelectorAll(".home-work__list-item");
  let listItemLinks = document.querySelectorAll(".home-work__list-item a");
  let listMiniPosters = document.querySelectorAll(".home-work__list-thumb");
  let listMiniImages = document.querySelectorAll(".home-work__list-thumb img");
  let gridWrap = document.querySelector(".home-work__grid-w");
  let gridItems = document.querySelectorAll(".home-work__grid-item");
  let gridImageWrappers = document.querySelectorAll(
    '[data-work-grid="img-wrap"]',
  );
  let initialClasses = [];

  filterButtonGrid.addEventListener("mouseenter", () => {
    initialClasses = Array.from(listItems).map((item) => ({
      element: item,
      faded: item.classList.contains("faded"),
      active: item.classList.contains("active"),
    }));

    gsap.to(listMiniPosters, {
      opacity: 1,
      overwrite: "auto",
      stagger: 0.01,
      duration: 0.6,
      ease: "slow-out",
    });
    listItems.forEach((item) => {
      item.classList.remove("faded");
      item.classList.remove("active");
    });
    gsap.set(".home-work__list-poster", { opacity: 0, overwrite: true });
  });

  filterButtonGrid.addEventListener("mouseleave", () => {
    gsap.to(listMiniPosters, {
      opacity: 0,
      overwrite: "auto",
      duration: 0.4,
      ease: "slow-out",
    });
    gsap.to(".home-work__list-poster", { opacity: 1 });

    initialClasses.forEach(({ element, faded, active }) => {
      if (faded) element.classList.add("faded");
      if (active) element.classList.add("active");
    });
  });

  let zIndex = 1;

  ScrollTrigger.create({
    trigger: listItems[0],
    start: "top 48%",
    end: "bottom 48%",
    onLeaveBack: () => {
      listItems.forEach((item) => {
        item.classList.remove("active");
        item.classList.remove("faded");
      });
    },
  });
  ScrollTrigger.create({
    trigger: listItems[listItems.length - 1],
    start: "top 48%",
    end: "bottom 48%",
    onLeave: () => {
      listItems.forEach((item) => {
        item.classList.remove("active");
        item.classList.remove("faded");
      });
    },
  });

  listItems.forEach((item) => {
    let listItemHeight = item.offsetHeight + 1;

    ScrollTrigger.create({
      trigger: item,
      start: "top 48%",
      end: `+=${listItemHeight}`,
      onEnter: () => togglePosterDisplay(item, true),
      onLeave: () => togglePosterDisplay(item, false),
      onEnterBack: () => togglePosterDisplay(item, true),
      onLeaveBack: () => togglePosterDisplay(item, false),
    });
  });
  function togglePosterDisplay(item, isVisible) {
    item.style.zIndex = zIndex++;
    let poster = item.querySelector(".home-work__list-poster");
    if (poster) {
      poster.style.display = isVisible ? "block" : "none";
    }
    // let poster = item.querySelector(".poster-img");
    // let posterWrap = item.querySelector(".home-work__list-poster");
    // if (poster) {
    //   gsap.set(posterWrap, {
    //     display: isVisible ? "block" : "none",
    //     delay: isVisible ? 0 : 0.6,
    //   });
    //   gsap.to(poster, {
    //     clipPath: isVisible ? "inset(0%)" : "inset(50%)",
    //     duration: 0.6,
    //     delay: isVisible ? 0 : 0.6,
    //     ease: "reveal",
    //   });
    // }

    if (isVisible) {
      item.classList.add("active");
      item.classList.remove("faded");
      let link = item.querySelector("a");
      if (link) {
        link.classList.add("blend-difference");
      }
      listItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem.classList.remove("active");
          otherItem.classList.add("faded");
        }
      });
    }
    // else {
    //   item.classList.remove("active");
    //   let link = item.querySelector("a");
    //   if (link) {
    //     link.classList.remove("blend-difference");
    //   }
    //   listItems.forEach((otherItem) => {
    //     otherItem.classList.remove("faded");
    //   });
    // }
  }
  let listOrderElements = document.querySelectorAll("[data-list-order]");
  listOrderElements.forEach((element, index) => {
    let orderNumber = (index + 1).toString().padStart(2, "0");
    element.textContent = orderNumber;
  });

  const workListItems = document.querySelectorAll('[data-work-list="inner"]');
  workListItems.forEach((item, index) => {
    const direction = index % 2 === 0 ? -5 : 5;
    gsap.fromTo(
      item,
      { xPercent: 0 },
      {
        xPercent: direction,
        scrollTrigger: {
          trigger: item,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });
}
initHomeWork();

function initHomeWorkViews() {
  let filterButtonList = document.querySelector('[data-work-filter="list"]');
  let filterButtonGrid = document.querySelector('[data-work-filter="grid"]');
  let listWrap = document.querySelector(".home-work__list-w");
  let listItems = document.querySelectorAll(".home-work__list-item");
  let listMiniPosters = document.querySelectorAll(".home-work__list-thumb");
  let listMiniImageWrapper = document.querySelectorAll(".list-thumb__wrap");
  let listMiniImages = document.querySelectorAll(".home-work__list-thumb img");
  let gridWrap = document.querySelector(".home-work__grid-w");
  let gridItems = document.querySelectorAll(".home-work__grid-item");
  let gridImageWrappers = document.querySelectorAll(
    '[data-work-grid="img-wrap"]',
  );
  let chars = gridWrap.querySelectorAll(".char");
  let flipImages = document.querySelectorAll("[data-work-img]");

  randomizeCharPositions();

  let gridRevealTimeline = gsap.timeline({
    defaults: { duration: 0.6, ease: "slow-out" },
    paused: true,
  });

  gridRevealTimeline
    .set(".home-work__list-poster", { autoAlpha: 0 })
    .to("[data-list-item-child]", {
      yPercent: 130,
      onComplete: () => {
        gsap.set(listWrap, { display: "none" });
      },
    })
    .fromTo(
      ".poster-gradient",
      { scaleY: 0 },
      { scaleY: 1, duration: 0.8 },
      ">+=1",
    )
    .fromTo(
      "[data-poster-fade]",
      { autoAlpha: 0, yPercent: 50 },
      { autoAlpha: 1, yPercent: 0, stagger: 0.005 },
      "<",
    )
    .to(
      chars,
      {
        xPercent: 0,
        yPercent: 0,
        rotate: 0.0001,
        duration: 1,
      },
      "<",
    );

  filterButtonGrid.addEventListener("click", () => {
    gridWrap.style.display = "block";
    filterButtonGrid.classList.remove("inactive");
    filterButtonList.classList.add("inactive");
    gsap.delayedCall(0.8, () => {
      lenis.scrollTo(".home-grid__scroll-anchor", {
        duration: 1.5,
        lock: true,
      });
    });

    let state = Flip.getState(listMiniImageWrapper);

    listItems.forEach((item) => {
      item.classList.remove("active");
      item.classList.remove("faded");
    });

    listMiniImageWrapper.forEach((img, index) => {
      let image = img.querySelector("img");
      gsap.to(image, { width: "140%", duration: 1.5, ease: "expo.inOut" });
      if (gridImageWrappers[index]) {
        gridImageWrappers[index].appendChild(img);
      }
    });

    gridRevealTimeline.progress(0).play();

    Flip.from(state, {
      duration: 1.5,
      ease: "expo.inOut",
      //stagger: 0.025,
      delay: 0.6,
      absolute: true,
      onStart: () => {
        gsap.set(listWrap, { pointerEvents: "none" });
      },
    });
  });

  let gridCloseTimeline = gsap.timeline({
    defaults: {
      duration: 0.6,
      ease: "power3.inOut",
    },
    onComplete: () => {
      gsap.set(".home-work__list-poster", {
        autoAlpha: 1,
        clearProps: "all",
      });
      gsap.set(listWrap, { pointerEvents: "auto" });
    },
    paused: true,
  });

  gridCloseTimeline
    .set(".home-work__list-thumb", { opacity: 1 })
    .set("[data-list-item-child]", { opacity: 0 }, 0)
    .set(".clip-vertical", { overflow: "visible" }, 0)
    .to(".poster-gradient", { scaleY: 0 })
    .to("[data-poster-fade]", { autoAlpha: 0, yPercent: 50 }, "<")
    .to(
      chars,
      {
        yPercent: gsap.utils.random([-115, 115]),
        rotate: 0.0001,
      },
      "<",
    )
    .to("[data-list-item-child]", {
      yPercent: 0,
      opacity: 1,
      duration: 0.75,
      stagger: { amount: 0.1 },
      delay: 0.8,
      ease: "slow-out",
      onStart: () => {
        gsap.set("[data-list-item-child]", { opacity: 1 });
      },
      onComplete: () => {
        gsap.set(".clip-vertical", { overflowX: "visible", overflowY: "clip" });
        gsap.set(gridWrap, { display: "none" });
      },
    });

  filterButtonList.addEventListener("click", () => {
    listWrap.style.display = "block";
    filterButtonList.classList.remove("inactive");
    filterButtonGrid.classList.add("inactive");
    lenis.stop();
    gsap.set(".home-work__list-poster", { autoAlpha: 0 });
    //lenis.scrollTo(".home-work__wrap", { duration: 1.2, lock: true });

    listItems.forEach((item) => {
      item.classList.remove("active");
      item.classList.remove("faded");
    });

    gridCloseTimeline.progress(0).play();

    listMiniImageWrapper = document.querySelectorAll(".list-thumb__wrap");

    let state = Flip.getState(listMiniImageWrapper);

    listMiniImageWrapper.forEach((img, index) => {
      let image = img.querySelector("img");
      gsap.to(image, {
        x: 0,
        width: "100%",
        delay: 1,
        duration: 1,
        ease: "expo.inOut",
      });
      if (listMiniPosters[index]) {
        listMiniPosters[index].appendChild(img);
      }
    });

    Flip.from(state, {
      duration: 1,
      ease: "power4.inOut",
      delay: 0.8,
      stagger: 0.025,
      absolute: true,
      zIndex: 10,
      onComplete: () => {
        lenis.start();
        gsap.set(gridWrap, { display: "none" });
        gsap.set(".home-work__list-poster", {
          autoAlpha: 1,
          clearProps: "all",
        });
        gsap.set(".clip-vertical", { overflowY: "clip" });
        gsap.to(listMiniPosters, {
          opacity: 0,
          overwrite: true,
          duration: 1,
          stagger: { amount: 0.05 },
          ease: "slow-out",
        });
      },
    });
  });
}
initHomeWorkViews();

function initHomeGridSlider() {
  const lerp = (t, e, s) => (1 - s) * t + s * e,
    clamp = (t, e, s) => Math.max(e, Math.min(t, s));
  class DragScroll {
    constructor(t) {
      (this.el = document.querySelector(t.el)),
        (this.wrap = this.el.querySelector(t.wrap)),
        (this.items = this.el.querySelectorAll(t.item)),
        (this.isDragging = false),
        (this.touchStartX = 0),
        (this.touchStartY = 0),
        this.init();
    }
    init() {
      (this.progress = 0),
        (this.oldProgress = 0),
        (this.speed = 0),
        (this.oldX = 0),
        (this.x = 0),
        (this.playrate = 0),
        (this.actualMargin = 0.5),
        (this.innerElements = Array.from(this.items).map((t) =>
          t.querySelector(".poster-w"),
        )),
        this.bindings(),
        this.events(),
        this.calculate(),
        requestAnimationFrame(() => this.setInitialProgress());
      this.raf();
    }
    setInitialProgress() {
      this.progress = this.maxScroll / 2;
      this.x = this.progress;
      this.wrap.style.transform = `translate3d(${-this.x}px, 0, 0)`;
    }
    bindings() {
      [
        "events",
        "calculate",
        "handleWheel",
        "move",
        "raf",
        "handleTouchStart",
        "handleTouchMove",
        "handleTouchEnd",
        "handleClick",
        "handleKeyDown",
      ].forEach((t) => {
        this[t] = this[t].bind(this);
      });
    }
    calculate() {
      let t;
      (t = window.innerWidth < 480 ? 2.45 : 1.63),
        (this.marginOffset = 1.79 * window.innerWidth),
        (this.wrapWidth = this.items[0].clientWidth * this.items.length),
        (this.wrap.style.width = `${this.wrapWidth}px`),
        (this.maxScroll =
          this.wrapWidth - this.el.clientWidth + t * this.marginOffset),
        (this.viewportWidth = this.el.clientWidth),
        (this.itemWidth = this.items[0].clientWidth);
    }
    handleWheel(t) {
      //(this.progress += t.deltaY + t.deltaX), this.move();
      (this.progress += t.deltaX), this.move();
    }
    handleTouchStart(t) {
      t.preventDefault(),
        t.stopPropagation(),
        (this.dragging = !0),
        (this.startX = t.clientX || t.touches[0].clientX),
        (this.startY = t.clientY || t.touches[0].clientY),
        (this.touchStartX = this.startX),
        (this.touchStartY = this.startY),
        (this.isDragging = false),
        setTimeout(() => {
          this.el.classList.add("dragging");
        }, 200);
    }
    handleTouchMove(t) {
      if (!this.dragging) return !1;
      this.isDragging = true;
      t.stopPropagation();
      let e = t.clientX || t.touches[0].clientX,
        s = t.clientY || t.touches[0].clientY,
        i = this.startX - e,
        h = this.startY - s;
      (this.progress += Math.abs(i) > Math.abs(h) ? 1.6 * i : 1.6 * h),
        (this.startX = e),
        (this.startY = s),
        this.move();
    }
    handleTouchEnd(t) {
      if (!this.dragging) return;
      t.stopPropagation();

      const isTouchEvent = t.changedTouches && t.changedTouches.length > 0;
      const touchEndX = isTouchEvent ? t.changedTouches[0].clientX : t.clientX;
      const touchEndY = isTouchEvent ? t.changedTouches[0].clientY : t.clientY;
      const distanceMoved = Math.sqrt(
        Math.pow(touchEndX - this.touchStartX, 2) +
          Math.pow(touchEndY - this.touchStartY, 2),
      );

      if (!this.isDragging || distanceMoved < 10) {
        const clickedElement = document.elementFromPoint(touchEndX, touchEndY);
        const linkElement = clickedElement.closest(".poster-w");
        if (linkElement) {
          linkElement.click();
        }
      }
      setTimeout(() => {
        this.dragging = false;
        this.el.classList.remove("dragging");
      }, 200);
    }
    handleClick(t) {
      this.dragging && (t.preventDefault(), t.stopPropagation());
    }
    handleKeyDown(t) {
      "ArrowRight" === t.key
        ? ((this.progress += 250), this.move())
        : "ArrowLeft" === t.key && ((this.progress -= 250), this.move());
    }
    move() {
      this.progress = clamp(this.progress, 0, this.maxScroll);
    }
    events() {
      window.addEventListener("resize", () => {
        this.calculate();
        this.setInitialProgress();
      }),
        window.addEventListener("wheel", this.handleWheel),
        this.el.addEventListener("touchstart", this.handleTouchStart),
        window.addEventListener("touchmove", this.handleTouchMove),
        window.addEventListener("touchend", this.handleTouchEnd),
        window.addEventListener("mousedown", this.handleTouchStart),
        window.addEventListener("mousemove", this.handleTouchMove),
        window.addEventListener("mouseup", this.handleTouchEnd),
        document.body.addEventListener("mouseleave", this.handleTouchEnd),
        document.addEventListener("keydown", this.handleKeyDown.bind(this)),
        this.items.forEach((t) => {
          t.addEventListener("click", this.handleClick);
        });
    }
    raf() {
      const lerpFactor = window.innerWidth < 480 ? 0.2 : 0.1;
      (this.x = lerp(this.x, this.progress, lerpFactor)),
        (this.playrate = this.x / this.maxScroll),
        (this.wrap.style.transform = `translate3d(${-this.x}px, 0, 0)`),
        (this.speed = Math.min(100, this.oldX - this.x)),
        (this.oldX = this.x);
      let t = 0.5 + 0.2 * Math.abs(this.speed);
      (this.actualMargin = lerp(this.actualMargin, t, 0.1)),
        (this.actualMargin = clamp(this.actualMargin, 0.5, 2)),
        this.items.forEach((t, e) => {
          t.style.marginRight = `${this.actualMargin}vw`;
          this.applyParallaxEffect(t, e);
        });
      let e = (this.progress, this.oldProgress, 1),
        s = 0.2 * Math.abs(this.speed),
        i = clamp(s * e, -15, 15);
      this.innerElements.forEach((t) => {
        t.style.transform = `rotateX(0deg) rotateY(${i}deg) rotateZ(0.001deg)`;
      }),
        (this.oldProgress = this.progress);
    }
    applyParallaxEffect(item, index) {
      const itemRect = item.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const itemCenter = itemRect.left + itemRect.width / 2;
      const viewportCenter = viewportWidth / 2;
      const distanceFromCenter = itemCenter - viewportCenter;
      const maxDistance = viewportWidth + itemRect.width / 2;
      const progress = clamp(distanceFromCenter / maxDistance, -1, 1);

      const innerImage = item.querySelector("[data-img-track]");
      if (!innerImage) return;

      const parallaxFactor = 0.3;
      const parallaxOffset = progress * parallaxFactor * itemRect.width;

      innerImage.style.transform = `translate3d(-${parallaxOffset}px, 0, 0)`;
    }
  }
  const scroll = new DragScroll({
      el: ".home-work__grid-w",
      wrap: ".home-work__grid-list",
      item: ".home-work__grid-item",
    }),
    animateScroll = () => {
      requestAnimationFrame(animateScroll), scroll.raf();
    };
  animateScroll();
}
initHomeGridSlider();

function initLocations() {
  let section = document.querySelector(".section.locations");
  let triggers = section.querySelectorAll(".loc_title");
  let details = document.querySelectorAll(".loc_details.w-richtext");
  let bgImage = document.querySelector("[data-location-bg]");
  let bgBlend = document.querySelector("[data-location-blend]");
  let bImage = document.querySelector("[data-location-b]");
  //let bOutline = document.querySelector(".loc_letter");
  let originalParent = null;
  let currentTrigger = null;
  let scrollPos = 0;

  let tl = gsap.timeline({
    scrollTrigger: {
      trigger: section,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
  tl.fromTo(
    [bgImage, bImage],
    {
      y: "-30%",
    },
    {
      y: "30%",
    },
    0,
  );
  tl.fromTo(
    [bgBlend, bgBlend],
    {
      y: "-30%",
    },
    {
      y: "30%",
    },
    0,
  );

  details.forEach((detail) => {
    let paragraphs = detail.querySelectorAll("p");
    paragraphs.forEach((paragraph) => {
      let wrapper = document.createElement("div");
      paragraph.parentNode.insertBefore(wrapper, paragraph);
      wrapper.appendChild(paragraph);
      wrapper.style.overflow = "hidden";
    });
  });

  triggers.forEach((trigger) => {
    // Hover
    trigger.addEventListener("mouseenter", () => {
      triggers.forEach((otherTrigger) => {
        if (otherTrigger !== trigger) {
          otherTrigger.classList.add("faded");
        }
      });
    });

    // Hover out
    trigger.addEventListener("mouseleave", () => {
      triggers.forEach((otherTrigger) => {
        otherTrigger.classList.remove("faded");
      });
    });

    // Click
    trigger.addEventListener("click", () => {
      let cityName = trigger.textContent.trim().toLowerCase();
      let targetElement = null;

      section.querySelectorAll("[data-city]").forEach((element) => {
        if (
          element.getAttribute("data-city").trim().toLowerCase() === cityName
        ) {
          targetElement = element;
        }
      });

      if (targetElement) {
        // lenis.scrollTo(".loc_details-wrap", {
        //   duration: 1,
        //   lock: true,
        //   onComplete: () => {
        //     scrollPos = window.scrollY;
        //     window.addEventListener("scroll", onScroll);
        //     document.addEventListener("click", onClickOutside);
        //   },
        // });
        gsap.delayedCall(1, () => {
          scrollPos = window.scrollY;
          window.addEventListener("scroll", onScroll);
          document.addEventListener("click", onClickOutside);
        });
        let lines = targetElement.querySelectorAll("p");
        gsap.set(targetElement, { autoAlpha: 1 });
        gsap.fromTo(
          lines,
          {
            yPercent: 110,
          },
          {
            yPercent: 0,
            duration: 1,
            delay: 0.5,
            ease: "slow-out",
            stagger: 0.05,
          },
        );

        let parent = trigger.parentElement;
        let siblings = Array.from(parent.parentElement.children);
        let siblingsBefore = siblings.slice(0, siblings.indexOf(parent));
        let siblingsAfter = siblings.slice(siblings.indexOf(parent) + 1);

        let row = parent.parentElement;
        let rows = Array.from(row.parentElement.children);
        let rowsBefore = rows.slice(0, rows.indexOf(row));
        let rowsAfter = rows.slice(rows.indexOf(row) + 1);

        gsap.to(siblingsBefore, {
          x: "-100vw",
          duration: 1.2,
          ease: "slow-out",
        });
        gsap.to(siblingsAfter, {
          x: "100vw",
          duration: 1.2,
          ease: "slow-out",
        });
        gsap.to(rowsBefore, {
          y: "-110vh",
          duration: 0.8,
          opacity: 0,
          stagger: 0.02,
          ease: "power3.inOut",
        });
        gsap.to(rowsAfter, {
          y: "110vh",
          duration: 0.8,
          opacity: 0,
          stagger: { each: 0.02, from: "end" },
          ease: "power3.inOut",
        });

        let parentWidth = window.getComputedStyle(parent).width;
        let parentHeight = window.getComputedStyle(parent).height;
        parent.style.width = parentWidth;
        parent.style.height = parentHeight;

        let state = Flip.getState(trigger);
        let targetContainer = targetElement.querySelector(".loc_details-title");
        targetContainer.appendChild(trigger);

        Flip.from(state, {
          absolute: true,
          zIndex: 2,
          duration: 1,
          delay: 0.4,
          ease: "slow-out",
          overwrite: "auto",
        });
        originalParent = parent;
        currentTrigger = trigger;
      }
    });
  });
  function onScroll() {
    if (Math.abs(window.scrollY - scrollPos) > 50) {
      closeLocation();
    }
  }

  function onClickOutside(event) {
    if (currentTrigger && !event.target.closest(".loc_details-item")) {
      closeLocation();
    }
  }

  function closeLocation() {
    if (currentTrigger && originalParent) {
      let lines = currentTrigger.closest("[data-city]").querySelectorAll("p");

      gsap.to(".loc_tite-row", {
        y: "0",
        opacity: 1,
        duration: 1,
        ease: "slow-out",
      });
      gsap.to(".loc_title-wrap", {
        x: "0",
        opacity: 1,
        duration: 1,
        ease: "slow-out",
      });
      gsap.to(lines, {
        yPercent: 110,
        duration: 0.8,

        ease: "slow-out",
        stagger: 0.05,
        onComplete: () => {
          gsap.set("[data-city]", { autoAlpha: 0 });
        },
      });

      let state = Flip.getState(currentTrigger);
      originalParent.appendChild(currentTrigger);
      Flip.from(state, {
        absolute: true,
        zIndex: 2,
        duration: 1,
        ease: "slow-out",
      });

      currentTrigger = null;
      originalParent = null;
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClickOutside);
    }
  }
}
initLocations();

document.addEventListener("DOMContentLoaded", function () {
  const bullet = document.querySelector(".bpf_logo.is-left");
  const proof = document.querySelector(".bpf_logo.is-right");
  const locations = document.querySelector(".bpf_blocks");

  const footerTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".bpf_logo_wrap",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      //markers: true,
    },
  });

  footerTimeline
    .fromTo(
      bullet,
      { xPercent: 0 },
      { xPercent: -50, duration: 2, ease: "power4.out" },
      0,
    )
    .fromTo(
      proof,
      { xPercent: 0 },
      { xPercent: 50, duration: 2, ease: "power4.out" },
      0,
    )
    .fromTo(
      locations,
      { yPercent: 100, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 1, ease: "power4.out" },
      ">-1",
    );
});

const workTestElement = document.querySelector("[data-work-test]");
const bleedItems = document.querySelectorAll(".wfb_full-bleed");

let currentIndex = 0;

workTestElement.addEventListener("click", () => {
  bleedItems[currentIndex].classList.remove("active");

  if (currentIndex === bleedItems.length - 1) {
    currentIndex = 0;
  } else {
    currentIndex = (currentIndex + 1) % bleedItems.length;
  }

  const activeItem = bleedItems[currentIndex];
  const activeChars = activeItem.querySelectorAll(".char");
  gsap.to(
    activeChars,
    {
      xPercent: 0,
      yPercent: 0,
      rotate: 0.0001,
      stagger: 0.025,
      duration: 0.3,
    },
    0.65,
  );

  bleedItems[currentIndex].classList.add("active");
});

bleedItems[currentIndex].classList.add("active");
function randomizeCharPositions(target) {
  target = target || document;
  let letterItems = target.querySelectorAll(".letter-item");
  letterItems.forEach((letterItem) => {
    let charElements = Array.from(letterItem.querySelectorAll(".char"));
    if (charElements.length === 1) {
      let randomPosition = gsap.utils.random([
        { yPercent: 140, rotate: 0.001 },
        { yPercent: -140, rotate: 0.001 },
      ]);
      gsap.set(charElements[0], randomPosition);
      return;
    } else {
      gsap.set(charElements[0], { xPercent: -140, rotate: 0.001 });
      gsap.set(charElements[charElements.length - 1], {
        xPercent: 140,
        rotate: 0.001,
      });
      gsap.set(charElements.slice(1, charElements.length - 1), {
        yPercent: gsap.utils.random([-110, 110]),
        rotate: 0.001,
      });
    }
  });
}
