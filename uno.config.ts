import { defineConfig } from "unocss";
import presetWind3 from "@unocss/preset-wind3";
import extractorSvelte from "@unocss/extractor-svelte";

export default defineConfig({
	extractors: [extractorSvelte()],
	presets: [presetWind3()],
	preflights: [
		// tailwind preflight
		{
			layer: "reset",
			getCSS: () =>
				`*,::after,::before{box-sizing:border-box;border-width:0;border-style:solid;border-color:var(--un-default-border-color, #e5e7eb)}::after,::before{--un-content:""}:host,html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";font-feature-settings:normal;font-variation-settings:normal;-webkit-tap-highlight-color:transparent}body{margin:0;line-height:inherit}hr{height:0;color:inherit;border-top-width:1px}abbr:where([title]){text-decoration:underline dotted}h1,h2,h3,h4,h5,h6{font-size:inherit;font-weight:inherit}a{color:inherit;text-decoration:inherit}b,strong{font-weight:bolder}code,kbd,pre,samp{font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;font-feature-settings:normal;font-variation-settings:normal;font-size:1em}small{font-size:80%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sub{bottom:-0.25em}sup{top:-0.5em}table{text-indent:0;border-color:inherit;border-collapse:collapse}button,input,optgroup,select,textarea{font-family:inherit;font-feature-settings:inherit;font-variation-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;color:inherit;margin:0;padding:0}button,select{text-transform:none}[type="button"],[type="reset"],[type="submit"],button{-webkit-appearance:button;background-color:transparent;background-image:none}:-moz-focusring{outline:auto}:-moz-ui-invalid{box-shadow:none}progress{vertical-align:baseline}::-webkit-inner-spin-button,::-webkit-outer-spin-button{height:auto}[type="search"]{-webkit-appearance:textfield;outline-offset:-2px}::-webkit-search-decoration{-webkit-appearance:none}::-webkit-file-upload-button{-webkit-appearance:button;font:inherit}summary{display:list-item}blockquote,dd,dl,figure,h1,h2,h3,h4,h5,h6,hr,p,pre{margin:0}fieldset{margin:0;padding:0}legend{padding:0}menu,ol,ul{list-style:none;margin:0;padding:0}dialog{padding:0}textarea{resize:vertical}input::placeholder,textarea::placeholder{opacity:1;color:#9ca3af}[role="button"],button{cursor:pointer}:disabled{cursor:default}audio,canvas,embed,iframe,img,object,svg,video{display:block;vertical-align:middle}img,video{max-width:100%;height:auto}[hidden]:where(:not([hidden="until-found"])){display:none}`,
		},
		// svelte announcer bug fix
		// https://github.com/sveltejs/kit/issues/11993
		{
			layer: "components",
			getCSS: () =>
				"#svelte-announcer { position: absolute; left: 0; top: 0; clip: rect(0 0 0 0); clip-path: inset(50%); overflow: hidden; white-space: nowrap; width: 1px; height: 1px }",
		},
	],
	theme: {
		colors: {
			primary: "#142239",
			accent: "#ebf92f",
		},
	},
	content: {
		filesystem: ["./src/**/*.{html,js,svelte,ts}"],
	},
	shortcuts: [
		["page-x-padding", "px-4 sm:px-6 md:px-7 lg:px-8 xl:px-16 2xl:px-24"],
		["page-y-padding", "pt-8 pb-8"],
	],
	rules: [
		// SVG text-anchor utilities
		["text-anchor-start", { "text-anchor": "start" }],
		["text-anchor-middle", { "text-anchor": "middle" }],
		["text-anchor-end", { "text-anchor": "end" }],

		// SVG dominant-baseline utilities
		["dominant-baseline-auto", { "dominant-baseline": "auto" }],
		["dominant-baseline-middle", { "dominant-baseline": "middle" }],
		["dominant-baseline-central", { "dominant-baseline": "central" }],
		["dominant-baseline-hanging", { "dominant-baseline": "hanging" }],
	],
});
