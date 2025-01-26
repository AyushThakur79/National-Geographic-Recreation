document.addEventListener("DOMContentLoaded", function () {
	const scroll = new LocomotiveScroll({
		el: document.querySelector("[data-scroll-container]"),
		smooth: true,
	});

	gsap.registerPlugin(ScrollTrigger);

	ScrollTrigger.scrollerProxy("[data-scroll-container]", {
		scrollTop(value) {
			return arguments.length
				? scroll.scrollTo(value, 0, 0)
				: scroll.scroll.instance.scroll.y;
		},
		getBoundingClientRect() {
			return {
				top: 0,
				left: 0,
				width: window.innerWidth,
				height: window.innerHeight,
			};
		},
		pinType: document.querySelector("[data-scroll-container]").style.transform
			? "transform"
			: "fixed",
	});

	scroll.on("scroll", ScrollTrigger.update);
	window.addEventListener("resize", () => {
		ScrollTrigger.refresh();
		scroll.update();
	});

	// Loader Animation
	function loaderAnimation() {
		let tl = gsap.timeline();
		let loadingElement = document.querySelector(".counter");
		let current = 0;

		function updateLoading() {
			if (current === 100) {
				tl.to(".loader > *", {
					duration: 1,
					y: "-10%",
					opacity: 0,
					stagger: 0.1,
					onComplete: () => {
						gsap.to(".loader", {
							duration: 0.5,
							top: "-100%",
							ease: "expo.in",
							onComplete: () => {
								document.querySelector(".loader").style.display = "none";
								animateHeroTitle();
							},
						});
					},
				});
				return;
			}
			current += Math.floor(Math.random() * 10) + 1;
			if (current > 100) current = 100;
			loadingElement.textContent = current + "%";
			setTimeout(updateLoading, Math.floor(Math.random() * 200) + 50);
		}
		updateLoading();

		let spans = document.querySelectorAll(".left-side h1 span");
		gsap.set(spans, { y: 30, opacity: 0 });
		tl.to(spans, { duration: 1, opacity: 1, y: 0, stagger: { amount: 0.3 } });
	}

	function animateHeroTitle() {
		let heroTitleSpans = document.querySelectorAll(
			".hero-title span, .logo, .hero-text h4 span, .hero-images img"
		);
		let navLinks = document.querySelectorAll(".nav-links a");
		let heroImages = document.querySelectorAll(".hero-images img");
		gsap.set(heroTitleSpans, { y: 50, opacity: 0 });
		gsap.set(navLinks, { y: 40 });
		gsap.set(heroImages, { y: 20, opacity: 0 });
		gsap.to(heroTitleSpans, {
			duration: 1,
			opacity: 1,
			y: 0,
			stagger: { amount: 0.3 },
			ease: "power4.out",
		});
		gsap.to(heroImages, {
			duration: 1,
			opacity: 1,
			y: 0,
			stagger: 0.09,
			ease: "power2.out",
		});
		gsap.to(navLinks, {
			duration: 1,
			y: 0,
			stagger: 0.05,
			ease: "power2.out",
		});
	}

	window.onload = function () {
		setTimeout(() => window.scrollTo(0, 0), 100);
		loaderAnimation();
	};

	function menuAnimation() {
		const links = document.querySelectorAll(".links a");
		const images = document.querySelectorAll(".images img");
		const menu = document.querySelector(".menu");
		const menuButton = document.querySelector(".nav-links a:nth-child(4)");
		const closeButton = document.querySelector(".close-link");

		gsap.set(images, { opacity: 0 });

		links.forEach((link) => {
			link.addEventListener("mouseenter", () => {
				const target = link.getAttribute("data-target");
				images.forEach((img) => {
					gsap.to(img, { opacity: img.id === target ? 1 : 0, duration: 0.5 });
				});
			});
		});

		const openMenuAnimation = gsap.timeline({ paused: true });
		openMenuAnimation
			.to(menu, {
				top: 0,
				duration: 1,
				ease: "power4.out",
				toggleActions: "play none reverse reset",
			})
			.fromTo(
				".quotes p span, .end-menu p span, .contact-close p span",
				{ y: 50 },
				{ y: 0, duration: 0.6, stagger: 0.09 },
				"<"
			)
			.fromTo(
				".contact-close p span",
				{ y: -50 },
				{ y: 0, duration: 0.6, stagger: 0.09 },
				"<"
			);

		const closeMenuAnimation = gsap.timeline({ paused: true });
		closeMenuAnimation
			.fromTo(
				".quotes p span, .end-menu p span, .contact-close p span",
				{ y: 0 },
				{ y: 50, duration: 0.6, stagger: 0.09 },
				"<"
			)
			.fromTo(
				".contact-close p span",
				{ y: 0 },
				{ y: -50, duration: 0.1, stagger: 0.09 },
				"<"
			)
			.to(menu, { top: "-100%", duration: 1, ease: "power3.out" }, "<");

		menuButton.addEventListener("click", (e) => {
			e.preventDefault();
			openMenuAnimation.restart();
		});

		closeButton.addEventListener("click", (e) => {
			e.preventDefault();
			closeMenuAnimation.restart();
		});
	}

	function pageBlocks() {
		const blockRows = document.querySelectorAll(".blocks-row");

		blockRows.forEach(createBlocks);

		const blockContainers = document.querySelectorAll(".blocks-container");

		blockContainers.forEach(setupScrollTriggers);

		function createBlocks(row) {
			const fragment = document.createDocumentFragment();

			for (let i = 0; i < 16; i++) {
				const block = document.createElement("div");
				block.className = "block";
				fragment.appendChild(block);
			}

			row.appendChild(fragment);
		}

		function setupScrollTriggers(container) {
			const rows = container.querySelectorAll(".blocks-row");
			const numRows = rows.length;

			rows.forEach((row, rowIndex) => {
				let blocks = Array.from(row.querySelectorAll(".block"));
				let isTop = container.classList.contains("top");
				let randomizedOrder = gsap.utils.shuffle(blocks.map((_, idx) => idx));

				ScrollTrigger.create({
					trigger: container,
					scroller: "[data-scroll-container]",
					start: "top bottom",
					end: "bottom top",
					scrub: true,
					onUpdate: (self) => {
						let progress = self.progress;
						let rowDelay = 0.3 * (numRows - rowIndex - 1);
						let adjustedProgress = Math.max(
							0,
							Math.min(1, progress - rowDelay)
						);
						updateBlocksOpacity(
							blocks,
							randomizedOrder,
							isTop,
							adjustedProgress
						);
					},
				});
			});
		}
	}
	function updateBlocksOpacity(blocks, order, isTop, progress) {
		blocks.forEach((block, idx) => {
			let offset = order.indexOf(idx) / blocks.length;
			let adjustedProgress = (progress - offset) * blocks.length;
			let opacity = isTop
				? 1 - Math.min(1, Math.max(0, adjustedProgress))
				: Math.min(1, Math.max(0, adjustedProgress));
			block.style.opacity = opacity;
		});
	}

	// Page2 Animation
	function page2Animation() {
		let page2Spans = document.querySelectorAll(".page2 h4 span");
		let imagesSpan = document.querySelectorAll(".images");
		gsap.set(page2Spans, { opacity: 0, y: 50 });

		gsap.to(page2Spans, {
			scrollTrigger: {
				trigger: ".page2",
				scroller: "[data-scroll-container]",
				start: "top 40%",
				end: "bottom top",
				markers: false,
			},
			duration: 0.6,
			opacity: 1,
			y: 0,
			stagger: 0.09,
			ease: "power4.out",
		});

		gsap.to(imagesSpan, {
			scrollTrigger: {
				trigger: ".images-text",
				scroller: "[data-scroll-container]",
				start: "top 40%",
				end: "bottom top",
				markers: false,
			},
			duration: 0.8,
			opacity: 1,
			y: 0,
			stagger: 0.09,
			ease: "power4.out",
		});
	}

	function page2images() {
		const links = document.querySelectorAll(".page2-third-cols a");
		const images = document.querySelectorAll(".images2 img");

		gsap.set(images, { opacity: 0 });

		links.forEach((link) => {
			link.addEventListener("mouseenter", () => {
				const target = link.getAttribute("data-target");
				images.forEach((img) => {
					gsap.to(img, { opacity: img.id === target ? 1 : 0, duration: 0.5 });
				});
			});
		});
	}

	function page3Animation() {
		let page3Spans = document.querySelectorAll(
			".page3-heading h4 span, .right-sub-heading h4 span, .main-heading h4 span"
		);
		let seperatorLine = document.querySelector(".seperator-line");

		gsap.set(page3Spans, { opacity: 0, y: 40 });
		gsap.set(seperatorLine, { opacity: 0, width: 0 });

		gsap.to(page3Spans, {
			scrollTrigger: {
				trigger: ".top",
				scroller: "[data-scroll-container]",
				start: "top 30%",
				end: "bottom top",
				markers: false,
			},
			duration: 1,
			opacity: 0.8,
			y: 0,
			stagger: 0.1,
			ease: "power4.out",
		});
		gsap.to(seperatorLine, {
			scrollTrigger: {
				trigger: ".main-heading",
				scroller: "[data-scroll-container]",
				start: "top 30%",
				end: "bottom top",
				markers: false,
			},
			duration: 1,
			opacity: 1,
			width: "100%",
			stagger: 0.1,
			ease: "power4.out",
		});
	}
	menuAnimation();
	pageBlocks();
	page2Animation();
	page2images();
	page3Animation();

	// Marquee
	function marquee() {
		window.addEventListener("wheel", function (dets) {
			const vectors = document.querySelectorAll(".vectorRotate");

			if (dets.deltaY > 0) {
				gsap.to(".marquee", {
					transform: "translateX(-200%)",
					duration: 4,
					ease: "none",
					repeat: -1,
				});
				vectors.forEach((vector) => {
					vector.classList.remove("vectorRotateClockwise");
					vector.classList.add("vectorRotateCounterClockwise");
				});
			} else {
				gsap.to(".marquee", {
					transform: "translateX(0%)",
					duration: 4,
					ease: "none",
					repeat: -1,
				});
				vectors.forEach((vector) => {
					vector.classList.remove("vectorRotateCounterClockwise");
					vector.classList.add("vectorRotateClockwise");
				});
			}
		});
	}
	marquee();
	gsap.registerPlugin(ScrollTrigger);
	const bgColors = ["#faba4a", "#bb2a26", "#7e7d65", "#989682"];
	const bgColorElement = document.querySelector(".bg-color");
	gsap.utils.toArray(".item").forEach((item, index) => {
		let img = item.querySelector(".item-img img");
		gsap.fromTo(
			img,
			{ clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)" },
			{
				clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
				duration: 2,
				ease: "power4.out",
				scrollTrigger: {
					trigger: item,
					scroller: "[data-scroll-container]",
					start: "center bottom",
					end: "bottom top",
					scrub: 2,
					onEnter: () => updateBackground(bgColors[index]),
					onEnterBack: () => updateBackground(bgColors[index]),
				},
			}
		);
	});

	function updateBackground(color) {
		gsap.to(bgColorElement, {
			background: `linear-gradient(0deg, ${color} 0%, rgba(252, 176, 69, 0)100%)`,
			duration: 2,
			ease: "power4.out",
		});
	}

	// Page4
	//Horizontal Scroll
	let scrollTween;
	let fifthSection = () => {
		gsap.registerPlugin(ScrollTrigger);

		const sectionWidth = document.querySelector(".slides").offsetWidth;
		let amountToScroll = sectionWidth - window.innerWidth;

		gsap.to(".slides", {
			x: -amountToScroll,
			scrollTrigger: {
				trigger: ".slides",
				scroller: "[data-scroll-container]",
				start: "top -5%",
				end: () => `+=${amountToScroll}`,
				pin: true,
				scrub: 1,
			},
		});
	};
	fifthSection();
});
