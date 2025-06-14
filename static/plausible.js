(() => {
	const script = document.createElement("script");
	script.src = "https://plausible.io/js/script.js";
	script.id = "plausible-script";
	script.setAttribute("data-domain", "chordplayer.dev");
	script.setAttribute("defer", "");
	document.head.appendChild(script);
})();
