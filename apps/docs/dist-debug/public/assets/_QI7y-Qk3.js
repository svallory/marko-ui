import { E as _controllable_input, J as _text, K as _return, N as _for_of, R as _if, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, b as _closure, h as _attrs_partial, n as _attr_class, q as _script, x as _closure_get, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { t as buttonVariants } from "./_Bv1Q_wKS.js";
import "./_DAgwroWU.js";
import { L as flatArray, X as contains, a as createMachine, bt as createAnatomy, f as createSplitProps, g as hash, m as callAll, mt as dataAttr, n as $input, t as $input$1, tt as getWindow, u as warn } from "./_ChYYrEpj.js";
import { i as raf } from "./_BJjj5X0-.js";
import { s as getEventTarget, t as addDomEvent } from "./_x_hNpEYa.js";
import { t as visuallyHiddenStyle } from "./_DYd_HixS2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
var parts = createAnatomy("file-upload").parts("root", "dropzone", "item", "itemDeleteTrigger", "itemGroup", "itemName", "itemPreview", "itemPreviewImage", "itemSizeText", "label", "trigger", "clearTrigger").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+file-utils@1.43.0/node_modules/@zag-js/file-utils/dist/data-transfer.mjs
var getItemEntry = (item) => typeof item.getAsEntry === "function" ? item.getAsEntry() : typeof item.webkitGetAsEntry === "function" ? item.webkitGetAsEntry() : null;
var isDirectoryEntry = (entry) => entry.isDirectory;
var isFileEntry = (entry) => entry.isFile;
var addRelativePath = (file, path) => {
	Object.defineProperty(file, "relativePath", { value: path ? `${path}/${file.name}` : file.name });
	return file;
};
var getFileEntries = (items, traverseDirectories) => Promise.all(Array.from(items).filter((item) => item.kind === "file").map((item) => {
	const entry = getItemEntry(item);
	if (!entry) return null;
	if (isDirectoryEntry(entry) && traverseDirectories) return getDirectoryFiles(entry.createReader(), `${entry.name}`);
	if (isFileEntry(entry) && typeof item.getAsFile === "function") {
		const file = item.getAsFile();
		return Promise.resolve(file ? addRelativePath(file, "") : null);
	}
	if (isFileEntry(entry)) return new Promise((resolve) => {
		entry.file((file) => {
			resolve(addRelativePath(file, ""));
		});
	});
}).filter((b) => b));
var getDirectoryFiles = (reader, path = "") => new Promise((resolve) => {
	const entryPromises = [];
	const readDirectoryEntries = () => {
		reader.readEntries((entries) => {
			if (entries.length === 0) {
				resolve(Promise.all(entryPromises).then((entries2) => entries2.flat()));
				return;
			}
			const promises = entries.map((entry) => {
				if (!entry) return null;
				if (isDirectoryEntry(entry)) return getDirectoryFiles(entry.createReader(), `${path}${entry.name}`);
				if (isFileEntry(entry)) return new Promise((resolve2) => {
					entry.file((file) => {
						resolve2(addRelativePath(file, path));
					});
				});
			}).filter((b) => b);
			entryPromises.push(Promise.all(promises));
			readDirectoryEntries();
		});
	};
	readDirectoryEntries();
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+file-utils@1.43.0/node_modules/@zag-js/file-utils/dist/get-accept-attr.mjs
function isMIMEType(v) {
	return v === "audio/*" || v === "video/*" || v === "image/*" || v === "text/*" || /\w+\/[-+.\w]+/g.test(v);
}
function isExt(v) {
	return /^.*\.[\w]+$/.test(v);
}
var isValidMIME = (v) => isMIMEType(v) || isExt(v);
function getAcceptAttrString(accept) {
	if (accept == null) return;
	if (typeof accept === "string") return accept;
	if (Array.isArray(accept)) return accept.filter(isValidMIME).join(",");
	return Object.entries(accept).reduce((a, [mimeType, ext]) => [
		...a,
		mimeType,
		...ext
	], []).filter(isValidMIME).join(",");
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+file-utils@1.43.0/node_modules/@zag-js/file-utils/dist/is-file-equal.mjs
var isFileEqual = (file1, file2) => {
	return file1.name === file2.name && file1.size === file2.size && file1.type === file2.type;
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+file-utils@1.43.0/node_modules/@zag-js/file-utils/dist/is-valid-file-size.mjs
var isDefined = (v) => v !== void 0 && v !== null;
function isValidFileSize(file, minSize, maxSize) {
	if (isDefined(file.size)) {
		if (isDefined(minSize) && isDefined(maxSize)) {
			if (file.size > maxSize) return [false, "FILE_TOO_LARGE"];
			if (file.size < minSize) return [false, "FILE_TOO_SMALL"];
		} else if (isDefined(minSize) && file.size < minSize) return [false, "FILE_TOO_SMALL"];
		else if (isDefined(maxSize) && file.size > maxSize) return [false, "FILE_TOO_LARGE"];
	}
	return [true, null];
}
var mimeTypesMap = new Map("3g2_video/3gpp2[3gp,3gpp_video/3gpp[3mf_model/3mf[7z_application/x-7z-compressed[aac_audio/aac[ac_application/pkix-attr-cert[adp_audio/adpcm[adts_audio/aac[ai_application/postscript[aml_application/automationml-aml+xml[amlx_application/automationml-amlx+zip[amr_audio/amr[apk_application/vnd.android.package-archive[apng_image/apng[appcache,manifest_text/cache-manifest[appinstaller_application/appinstaller[appx_application/appx[appxbundle_application/appxbundle[asc_application/pgp-keys[atom_application/atom+xml[atomcat_application/atomcat+xml[atomdeleted_application/atomdeleted+xml[atomsvc_application/atomsvc+xml[au,snd_audio/basic[avi_video/x-msvideo[avci_image/avci[avcs_image/avcs[avif_image/avif[aw_application/applixware[bdoc_application/bdoc[bin,bpk,buffer,deb,deploy,dist,distz,dll,dmg,dms,dump,elc,exe,img,iso,lrf,mar,msi,msm,msp,pkg,so_application/octet-stream[bmp,dib_image/bmp[btf,btif_image/prs.btif[bz2_application/x-bzip2[c_text/x-c[ccxml_application/ccxml+xml[cdfx_application/cdfx+xml[cdmia_application/cdmi-capability[cdmic_application/cdmi-container[cdmid_application/cdmi-domain[cdmio_application/cdmi-object[cdmiq_application/cdmi-queue[cer_application/pkix-cert[cgm_image/cgm[cjs_application/node[class_application/java-vm[coffee,litcoffee_text/coffeescript[conf,def,in,ini,list,log,text,txt_text/plain[cpp,cxx,cc_text/x-c++src[cpl_application/cpl+xml[cpt_application/mac-compactpro[crl_application/pkix-crl[css_text/css[csv_text/csv[cu_application/cu-seeme[cwl_application/cwl[cww_application/prs.cww[davmount_application/davmount+xml[dbk_application/docbook+xml[doc_application/msword[docx_application/vnd.openxmlformats-officedocument.wordprocessingml.document[dsc_text/prs.lines.tag[dssc_application/dssc+der[dtd_application/xml-dtd[dwd_application/atsc-dwd+xml[ear,jar,war_application/java-archive[ecma_application/ecmascript[emf_image/emf[eml,mime_message/rfc822[emma_application/emma+xml[emotionml_application/emotionml+xml[eot_application/vnd.ms-fontobject[eps,ps_application/postscript[epub_application/epub+zip[exi_application/exi[exp_application/express[exr_image/aces[ez_application/andrew-inset[fdf_application/fdf[fdt_application/fdt+xml[fits_image/fits[flac_audio/flac[flv_video/x-flv[g3_image/g3fax[geojson_application/geo+json[gif_image/gif[glb_model/gltf-binary[gltf_model/gltf+json[gml_application/gml+xml[go_text/x-go[gpx_application/gpx+xml[gz_application/gzip[h_text/x-h[h261_video/h261[h263_video/h263[h264_video/h264[heic_image/heic[heics_image/heic-sequence[heif_image/heif[heifs_image/heif-sequence[htm,html,shtml_text/html[ico_image/x-icon[icns_image/x-icns[ics,ifb_text/calendar[iges,igs_model/iges[ink,inkml_application/inkml+xml[ipa_application/octet-stream[java_text/x-java-source[jp2,jpg2_image/jp2[jpeg,jpe,jpg_image/jpeg[jpf,jpx_image/jpx[jpm,jpgm_image/jpm[jpgv_video/jpeg[jph_image/jph[js,mjs_text/javascript[json_application/json[json5_application/json5[jsonld_application/ld+json[jsx_text/jsx[jxl_image/jxl[jxr_image/jxr[ktx_image/ktx[ktx2_image/ktx2[less_text/less[m1v,m2v,mpe,mpeg,mpg_video/mpeg[m4a_audio/mp4[m4v_video/x-m4v[md,markdown_text/markdown[mid,midi,kar,rmi_audio/midi[mkv_video/x-matroska[mp2,mp2a,mp3,mpga,m3a,m2a_audio/mpeg[mp4,mp4v,mpg4_video/mp4[mp4a_audio/mp4[mp4s,m4p_application/mp4[odp_application/vnd.oasis.opendocument.presentation[oda_application/oda[ods_application/vnd.oasis.opendocument.spreadsheet[odt_application/vnd.oasis.opendocument.text[oga,ogg,opus,spx_audio/ogg[ogv_video/ogg[ogx_application/ogg[otf_font/otf[p12,pfx_application/x-pkcs12[pdf_application/pdf[pem_application/x-pem-file[php_text/x-php[png_image/png[ppt_application/vnd.ms-powerpoint[pptx_application/vnd.openxmlformats-officedocument.presentationml.presentation[pskcxml_application/pskc+xml[psd_image/vnd.adobe.photoshop[py_text/x-python[qt,mov_video/quicktime[rar_application/vnd.rar[rdf_application/rdf+xml[rtf_text/rtf[sass_text/x-sass[scss_text/x-scss[sgm,sgml_text/sgml[sh_application/x-sh[svg,svgz_image/svg+xml[swf_application/x-shockwave-flash[tar_application/x-tar[tif,tiff_image/tiff[toml_application/toml[ts_video/mp2t[tsx_text/tsx[tsv_text/tab-separated-values[ttc_font/collection[ttf_font/ttf[vtt_text/vtt[wasm_application/wasm[wav_audio/wav[weba_audio/webm[webm_video/webm[webmanifest_application/manifest+json[webp_image/webp[wma_audio/x-ms-wma[wmv_video/x-ms-wmv[woff_font/woff[woff2_font/woff2[xls_application/vnd.ms-excel[xlsx_application/vnd.openxmlformats-officedocument.spreadsheetml.sheet[xml_application/xml[xz_application/x-xz[yaml,yml_text/yaml[zip_application/zip".split("[").flatMap((mime) => {
	const [extensions, mimeType] = mime.split("_");
	return extensions.split(",").map((ext) => [ext, mimeType]);
}));
//#endregion
//#region ../../node_modules/.bun/@zag-js+file-utils@1.43.0/node_modules/@zag-js/file-utils/dist/get-file-mime-type.mjs
function getFileMimeType(name) {
	const extension = name.split(".").pop();
	return extension ? mimeTypesMap.get(extension) || null : null;
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+file-utils@1.43.0/node_modules/@zag-js/file-utils/dist/is-valid-file-type.mjs
function isFileAccepted(file, accept) {
	if (file && accept) {
		const types = Array.isArray(accept) ? accept : typeof accept === "string" ? accept.split(",") : [];
		if (types.length === 0) return true;
		const fileName = file.name || "";
		const mimeType = (file.type || getFileMimeType(fileName) || "").toLowerCase();
		const baseMimeType = mimeType.replace(/\/.*$/, "");
		return types.some((type) => {
			const validType = type.trim().toLowerCase();
			if (validType.charAt(0) === ".") return fileName.toLowerCase().endsWith(validType);
			if (validType.endsWith("/*")) return baseMimeType === validType.replace(/\/.*$/, "");
			return mimeType === validType;
		});
	}
	return true;
}
function isValidFileType(file, accept) {
	const isAcceptable = file.type === "application/x-moz-file" || isFileAccepted(file, accept);
	return [isAcceptable, isAcceptable ? null : "FILE_INVALID_TYPE"];
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+i18n-utils@1.43.0/node_modules/@zag-js/i18n-utils/dist/cache.mjs
function i18nCache(Ins) {
	const formatterCache = /* @__PURE__ */ new Map();
	return function create(locale, options) {
		const cacheKey = locale + (options ? Object.entries(options).sort((a, b) => a[0] < b[0] ? -1 : 1).join() : "");
		if (formatterCache.has(cacheKey)) return formatterCache.get(cacheKey);
		let formatter = new Ins(locale, options);
		formatterCache.set(cacheKey, formatter);
		return formatter;
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+i18n-utils@1.43.0/node_modules/@zag-js/i18n-utils/dist/format-number.mjs
var getNumberFormatter = i18nCache(Intl.NumberFormat);
function formatNumber(v, locale, options = {}) {
	return getNumberFormatter(locale, options).format(v);
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+i18n-utils@1.43.0/node_modules/@zag-js/i18n-utils/dist/format-bytes.mjs
var bitPrefixes = [
	"",
	"kilo",
	"mega",
	"giga",
	"tera"
];
var bytePrefixes = [
	"",
	"kilo",
	"mega",
	"giga",
	"tera",
	"peta"
];
var formatBytes = (bytes, locale = "en-US", options = {}) => {
	if (Number.isNaN(bytes)) return "";
	if (bytes === 0) return "0 B";
	const { unitSystem = "decimal", precision = 3, unit = "byte", unitDisplay = "short" } = options;
	const factor = unitSystem === "binary" ? 1024 : 1e3;
	const prefix = unit === "bit" ? bitPrefixes : bytePrefixes;
	const isNegative = bytes < 0;
	let value = Math.abs(bytes);
	let index = 0;
	while (value >= factor && index < prefix.length - 1) {
		value /= factor;
		index++;
	}
	const v = parseFloat(value.toPrecision(precision));
	return formatNumber(isNegative ? -v : v, locale, {
		style: "unit",
		unit: prefix[index] + unit,
		unitDisplay
	});
};
//#endregion
//#region ../../node_modules/.bun/@zag-js+file-upload@1.43.0/node_modules/@zag-js/file-upload/dist/file-upload.dom.mjs
var getRootId = (ctx) => ctx.ids?.root ?? `file:${ctx.id}`;
var getDropzoneId = (ctx) => ctx.ids?.dropzone ?? `file:${ctx.id}:dropzone`;
var getHiddenInputId = (ctx) => ctx.ids?.hiddenInput ?? `file:${ctx.id}:input`;
var getTriggerId = (ctx) => ctx.ids?.trigger ?? `file:${ctx.id}:trigger`;
var getLabelId = (ctx) => ctx.ids?.label ?? `file:${ctx.id}:label`;
var getItemId = (ctx, id) => ctx.ids?.item?.(id) ?? `file:${ctx.id}:item:${id}`;
var getItemNameId = (ctx, id) => ctx.ids?.itemName?.(id) ?? `file:${ctx.id}:item-name:${id}`;
var getItemSizeTextId = (ctx, id) => ctx.ids?.itemSizeText?.(id) ?? `file:${ctx.id}:item-size:${id}`;
var getItemPreviewId = (ctx, id) => ctx.ids?.itemPreview?.(id) ?? `file:${ctx.id}:item-preview:${id}`;
var getItemDeleteTriggerId = (ctx, id) => ctx.ids?.itemDeleteTrigger?.(id) ?? `file:${ctx.id}:item-delete:${id}`;
var getFileId = (file) => hash(`${file.name}-${file.size}`);
var getRootEl = (ctx) => ctx.getById(getRootId(ctx));
var getHiddenInputEl = (ctx) => ctx.getById(getHiddenInputId(ctx));
var getDropzoneEl = (ctx) => ctx.getById(getDropzoneId(ctx));
//#endregion
//#region ../../node_modules/.bun/@zag-js+file-upload@1.43.0/node_modules/@zag-js/file-upload/dist/file-upload.utils.mjs
function isEventWithFiles(event) {
	const target = getEventTarget(event);
	if (!event.dataTransfer) return !!target && "files" in target;
	return event.dataTransfer.types.some((type) => {
		return type === "Files" || type === "application/x-moz-file";
	});
}
function isFilesWithinRange(ctx, incomingCount, currentAcceptedFiles) {
	const { prop, computed } = ctx;
	if (!computed("multiple") && incomingCount > 1) return false;
	if (!computed("multiple") && incomingCount + currentAcceptedFiles.length === 2) return true;
	if (incomingCount + currentAcceptedFiles.length > prop("maxFiles")) return false;
	return true;
}
function getEventFiles(ctx, files, currentAcceptedFiles = [], currentRejectedFiles = []) {
	const { prop, computed } = ctx;
	const acceptedFiles = [];
	const rejectedFiles = [];
	const validateParams = {
		acceptedFiles: currentAcceptedFiles,
		rejectedFiles: currentRejectedFiles
	};
	files.forEach((file) => {
		const [accepted, acceptError] = isValidFileType(file, computed("acceptAttr"));
		const [sizeMatch, sizeError] = isValidFileSize(file, prop("minFileSize"), prop("maxFileSize"));
		const isDuplicate = currentAcceptedFiles.some((f) => isFileEqual(f, file)) || acceptedFiles.some((f) => isFileEqual(f, file));
		const validateErrors = prop("validate")?.(file, validateParams);
		const valid = validateErrors ? validateErrors.length === 0 : true;
		if (accepted && sizeMatch && valid && !isDuplicate) acceptedFiles.push(file);
		else {
			const errors = [acceptError, sizeError];
			if (isDuplicate) errors.push("FILE_EXISTS");
			if (!valid) errors.push(...validateErrors ?? []);
			rejectedFiles.push({
				file,
				errors: errors.filter(Boolean)
			});
		}
	});
	if (!isFilesWithinRange(ctx, acceptedFiles.length, currentAcceptedFiles)) {
		acceptedFiles.forEach((file) => {
			rejectedFiles.push({
				file,
				errors: ["TOO_MANY_FILES"]
			});
		});
		acceptedFiles.splice(0);
	}
	return {
		acceptedFiles,
		rejectedFiles
	};
}
function setInputFiles(inputEl, files) {
	const win = getWindow(inputEl);
	try {
		if ("DataTransfer" in win) {
			const dataTransfer = new win.DataTransfer();
			files.forEach((file) => {
				dataTransfer.items.add(file);
			});
			inputEl.files = dataTransfer.files;
		}
	} catch {}
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+file-upload@1.43.0/node_modules/@zag-js/file-upload/dist/file-upload.connect.mjs
var DEFAULT_ITEM_TYPE = "accepted";
var INTERACTIVE_SELECTOR = "button, a[href], input:not([type='file']), select, textarea, [tabindex], [contenteditable]";
function isInteractiveTarget(element, container) {
	if (!element || element.getAttribute("type") === "file") return false;
	const interactive = element.closest(INTERACTIVE_SELECTOR);
	return interactive != container && contains(container, interactive);
}
function connect(service, normalize) {
	const { state, send, prop, computed, scope, context } = service;
	const disabled = !!prop("disabled");
	const readOnly = !!prop("readOnly");
	const required = !!prop("required");
	const allowDrop = prop("allowDrop");
	const translations = prop("translations");
	const dragging = state.matches("dragging");
	const focused = state.matches("focused") && !disabled;
	const acceptedFiles = context.get("acceptedFiles");
	const maxFiles = prop("maxFiles");
	return {
		dragging,
		focused,
		disabled,
		readOnly,
		transforming: context.get("transforming"),
		maxFilesReached: acceptedFiles.length >= maxFiles,
		remainingFiles: Math.max(0, maxFiles - acceptedFiles.length),
		openFilePicker() {
			if (disabled || readOnly) return;
			send({ type: "OPEN" });
		},
		deleteFile(file, type = DEFAULT_ITEM_TYPE) {
			if (disabled || readOnly) return;
			send({
				type: "FILE.DELETE",
				file,
				itemType: type
			});
		},
		acceptedFiles,
		rejectedFiles: context.get("rejectedFiles"),
		setFiles(files) {
			if (disabled || readOnly) return;
			send({
				type: "FILES.SET",
				files,
				count: files.length
			});
		},
		clearRejectedFiles() {
			if (disabled || readOnly) return;
			send({ type: "REJECTED_FILES.CLEAR" });
		},
		clearFiles() {
			if (disabled || readOnly) return;
			send({ type: "FILES.CLEAR" });
		},
		getFileSize(file) {
			return formatBytes(file.size, prop("locale"));
		},
		createFileUrl(file, cb) {
			const win = scope.getWin();
			const url = win.URL.createObjectURL(file);
			cb(url);
			return () => win.URL.revokeObjectURL(url);
		},
		setClipboardFiles(dt) {
			if (disabled || readOnly) return false;
			const files = Array.from(dt?.items ?? []).reduce((acc, item) => {
				if (item.kind !== "file") return acc;
				const file = item.getAsFile();
				if (!file) return acc;
				return [...acc, file];
			}, []);
			if (!files.length) return false;
			send({
				type: "FILE.SELECT",
				files
			});
			return true;
		},
		getRootProps() {
			return normalize.element({
				...parts.root.attrs,
				dir: prop("dir"),
				id: getRootId(scope),
				"data-disabled": dataAttr(disabled),
				"data-readonly": dataAttr(readOnly),
				"data-dragging": dataAttr(dragging)
			});
		},
		getDropzoneProps(props = {}) {
			return normalize.element({
				...parts.dropzone.attrs,
				dir: prop("dir"),
				id: getDropzoneId(scope),
				tabIndex: disabled || readOnly || props.disableClick ? void 0 : 0,
				role: props.disableClick ? "application" : "button",
				"aria-label": translations.dropzone,
				"aria-disabled": disabled || readOnly || void 0,
				"data-invalid": dataAttr(prop("invalid")),
				"data-disabled": dataAttr(disabled),
				"data-readonly": dataAttr(readOnly),
				"data-dragging": dataAttr(dragging),
				onKeyDown(event) {
					if (disabled || readOnly) return;
					if (event.defaultPrevented) return;
					const target = getEventTarget(event);
					if (!contains(event.currentTarget, target)) return;
					if (isInteractiveTarget(target, event.currentTarget)) return;
					if (props.disableClick) return;
					if (event.key !== "Enter" && event.key !== " ") return;
					send({
						type: "DROPZONE.CLICK",
						src: "keydown"
					});
				},
				onClick(event) {
					if (disabled || readOnly) return;
					if (event.defaultPrevented) return;
					if (props.disableClick) return;
					const target = getEventTarget(event);
					if (!contains(event.currentTarget, target)) return;
					if (isInteractiveTarget(target, event.currentTarget)) return;
					if (event.currentTarget.localName === "label") event.preventDefault();
					send({ type: "DROPZONE.CLICK" });
				},
				onDragOver(event) {
					if (disabled || readOnly) return;
					if (!allowDrop) return;
					event.preventDefault();
					event.stopPropagation();
					try {
						event.dataTransfer.dropEffect = "copy";
					} catch {}
					if (!isEventWithFiles(event)) return;
					const count = event.dataTransfer.items.length;
					send({
						type: "DROPZONE.DRAG_OVER",
						count
					});
				},
				onDragLeave(event) {
					if (disabled || readOnly) return;
					if (!allowDrop) return;
					if (contains(event.currentTarget, event.relatedTarget)) return;
					send({ type: "DROPZONE.DRAG_LEAVE" });
				},
				onDrop(event) {
					if (disabled || readOnly) return;
					if (allowDrop) {
						event.preventDefault();
						event.stopPropagation();
					}
					if (!isEventWithFiles(event)) return;
					getFileEntries(event.dataTransfer.items, prop("directory")).then((files) => {
						send({
							type: "DROPZONE.DROP",
							files: flatArray(files)
						});
					});
				},
				onFocus() {
					if (disabled || readOnly) return;
					send({ type: "DROPZONE.FOCUS" });
				},
				onBlur() {
					if (disabled || readOnly) return;
					send({ type: "DROPZONE.BLUR" });
				}
			});
		},
		getTriggerProps() {
			return normalize.button({
				...parts.trigger.attrs,
				dir: prop("dir"),
				id: getTriggerId(scope),
				disabled: disabled || readOnly,
				"data-disabled": dataAttr(disabled),
				"data-readonly": dataAttr(readOnly),
				"data-invalid": dataAttr(prop("invalid")),
				type: "button",
				onClick(event) {
					if (disabled || readOnly) return;
					if (contains(getDropzoneEl(scope), event.currentTarget)) event.stopPropagation();
					send({ type: "OPEN" });
				}
			});
		},
		getHiddenInputProps() {
			return normalize.input({
				id: getHiddenInputId(scope),
				tabIndex: -1,
				disabled: disabled || readOnly,
				type: "file",
				required: prop("required"),
				capture: prop("capture"),
				name: prop("name"),
				accept: computed("acceptAttr"),
				webkitdirectory: prop("directory") ? "" : void 0,
				multiple: computed("multiple") || prop("maxFiles") > 1,
				"aria-hidden": true,
				onClick(event) {
					event.stopPropagation();
					event.currentTarget.value = "";
				},
				onInput(event) {
					if (disabled || readOnly) return;
					const { files } = event.currentTarget;
					send({
						type: "FILE.SELECT",
						files: files ? Array.from(files) : []
					});
				},
				style: visuallyHiddenStyle
			});
		},
		getItemGroupProps(props = {}) {
			const { type = DEFAULT_ITEM_TYPE } = props;
			return normalize.element({
				...parts.itemGroup.attrs,
				dir: prop("dir"),
				"data-disabled": dataAttr(disabled),
				"data-type": type
			});
		},
		getItemProps(props) {
			const { file, type = DEFAULT_ITEM_TYPE } = props;
			return normalize.element({
				...parts.item.attrs,
				dir: prop("dir"),
				id: getItemId(scope, getFileId(file)),
				"data-disabled": dataAttr(disabled),
				"data-type": type
			});
		},
		getItemNameProps(props) {
			const { file, type = DEFAULT_ITEM_TYPE } = props;
			return normalize.element({
				...parts.itemName.attrs,
				dir: prop("dir"),
				id: getItemNameId(scope, getFileId(file)),
				"data-disabled": dataAttr(disabled),
				"data-type": type
			});
		},
		getItemSizeTextProps(props) {
			const { file, type = DEFAULT_ITEM_TYPE } = props;
			return normalize.element({
				...parts.itemSizeText.attrs,
				dir: prop("dir"),
				id: getItemSizeTextId(scope, getFileId(file)),
				"data-disabled": dataAttr(disabled),
				"data-type": type
			});
		},
		getItemPreviewProps(props) {
			const { file, type = DEFAULT_ITEM_TYPE } = props;
			return normalize.element({
				...parts.itemPreview.attrs,
				dir: prop("dir"),
				id: getItemPreviewId(scope, getFileId(file)),
				"data-disabled": dataAttr(disabled),
				"data-type": type
			});
		},
		getItemPreviewImageProps(props) {
			const { file, url, type = DEFAULT_ITEM_TYPE } = props;
			if (!file.type.startsWith("image/")) throw new Error("Preview Image is only supported for image files");
			return normalize.img({
				...parts.itemPreviewImage.attrs,
				alt: translations.itemPreview?.(file),
				src: url,
				"data-disabled": dataAttr(disabled),
				"data-type": type
			});
		},
		getItemDeleteTriggerProps(props) {
			const { file, type = DEFAULT_ITEM_TYPE } = props;
			return normalize.button({
				...parts.itemDeleteTrigger.attrs,
				dir: prop("dir"),
				id: getItemDeleteTriggerId(scope, getFileId(file)),
				type: "button",
				disabled: disabled || readOnly,
				"data-disabled": dataAttr(disabled),
				"data-readonly": dataAttr(readOnly),
				"data-type": type,
				"aria-label": translations.deleteFile?.(file),
				onClick() {
					if (disabled || readOnly) return;
					send({
						type: "FILE.DELETE",
						file,
						itemType: type
					});
				}
			});
		},
		getLabelProps() {
			return normalize.label({
				...parts.label.attrs,
				dir: prop("dir"),
				id: getLabelId(scope),
				htmlFor: getHiddenInputId(scope),
				"data-disabled": dataAttr(disabled),
				"data-required": dataAttr(required)
			});
		},
		getClearTriggerProps() {
			return normalize.button({
				...parts.clearTrigger.attrs,
				dir: prop("dir"),
				type: "button",
				disabled: disabled || readOnly,
				hidden: acceptedFiles.length === 0,
				"data-disabled": dataAttr(disabled),
				"data-readonly": dataAttr(readOnly),
				onClick(event) {
					if (event.defaultPrevented) return;
					if (disabled || readOnly) return;
					send({ type: "FILES.CLEAR" });
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+file-upload@1.43.0/node_modules/@zag-js/file-upload/dist/file-upload.machine.mjs
var machine = createMachine({
	props({ props }) {
		return {
			minFileSize: 0,
			maxFileSize: Number.POSITIVE_INFINITY,
			maxFiles: 1,
			allowDrop: true,
			preventDocumentDrop: true,
			defaultAcceptedFiles: [],
			...props,
			translations: {
				dropzone: "dropzone",
				itemPreview: (file) => `preview of ${file.name}`,
				deleteFile: (file) => `delete file ${file.name}`,
				...props.translations
			}
		};
	},
	initialState() {
		return "idle";
	},
	context({ prop, bindable, getContext }) {
		return {
			acceptedFiles: bindable(() => ({
				defaultValue: prop("defaultAcceptedFiles"),
				value: prop("acceptedFiles"),
				isEqual: (a, b) => a.length === b?.length && a.every((file, i) => isFileEqual(file, b[i])),
				hash(value) {
					return value.map((file) => `${file.name}-${file.size}`).join(",");
				},
				onChange(value) {
					const ctx = getContext();
					prop("onFileAccept")?.({ files: value });
					prop("onFileChange")?.({
						acceptedFiles: value,
						rejectedFiles: ctx.get("rejectedFiles")
					});
				}
			})),
			rejectedFiles: bindable(() => ({
				defaultValue: [],
				isEqual: (a, b) => a.length === b?.length && a.every((file, i) => isFileEqual(file.file, b[i].file)),
				onChange(value) {
					const ctx = getContext();
					prop("onFileReject")?.({ files: value });
					prop("onFileChange")?.({
						acceptedFiles: ctx.get("acceptedFiles"),
						rejectedFiles: value
					});
				}
			})),
			transforming: bindable(() => ({ defaultValue: false }))
		};
	},
	computed: {
		acceptAttr: ({ prop }) => getAcceptAttrString(prop("accept")),
		multiple: ({ prop }) => prop("maxFiles") > 1
	},
	watch({ track, context, action }) {
		track([() => context.hash("acceptedFiles")], () => {
			action(["syncInputElement"]);
		});
	},
	on: {
		"FILES.SET": { actions: ["setFiles"] },
		"FILE.SELECT": { actions: ["setEventFiles"] },
		"FILE.DELETE": { actions: ["removeFile"] },
		"FILES.CLEAR": { actions: ["clearFiles"] },
		"REJECTED_FILES.CLEAR": { actions: ["clearRejectedFiles"] }
	},
	effects: ["preventDocumentDrop"],
	states: {
		idle: { on: {
			OPEN: { actions: ["openFilePicker"] },
			"DROPZONE.CLICK": { actions: ["openFilePicker"] },
			"DROPZONE.FOCUS": { target: "focused" },
			"DROPZONE.DRAG_OVER": { target: "dragging" }
		} },
		focused: { on: {
			"DROPZONE.BLUR": { target: "idle" },
			OPEN: { actions: ["openFilePicker"] },
			"DROPZONE.CLICK": { actions: ["openFilePicker"] },
			"DROPZONE.DRAG_OVER": { target: "dragging" }
		} },
		dragging: { on: {
			"DROPZONE.DROP": {
				target: "idle",
				actions: ["setEventFiles"]
			},
			"DROPZONE.DRAG_LEAVE": { target: "idle" }
		} }
	},
	implementations: {
		effects: { preventDocumentDrop({ prop, scope }) {
			if (!prop("preventDocumentDrop")) return;
			if (!prop("allowDrop")) return;
			if (prop("disabled")) return;
			const doc = scope.getDoc();
			const onDragOver = (event) => {
				event?.preventDefault();
			};
			const onDrop = (event) => {
				if (contains(getRootEl(scope), getEventTarget(event))) return;
				event.preventDefault();
			};
			return callAll(addDomEvent(doc, "dragover", onDragOver, false), addDomEvent(doc, "drop", onDrop, false));
		} },
		actions: {
			syncInputElement({ scope, context }) {
				queueMicrotask(() => {
					const inputEl = getHiddenInputEl(scope);
					if (!inputEl) return;
					setInputFiles(inputEl, context.get("acceptedFiles"));
					const win = scope.getWin();
					inputEl.dispatchEvent(new win.Event("change", { bubbles: true }));
				});
			},
			openFilePicker({ scope }) {
				raf(() => {
					getHiddenInputEl(scope)?.click();
				});
			},
			setFiles(params) {
				const { computed, context, event } = params;
				const { acceptedFiles, rejectedFiles } = getEventFiles(params, event.files);
				context.set("acceptedFiles", computed("multiple") ? acceptedFiles : acceptedFiles.length > 0 ? [acceptedFiles[0]] : []);
				context.set("rejectedFiles", rejectedFiles);
			},
			setEventFiles(params) {
				const { computed, context, event, prop } = params;
				const currentAcceptedFiles = context.get("acceptedFiles");
				const currentRejectedFiles = context.get("rejectedFiles");
				const { acceptedFiles, rejectedFiles } = getEventFiles(params, event.files, currentAcceptedFiles, currentRejectedFiles);
				const set = (files) => {
					if (computed("multiple")) {
						context.set("acceptedFiles", (prev) => [...prev, ...files]);
						context.set("rejectedFiles", rejectedFiles);
						return;
					}
					if (files.length) {
						context.set("acceptedFiles", [files[0]]);
						context.set("rejectedFiles", rejectedFiles);
						return;
					}
					if (rejectedFiles.length) {
						context.set("acceptedFiles", context.get("acceptedFiles"));
						context.set("rejectedFiles", rejectedFiles);
					}
				};
				const transform = prop("transformFiles");
				if (transform) {
					context.set("transforming", true);
					transform(acceptedFiles).then(set).catch((err) => {
						warn(`[zag-js/file-upload] error transforming files
${err}`);
					}).finally(() => {
						context.set("transforming", false);
					});
				} else set(acceptedFiles);
			},
			removeFile({ context, event }) {
				if (event.itemType === "rejected") {
					const rejectedFiles = context.get("rejectedFiles").filter((item) => !isFileEqual(item.file, event.file));
					context.set("rejectedFiles", rejectedFiles);
				} else {
					const files = context.get("acceptedFiles").filter((file) => !isFileEqual(file, event.file));
					context.set("acceptedFiles", files);
				}
			},
			clearRejectedFiles({ context }) {
				context.set("rejectedFiles", []);
			},
			clearFiles({ context }) {
				context.set("acceptedFiles", []);
				context.set("rejectedFiles", []);
			}
		}
	}
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+file-upload@1.43.0/node_modules/@zag-js/file-upload/dist/file-upload.props.mjs
var props = createProps()([
	"accept",
	"acceptedFiles",
	"allowDrop",
	"capture",
	"defaultAcceptedFiles",
	"dir",
	"directory",
	"disabled",
	"getRootNode",
	"id",
	"ids",
	"invalid",
	"locale",
	"maxFiles",
	"maxFileSize",
	"minFileSize",
	"name",
	"onFileAccept",
	"onFileChange",
	"onFileReject",
	"preventDocumentDrop",
	"readOnly",
	"required",
	"transformFiles",
	"translations",
	"validate"
]);
var splitProps = createSplitProps(props);
var itemProps = createProps()(["file", "type"]);
createSplitProps(itemProps);
//#endregion
//#region ../../packages/shadcn/ui/file-upload/file-upload.marko
var $for_content__api__OR__file__script = _script("uCxiQUC", ($scope) => {
	_attrs_script($scope, "a");
	_attrs_script($scope, "b");
	_attrs_script($scope, "d");
	_attrs_script($scope, "f");
});
var $for_content__api__OR__file = /*@__PURE__*/ _or(9, ($scope) => {
	_attrs_partial($scope, "a", $scope._._.q().getItemProps({ file: $scope.i }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "b", $scope._._.q().getItemNameProps({ file: $scope.i }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "d", $scope._._.q().getItemSizeTextProps({ file: $scope.i }), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "f", $scope._._.q().getItemDeleteTriggerProps({ file: $scope.i }), {
		"data-slot": 1,
		class: 1
	});
	$for_content__api__OR__file__script($scope);
}, 1, 3);
var $for_content__api = /*@__PURE__*/ _closure_get(21, $for_content__api__OR__file, ($scope) => $scope._._);
var $for_content__setup = ($scope) => {
	$for_content__api($scope);
	$for_content__formatSize($scope);
	_attr_class($scope.f, cn(buttonVariants({
		variant: "ghost",
		size: "icon"
	}), "size-7 shrink-0"));
};
var $for_content__formatSize__OR__file_size = /*@__PURE__*/ _or(12, ($scope) => _text($scope.e, $scope._._.t($scope.l)), 1, 3);
var $for_content__formatSize = /*@__PURE__*/ _closure_get(22, $for_content__formatSize__OR__file_size, ($scope) => $scope._._);
var $for_content__file = /*@__PURE__*/ _const(8, ($scope) => {
	$for_content__file_name($scope, $scope.i?.name);
	$for_content__file_size($scope, $scope.i?.size);
	$for_content__api__OR__file($scope);
});
var $for_content__file_name = ($scope, file_name) => {
	_text($scope.c, file_name);
	_text($scope.g, file_name);
};
var $for_content__file_size = /*@__PURE__*/ _const(11, $for_content__formatSize__OR__file_size);
var $for_content__$params = ($scope, $params2) => $for_content__file($scope, $params2[0]);
var $if_content__for = /*@__PURE__*/ _for_of(0, "<li data-slot=file-upload-item class=\"border-input bg-background flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm\"><div class=\"flex min-w-0 flex-col\"><span data-slot=file-upload-item-name class=\"truncate font-medium\"> </span><span data-slot=file-upload-item-size-text class=\"text-muted-foreground text-xs\"> </span></div><button data-slot=file-upload-item-delete-trigger><svg xmlns=http://www.w3.org/2000/svg width=24 height=24 viewBox=\"0 0 24 24\" fill=none stroke=currentColor stroke-width=2 stroke-linecap=round stroke-linejoin=round class=size-4><path d=\"M18 6 6 18\"></path><path d=\"m6 6 12 12\"></path></svg><span class=sr-only>Remove <!></span></button></li>", " E D l D m DbDb%", $for_content__setup, $for_content__$params);
var $if_content__api__script = _script("HNUTi78", ($scope) => _attrs_script($scope, "a"));
var $if_content__api = /*@__PURE__*/ _if_closure(10, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.q().getItemGroupProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content__for($scope, [$scope._.q().acceptedFiles]);
	$if_content__api__script($scope);
});
var $if_content__setup = $if_content__api;
_var_resume("qIh8kQF", ($scope, machineProps) => $input($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $api__OR__nativeAttrs__script = _script("oDP6NLV", ($scope) => _attrs_script($scope, "j"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(18, ($scope) => {
	_attrs_partial($scope, "j", {
		...$scope.r(),
		...$scope.q().getHiddenInputProps()
	}, { "data-slot": 1 }, _controllable_input);
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
_var_resume("UUKMNtt", ($scope, service) => $input$1($scope.e, {
	value: $api,
	service
}));
var $dropzoneProps__script = _script("pqywIaL", ($scope) => _attrs_script($scope, "h"));
var $dropzoneProps = /*@__PURE__*/ _const(20, ($scope) => {
	_attrs_partial($scope, "h", $scope.u, {
		"data-slot": 1,
		class: 1
	});
	$dropzoneProps__script($scope);
});
var $if = /*@__PURE__*/ _if(10, "<ul data-slot=file-upload-item-group class=\"flex flex-col gap-2\"></ul>", " ", $if_content__setup);
var $api2__closure = /*@__PURE__*/ _closure($for_content__api);
var $api2__script = _script("udrzu2j", ($scope) => {
	_attrs_script($scope, "g");
	_attrs_script($scope, "i");
});
_var_resume("mIQoQFg", /*@__PURE__*/ _const(16, ($scope) => {
	_attrs_partial($scope, "g", $scope.q().getRootProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial($scope, "i", $scope.q().getTriggerProps(), {
		"data-slot": 1,
		class: 1
	});
	_return($scope, $scope.q);
	$dropzoneProps($scope, (() => {
		const { role, tabIndex, tabindex, ...rest } = $scope.q().getDropzoneProps();
		return rest;
	})());
	$if($scope, $scope.q().acceptedFiles.length ? 0 : 1);
	$api__OR__nativeAttrs($scope);
	$if_content__api($scope);
	$api2__closure($scope);
	$api2__script($scope);
}));
function $machine() {
	return machine;
}
function $formatSize(bytes) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / 1048576).toFixed(1)} MB`;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.m)[1], "class", "filesChange");
}
function $onFileChange($scope) {
	return function(details) {
		$scope.m.onFileChange?.(details);
		$scope.m.filesChange?.(details.acceptedFiles.map((file) => ({
			name: file.name,
			size: file.size,
			type: file.type
		})));
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("ljT_cff", $machine);
_resume("hVqqtHC", $formatSize);
_resume("pxcWToD", $nativeAttrs);
_resume("XTO$iDM", $onFileChange);
_resume("udzh_tJ", $api);
//#endregion
