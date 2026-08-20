import { A as _dynamic_tag, K as _return, R as _if, S as _const, U as _or, W as _resume, Z as _var_resume, _ as _attrs_script, g as _attrs_partial_content, h as _attrs_partial, n as _attr_class, q as _script, z as _if_closure } from "./_CFDNqKnx.js";
import { t as cn } from "./_Dv2PW3if.js";
import { t as cva } from "./_D3iYmd7b.js";
import { a as createMachine, bt as createAnatomy, f as createSplitProps, n as $input$1, t as $input$2 } from "./_ChYYrEpj.js";
import { t as getDataUrl } from "./_BKPs3Qoz.js";
import { t as memo } from "./_RHrPFZNd2.js";
import { t as createProps } from "./_sXgmTHUb2.js";
import { t as stripOwnProps } from "./_BniA0-zx.js";
import { t as $input$3 } from "./_Cr1qxOqA.js";
var parts = createAnatomy("qr-code").parts("root", "frame", "pattern", "overlay", "downloadTrigger").build();
//#endregion
//#region ../../node_modules/.bun/@zag-js+qr-code@1.43.0/node_modules/@zag-js/qr-code/dist/qr-code.dom.mjs
var getRootId = (scope) => scope.ids?.root ?? `qrcode:${scope.id}:root`;
var getFrameId = (scope) => scope.ids?.frame ?? `qrcode:${scope.id}:frame`;
var getFrameEl = (scope) => scope.getById(getFrameId(scope));
//#endregion
//#region ../../node_modules/.bun/@zag-js+qr-code@1.43.0/node_modules/@zag-js/qr-code/dist/qr-code.connect.mjs
function connect(service, normalize) {
	const { context, computed, send, scope, prop } = service;
	const encoded = computed("encoded");
	const pixelSize = prop("pixelSize");
	const height = encoded.size * pixelSize;
	const width = encoded.size * pixelSize;
	const paths = [];
	for (let row = 0; row < encoded.size; row++) for (let col = 0; col < encoded.size; col++) {
		const x = col * pixelSize;
		const y = row * pixelSize;
		if (encoded.data[row][col]) paths.push(`M${x},${y}h${pixelSize}v${pixelSize}h-${pixelSize}z`);
	}
	return {
		value: context.get("value"),
		setValue(value) {
			send({
				type: "VALUE.SET",
				value
			});
		},
		getDataUrl(type, quality) {
			const svgEl = getFrameEl(scope);
			return getDataUrl(svgEl, {
				type,
				quality
			});
		},
		getRootProps() {
			return normalize.element({
				id: getRootId(scope),
				...parts.root.attrs,
				style: {
					"--qrcode-pixel-size": `${pixelSize}px`,
					"--qrcode-width": `${width}px`,
					"--qrcode-height": `${height}px`,
					position: "relative"
				}
			});
		},
		getFrameProps() {
			return normalize.svg({
				id: getFrameId(scope),
				...parts.frame.attrs,
				xmlns: "http://www.w3.org/2000/svg",
				viewBox: `0 0 ${width} ${height}`
			});
		},
		getPatternProps() {
			return normalize.path({
				d: paths.join(""),
				...parts.pattern.attrs
			});
		},
		getOverlayProps() {
			return normalize.element({
				...parts.overlay.attrs,
				style: {
					position: "absolute",
					top: "50%",
					left: "50%",
					translate: "-50% -50%"
				}
			});
		},
		getDownloadTriggerProps(props) {
			return normalize.button({
				type: "button",
				...parts.downloadTrigger.attrs,
				onClick(event) {
					if (event.defaultPrevented) return;
					send({
						type: "DOWNLOAD_TRIGGER.CLICK",
						...props
					});
				}
			});
		}
	};
}
//#endregion
//#region ../../node_modules/.bun/uqr@0.1.3/node_modules/uqr/dist/index.mjs
var QrCodeDataType = /* @__PURE__ */ ((QrCodeDataType2) => {
	QrCodeDataType2[QrCodeDataType2["Border"] = -1] = "Border";
	QrCodeDataType2[QrCodeDataType2["Data"] = 0] = "Data";
	QrCodeDataType2[QrCodeDataType2["Function"] = 1] = "Function";
	QrCodeDataType2[QrCodeDataType2["Position"] = 2] = "Position";
	QrCodeDataType2[QrCodeDataType2["Timing"] = 3] = "Timing";
	QrCodeDataType2[QrCodeDataType2["Alignment"] = 4] = "Alignment";
	return QrCodeDataType2;
})(QrCodeDataType || {});
var LOW = [0, 1];
var MEDIUM = [1, 0];
var QUARTILE = [2, 3];
var HIGH = [3, 2];
var EccMap = {
	L: LOW,
	M: MEDIUM,
	Q: QUARTILE,
	H: HIGH
};
var NUMERIC_REGEX = /^\d*$/;
var ALPHANUMERIC_REGEX = /^[A-Z0-9 $%*+./:-]*$/;
var ALPHANUMERIC_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
var MIN_VERSION = 1;
var MAX_VERSION = 40;
var PENALTY_N1 = 3;
var PENALTY_N2 = 3;
var PENALTY_N3 = 40;
var PENALTY_N4 = 10;
var ECC_CODEWORDS_PER_BLOCK = [
	[
		-1,
		7,
		10,
		15,
		20,
		26,
		18,
		20,
		24,
		30,
		18,
		20,
		24,
		26,
		30,
		22,
		24,
		28,
		30,
		28,
		28,
		28,
		28,
		30,
		30,
		26,
		28,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30
	],
	[
		-1,
		10,
		16,
		26,
		18,
		24,
		16,
		18,
		22,
		22,
		26,
		30,
		22,
		22,
		24,
		24,
		28,
		28,
		26,
		26,
		26,
		26,
		28,
		28,
		28,
		28,
		28,
		28,
		28,
		28,
		28,
		28,
		28,
		28,
		28,
		28,
		28,
		28,
		28,
		28,
		28
	],
	[
		-1,
		13,
		22,
		18,
		26,
		18,
		24,
		18,
		22,
		20,
		24,
		28,
		26,
		24,
		20,
		30,
		24,
		28,
		28,
		26,
		30,
		28,
		30,
		30,
		30,
		30,
		28,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30
	],
	[
		-1,
		17,
		28,
		22,
		16,
		22,
		28,
		26,
		26,
		24,
		28,
		24,
		28,
		22,
		24,
		24,
		30,
		28,
		28,
		26,
		28,
		30,
		24,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30,
		30
	]
];
var NUM_ERROR_CORRECTION_BLOCKS = [
	[
		-1,
		1,
		1,
		1,
		1,
		1,
		2,
		2,
		2,
		2,
		4,
		4,
		4,
		4,
		4,
		6,
		6,
		6,
		6,
		7,
		8,
		8,
		9,
		9,
		10,
		12,
		12,
		12,
		13,
		14,
		15,
		16,
		17,
		18,
		19,
		19,
		20,
		21,
		22,
		24,
		25
	],
	[
		-1,
		1,
		1,
		1,
		2,
		2,
		4,
		4,
		4,
		5,
		5,
		5,
		8,
		9,
		9,
		10,
		10,
		11,
		13,
		14,
		16,
		17,
		17,
		18,
		20,
		21,
		23,
		25,
		26,
		28,
		29,
		31,
		33,
		35,
		37,
		38,
		40,
		43,
		45,
		47,
		49
	],
	[
		-1,
		1,
		1,
		2,
		2,
		4,
		4,
		6,
		6,
		8,
		8,
		8,
		10,
		12,
		16,
		12,
		17,
		16,
		18,
		21,
		20,
		23,
		23,
		25,
		27,
		29,
		34,
		34,
		35,
		38,
		40,
		43,
		45,
		48,
		51,
		53,
		56,
		59,
		62,
		65,
		68
	],
	[
		-1,
		1,
		1,
		2,
		4,
		4,
		4,
		5,
		6,
		8,
		8,
		11,
		11,
		16,
		16,
		18,
		16,
		19,
		21,
		25,
		25,
		25,
		34,
		30,
		32,
		35,
		37,
		40,
		42,
		45,
		48,
		51,
		54,
		57,
		60,
		63,
		66,
		70,
		74,
		77,
		81
	]
];
var QrCode = class {
	constructor(version, ecc, dataCodewords, msk) {
		this.version = version;
		this.ecc = ecc;
		if (version < MIN_VERSION || version > MAX_VERSION) throw new RangeError("Version value out of range");
		if (msk < -1 || msk > 7) throw new RangeError("Mask value out of range");
		this.size = version * 4 + 17;
		const row = Array.from({ length: this.size }).fill(false);
		for (let i = 0; i < this.size; i++) {
			this.modules.push(row.slice());
			this.types.push(row.map(() => 0));
		}
		this.drawFunctionPatterns();
		const allCodewords = this.addEccAndInterleave(dataCodewords);
		this.drawCodewords(allCodewords);
		if (msk === -1) {
			let minPenalty = 1e9;
			for (let i = 0; i < 8; i++) {
				this.applyMask(i);
				this.drawFormatBits(i);
				const penalty = this.getPenaltyScore();
				if (penalty < minPenalty) {
					msk = i;
					minPenalty = penalty;
				}
				this.applyMask(i);
			}
		}
		this.mask = msk;
		this.applyMask(msk);
		this.drawFormatBits(msk);
	}
	size;
	mask;
	modules = [];
	types = [];
	getModule(x, y) {
		return x >= 0 && x < this.size && y >= 0 && y < this.size && this.modules[y][x];
	}
	drawFunctionPatterns() {
		for (let i = 0; i < this.size; i++) {
			this.setFunctionModule(6, i, i % 2 === 0, QrCodeDataType.Timing);
			this.setFunctionModule(i, 6, i % 2 === 0, QrCodeDataType.Timing);
		}
		this.drawFinderPattern(3, 3);
		this.drawFinderPattern(this.size - 4, 3);
		this.drawFinderPattern(3, this.size - 4);
		const alignPatPos = this.getAlignmentPatternPositions();
		const numAlign = alignPatPos.length;
		for (let i = 0; i < numAlign; i++) for (let j = 0; j < numAlign; j++) if (!(i === 0 && j === 0 || i === 0 && j === numAlign - 1 || i === numAlign - 1 && j === 0)) this.drawAlignmentPattern(alignPatPos[i], alignPatPos[j]);
		this.drawFormatBits(0);
		this.drawVersion();
	}
	drawFormatBits(mask) {
		const data = this.ecc[1] << 3 | mask;
		let rem = data;
		for (let i = 0; i < 10; i++) rem = rem << 1 ^ (rem >>> 9) * 1335;
		const bits = (data << 10 | rem) ^ 21522;
		for (let i = 0; i <= 5; i++) this.setFunctionModule(8, i, getBit(bits, i));
		this.setFunctionModule(8, 7, getBit(bits, 6));
		this.setFunctionModule(8, 8, getBit(bits, 7));
		this.setFunctionModule(7, 8, getBit(bits, 8));
		for (let i = 9; i < 15; i++) this.setFunctionModule(14 - i, 8, getBit(bits, i));
		for (let i = 0; i < 8; i++) this.setFunctionModule(this.size - 1 - i, 8, getBit(bits, i));
		for (let i = 8; i < 15; i++) this.setFunctionModule(8, this.size - 15 + i, getBit(bits, i));
		this.setFunctionModule(8, this.size - 8, true);
	}
	drawVersion() {
		if (this.version < 7) return;
		let rem = this.version;
		for (let i = 0; i < 12; i++) rem = rem << 1 ^ (rem >>> 11) * 7973;
		const bits = this.version << 12 | rem;
		for (let i = 0; i < 18; i++) {
			const color = getBit(bits, i);
			const a = this.size - 11 + i % 3;
			const b = Math.floor(i / 3);
			this.setFunctionModule(a, b, color);
			this.setFunctionModule(b, a, color);
		}
	}
	drawFinderPattern(x, y) {
		for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) {
			const dist = Math.max(Math.abs(dx), Math.abs(dy));
			const xx = x + dx;
			const yy = y + dy;
			if (xx >= 0 && xx < this.size && yy >= 0 && yy < this.size) this.setFunctionModule(xx, yy, dist !== 2 && dist !== 4, QrCodeDataType.Position);
		}
	}
	drawAlignmentPattern(x, y) {
		for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) this.setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1, QrCodeDataType.Alignment);
	}
	setFunctionModule(x, y, isDark, type = QrCodeDataType.Function) {
		this.modules[y][x] = isDark;
		this.types[y][x] = type;
	}
	addEccAndInterleave(data) {
		const ver = this.version;
		const ecl = this.ecc;
		if (data.length !== getNumDataCodewords(ver, ecl)) throw new RangeError("Invalid argument");
		const numBlocks = NUM_ERROR_CORRECTION_BLOCKS[ecl[0]][ver];
		const blockEccLen = ECC_CODEWORDS_PER_BLOCK[ecl[0]][ver];
		const rawCodewords = Math.floor(getNumRawDataModules(ver) / 8);
		const numShortBlocks = numBlocks - rawCodewords % numBlocks;
		const shortBlockLen = Math.floor(rawCodewords / numBlocks);
		const blocks = [];
		const rsDiv = reedSolomonComputeDivisor(blockEccLen);
		for (let i = 0, k = 0; i < numBlocks; i++) {
			const dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
			k += dat.length;
			const ecc = reedSolomonComputeRemainder(dat, rsDiv);
			if (i < numShortBlocks) dat.push(0);
			blocks.push(dat.concat(ecc));
		}
		const result = [];
		for (let i = 0; i < blocks[0].length; i++) blocks.forEach((block, j) => {
			if (i !== shortBlockLen - blockEccLen || j >= numShortBlocks) result.push(block[i]);
		});
		return result;
	}
	drawCodewords(data) {
		if (data.length !== Math.floor(getNumRawDataModules(this.version) / 8)) throw new RangeError("Invalid argument");
		let i = 0;
		for (let right = this.size - 1; right >= 1; right -= 2) {
			if (right === 6) right = 5;
			for (let vert = 0; vert < this.size; vert++) for (let j = 0; j < 2; j++) {
				const x = right - j;
				const y = (right + 1 & 2) === 0 ? this.size - 1 - vert : vert;
				if (!this.types[y][x] && i < data.length * 8) {
					this.modules[y][x] = getBit(data[i >>> 3], 7 - (i & 7));
					i++;
				}
			}
		}
	}
	applyMask(mask) {
		if (mask < 0 || mask > 7) throw new RangeError("Mask value out of range");
		for (let y = 0; y < this.size; y++) for (let x = 0; x < this.size; x++) {
			let invert;
			switch (mask) {
				case 0:
					invert = (x + y) % 2 === 0;
					break;
				case 1:
					invert = y % 2 === 0;
					break;
				case 2:
					invert = x % 3 === 0;
					break;
				case 3:
					invert = (x + y) % 3 === 0;
					break;
				case 4:
					invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
					break;
				case 5:
					invert = x * y % 2 + x * y % 3 === 0;
					break;
				case 6:
					invert = (x * y % 2 + x * y % 3) % 2 === 0;
					break;
				case 7:
					invert = ((x + y) % 2 + x * y % 3) % 2 === 0;
					break;
				default: throw new Error("Unreachable");
			}
			if (!this.types[y][x] && invert) this.modules[y][x] = !this.modules[y][x];
		}
	}
	getPenaltyScore() {
		let result = 0;
		for (let y = 0; y < this.size; y++) {
			let runColor = false;
			let runX = 0;
			const runHistory = [
				0,
				0,
				0,
				0,
				0,
				0,
				0
			];
			for (let x = 0; x < this.size; x++) if (this.modules[y][x] === runColor) {
				runX++;
				if (runX === 5) result += PENALTY_N1;
				else if (runX > 5) result++;
			} else {
				this.finderPenaltyAddHistory(runX, runHistory);
				if (!runColor) result += this.finderPenaltyCountPatterns(runHistory) * PENALTY_N3;
				runColor = this.modules[y][x];
				runX = 1;
			}
			result += this.finderPenaltyTerminateAndCount(runColor, runX, runHistory) * PENALTY_N3;
		}
		for (let x = 0; x < this.size; x++) {
			let runColor = false;
			let runY = 0;
			const runHistory = [
				0,
				0,
				0,
				0,
				0,
				0,
				0
			];
			for (let y = 0; y < this.size; y++) if (this.modules[y][x] === runColor) {
				runY++;
				if (runY === 5) result += PENALTY_N1;
				else if (runY > 5) result++;
			} else {
				this.finderPenaltyAddHistory(runY, runHistory);
				if (!runColor) result += this.finderPenaltyCountPatterns(runHistory) * PENALTY_N3;
				runColor = this.modules[y][x];
				runY = 1;
			}
			result += this.finderPenaltyTerminateAndCount(runColor, runY, runHistory) * PENALTY_N3;
		}
		for (let y = 0; y < this.size - 1; y++) for (let x = 0; x < this.size - 1; x++) {
			const color = this.modules[y][x];
			if (color === this.modules[y][x + 1] && color === this.modules[y + 1][x] && color === this.modules[y + 1][x + 1]) result += PENALTY_N2;
		}
		let dark = 0;
		for (const row of this.modules) dark = row.reduce((sum, color) => sum + (color ? 1 : 0), dark);
		const total = this.size * this.size;
		const k = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
		result += k * PENALTY_N4;
		return result;
	}
	getAlignmentPatternPositions() {
		if (this.version === 1) return [];
		else {
			const numAlign = Math.floor(this.version / 7) + 2;
			const step = this.version === 32 ? 26 : Math.ceil((this.version * 4 + 4) / (numAlign * 2 - 2)) * 2;
			const result = [6];
			for (let pos = this.size - 7; result.length < numAlign; pos -= step) result.splice(1, 0, pos);
			return result;
		}
	}
	finderPenaltyCountPatterns(runHistory) {
		const n = runHistory[1];
		const core = n > 0 && runHistory[2] === n && runHistory[3] === n * 3 && runHistory[4] === n && runHistory[5] === n;
		return (core && runHistory[0] >= n * 4 && runHistory[6] >= n ? 1 : 0) + (core && runHistory[6] >= n * 4 && runHistory[0] >= n ? 1 : 0);
	}
	finderPenaltyTerminateAndCount(currentRunColor, currentRunLength, runHistory) {
		if (currentRunColor) {
			this.finderPenaltyAddHistory(currentRunLength, runHistory);
			currentRunLength = 0;
		}
		currentRunLength += this.size;
		this.finderPenaltyAddHistory(currentRunLength, runHistory);
		return this.finderPenaltyCountPatterns(runHistory);
	}
	finderPenaltyAddHistory(currentRunLength, runHistory) {
		if (runHistory[0] === 0) currentRunLength += this.size;
		runHistory.pop();
		runHistory.unshift(currentRunLength);
	}
};
function appendBits(val, len, bb) {
	if (len < 0 || len > 31 || val >>> len !== 0) throw new RangeError("Value out of range");
	for (let i = len - 1; i >= 0; i--) bb.push(val >>> i & 1);
}
function getBit(x, i) {
	return (x >>> i & 1) !== 0;
}
var QrSegment = class {
	constructor(mode, numChars, bitData) {
		this.mode = mode;
		this.numChars = numChars;
		this.bitData = bitData;
		if (numChars < 0) throw new RangeError("Invalid argument");
		this.bitData = bitData.slice();
	}
	getData() {
		return this.bitData.slice();
	}
};
var MODE_NUMERIC = [
	1,
	10,
	12,
	14
];
var MODE_ALPHANUMERIC = [
	2,
	9,
	11,
	13
];
var MODE_BYTE = [
	4,
	8,
	16,
	16
];
function numCharCountBits(mode, ver) {
	return mode[Math.floor((ver + 7) / 17) + 1];
}
function makeBytes(data) {
	const bb = [];
	for (const b of data) appendBits(b, 8, bb);
	return new QrSegment(MODE_BYTE, data.length, bb);
}
function makeNumeric(digits) {
	if (!isNumeric(digits)) throw new RangeError("String contains non-numeric characters");
	const bb = [];
	for (let i = 0; i < digits.length;) {
		const n = Math.min(digits.length - i, 3);
		appendBits(Number.parseInt(digits.substring(i, i + n), 10), n * 3 + 1, bb);
		i += n;
	}
	return new QrSegment(MODE_NUMERIC, digits.length, bb);
}
function makeAlphanumeric(text) {
	if (!isAlphanumeric(text)) throw new RangeError("String contains unencodable characters in alphanumeric mode");
	const bb = [];
	let i;
	for (i = 0; i + 2 <= text.length; i += 2) {
		let temp = ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)) * 45;
		temp += ALPHANUMERIC_CHARSET.indexOf(text.charAt(i + 1));
		appendBits(temp, 11, bb);
	}
	if (i < text.length) appendBits(ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)), 6, bb);
	return new QrSegment(MODE_ALPHANUMERIC, text.length, bb);
}
function makeSegments(text) {
	if (text === "") return [];
	else if (isNumeric(text)) return [makeNumeric(text)];
	else if (isAlphanumeric(text)) return [makeAlphanumeric(text)];
	else return [makeBytes(toUtf8ByteArray(text))];
}
function isNumeric(text) {
	return NUMERIC_REGEX.test(text);
}
function isAlphanumeric(text) {
	return ALPHANUMERIC_REGEX.test(text);
}
function getTotalBits(segs, version) {
	let result = 0;
	for (const seg of segs) {
		const ccbits = numCharCountBits(seg.mode, version);
		if (seg.numChars >= 1 << ccbits) return Number.POSITIVE_INFINITY;
		result += 4 + ccbits + seg.bitData.length;
	}
	return result;
}
function toUtf8ByteArray(str) {
	str = encodeURI(str);
	const result = [];
	for (let i = 0; i < str.length; i++) if (str.charAt(i) !== "%") result.push(str.charCodeAt(i));
	else {
		result.push(Number.parseInt(str.substring(i + 1, i + 3), 16));
		i += 2;
	}
	return result;
}
function getNumRawDataModules(ver) {
	if (ver < MIN_VERSION || ver > MAX_VERSION) throw new RangeError("Version number out of range");
	let result = (16 * ver + 128) * ver + 64;
	if (ver >= 2) {
		const numAlign = Math.floor(ver / 7) + 2;
		result -= (25 * numAlign - 10) * numAlign - 55;
		if (ver >= 7) result -= 36;
	}
	return result;
}
function getNumDataCodewords(ver, ecl) {
	return Math.floor(getNumRawDataModules(ver) / 8) - ECC_CODEWORDS_PER_BLOCK[ecl[0]][ver] * NUM_ERROR_CORRECTION_BLOCKS[ecl[0]][ver];
}
function reedSolomonComputeDivisor(degree) {
	if (degree < 1 || degree > 255) throw new RangeError("Degree out of range");
	const result = [];
	for (let i = 0; i < degree - 1; i++) result.push(0);
	result.push(1);
	let root = 1;
	for (let i = 0; i < degree; i++) {
		for (let j = 0; j < result.length; j++) {
			result[j] = reedSolomonMultiply(result[j], root);
			if (j + 1 < result.length) result[j] ^= result[j + 1];
		}
		root = reedSolomonMultiply(root, 2);
	}
	return result;
}
function reedSolomonComputeRemainder(data, divisor) {
	const result = divisor.map((_) => 0);
	for (const b of data) {
		const factor = b ^ result.shift();
		result.push(0);
		divisor.forEach((coef, i) => result[i] ^= reedSolomonMultiply(coef, factor));
	}
	return result;
}
function reedSolomonMultiply(x, y) {
	if (x >>> 8 !== 0 || y >>> 8 !== 0) throw new RangeError("Byte out of range");
	let z = 0;
	for (let i = 7; i >= 0; i--) {
		z = z << 1 ^ (z >>> 7) * 285;
		z ^= (y >>> i & 1) * x;
	}
	return z;
}
function encodeSegments(segs, ecl, minVersion = 1, maxVersion = 40, mask = -1, boostEcl = true) {
	if (!(MIN_VERSION <= minVersion && minVersion <= maxVersion && maxVersion <= MAX_VERSION) || mask < -1 || mask > 7) throw new RangeError("Invalid value");
	let version;
	let dataUsedBits;
	for (version = minVersion;; version++) {
		const dataCapacityBits2 = getNumDataCodewords(version, ecl) * 8;
		const usedBits = getTotalBits(segs, version);
		if (usedBits <= dataCapacityBits2) {
			dataUsedBits = usedBits;
			break;
		}
		if (version >= maxVersion) throw new RangeError("Data too long");
	}
	for (const newEcl of [
		MEDIUM,
		QUARTILE,
		HIGH
	]) if (boostEcl && dataUsedBits <= getNumDataCodewords(version, newEcl) * 8) ecl = newEcl;
	const bb = [];
	for (const seg of segs) {
		appendBits(seg.mode[0], 4, bb);
		appendBits(seg.numChars, numCharCountBits(seg.mode, version), bb);
		for (const b of seg.getData()) bb.push(b);
	}
	const dataCapacityBits = getNumDataCodewords(version, ecl) * 8;
	appendBits(0, Math.min(4, dataCapacityBits - bb.length), bb);
	appendBits(0, (8 - bb.length % 8) % 8, bb);
	for (let padByte = 236; bb.length < dataCapacityBits; padByte ^= 253) appendBits(padByte, 8, bb);
	const dataCodewords = Array.from({ length: Math.ceil(bb.length / 8) }, () => 0);
	bb.forEach((b, i) => dataCodewords[i >>> 3] |= b << 7 - (i & 7));
	return new QrCode(version, ecl, dataCodewords, mask);
}
function encode(data, options) {
	const { ecc = "L", boostEcc = false, minVersion = 1, maxVersion = 40, maskPattern = -1, border = 1 } = options || {};
	const segment = typeof data === "string" ? makeSegments(data) : Array.isArray(data) ? [makeBytes(data)] : void 0;
	if (!segment) throw new Error(`uqr only supports encoding string and binary data, but got: ${typeof data}`);
	const qr = encodeSegments(segment, EccMap[ecc], minVersion, maxVersion, maskPattern, boostEcc);
	const result = addBorder({
		version: qr.version,
		maskPattern: qr.mask,
		size: qr.size,
		data: qr.modules,
		types: qr.types
	}, border);
	if (options?.invert) result.data = result.data.map((row) => row.map((mod) => !mod));
	options?.onEncoded?.(result);
	return result;
}
function addBorder(input, border = 1) {
	if (!border) return input;
	const { size } = input;
	const newSize = size + border * 2;
	input.size = newSize;
	input.data.forEach((row) => {
		for (let i = 0; i < border; i++) {
			row.unshift(false);
			row.push(false);
		}
	});
	for (let i = 0; i < border; i++) {
		input.data.unshift(Array.from({ length: newSize }, (_) => false));
		input.data.push(Array.from({ length: newSize }, (_) => false));
	}
	const b = QrCodeDataType.Border;
	input.types.forEach((row) => {
		for (let i = 0; i < border; i++) {
			row.unshift(b);
			row.push(b);
		}
	});
	for (let i = 0; i < border; i++) {
		input.types.unshift(Array.from({ length: newSize }, (_) => b));
		input.types.push(Array.from({ length: newSize }, (_) => b));
	}
	return input;
}
//#endregion
//#region ../../node_modules/.bun/@zag-js+qr-code@1.43.0/node_modules/@zag-js/qr-code/dist/qr-code.machine.mjs
var machine = createMachine({
	props({ props }) {
		return {
			defaultValue: "",
			pixelSize: 10,
			...props
		};
	},
	initialState() {
		return "idle";
	},
	context({ prop, bindable }) {
		return { value: bindable(() => ({
			value: prop("value"),
			defaultValue: prop("defaultValue"),
			onChange(value) {
				prop("onValueChange")?.({ value });
			}
		})) };
	},
	computed: { encoded: memo(({ context, prop }) => [context.get("value"), prop("encoding")], ([value, encoding]) => encode(value, encoding)) },
	states: { idle: { on: {
		"VALUE.SET": { actions: ["setValue"] },
		"DOWNLOAD_TRIGGER.CLICK": { actions: ["downloadQrCode"] }
	} } },
	implementations: { actions: {
		setValue({ context, event }) {
			context.set("value", event.value);
		},
		downloadQrCode({ event, scope }) {
			const { mimeType, quality, fileName } = event;
			const svgEl = getFrameEl(scope);
			const doc = scope.getDoc();
			getDataUrl(svgEl, {
				type: mimeType,
				quality
			}).then((dataUri) => {
				const a = doc.createElement("a");
				a.href = dataUri;
				a.rel = "noopener";
				a.download = fileName;
				a.click();
				setTimeout(() => {
					a.remove();
				}, 0);
			});
		}
	} }
});
//#endregion
//#region ../../node_modules/.bun/@zag-js+qr-code@1.43.0/node_modules/@zag-js/qr-code/dist/qr-code.props.mjs
var props = createProps()([
	"ids",
	"defaultValue",
	"value",
	"id",
	"encoding",
	"dir",
	"getRootNode",
	"onValueChange",
	"pixelSize"
]);
var splitProps = createSplitProps(props);
//#endregion
//#region ../../packages/shadcn/ui/qr-code/variants.ts
/**
* Sizing chrome only (see avatar/variants.ts for the analogous pattern) —
* these classes constrain the rendered frame's box; the machine's own
* `pixelSize` prop (set in qr-code.marko from the same `size` variant)
* controls the actual SVG viewBox/path geometry.
*/
var qrCodeVariants = cva("relative inline-flex shrink-0 items-center justify-center", {
	variants: { size: {
		sm: "size-24",
		default: "size-40",
		lg: "size-56"
	} },
	defaultVariants: { size: "default" }
});
/** Maps the `size` variant to the machine's `pixelSize` (px per module). */
var qrCodePixelSizeBySize = {
	sm: 4,
	default: 6,
	lg: 8
};
//#endregion
//#region ../../packages/shadcn/ui/qr-code/qr-code.marko
var $if_content__dynamicTag = /*@__PURE__*/ _dynamic_tag(1);
var $if_content__input_overlay = /*@__PURE__*/ _if_closure(9, 0, ($scope) => $if_content__dynamicTag($scope, $scope._.p));
var $if_content__setup = ($scope) => {
	$if_content__input_overlay._($scope);
	$if_content__api._($scope);
};
var $if_content__api__script = _script("p4IEt5v", ($scope) => _attrs_script($scope, "a"));
var $if_content__api = /*@__PURE__*/ _if_closure(9, 0, ($scope) => {
	_attrs_partial($scope, "a", $scope._.s().getOverlayProps(), {
		"data-slot": 1,
		class: 1
	});
	$if_content__api__script($scope);
});
_var_resume("gqG4COs", ($scope, machineProps) => $input$1($scope.c, {
	machine: $machine,
	props: machineProps
}));
var $api__OR__nativeAttrs__script = _script("rlcFpGe", ($scope) => _attrs_script($scope, "g"));
var $api__OR__nativeAttrs = /*@__PURE__*/ _or(20, ($scope) => {
	_attrs_partial($scope, "g", {
		...$scope.t(),
		...$scope.s().getRootProps()
	}, {
		"data-slot": 1,
		class: 1
	});
	$api__OR__nativeAttrs__script($scope);
}, 1, 3);
var $nativeAttrs2 = /*@__PURE__*/ _const(19, $api__OR__nativeAttrs);
var $input = /*@__PURE__*/ _const(11, ($scope) => {
	$input$3($scope.a, {
		from: $scope.l,
		pick: props,
		pixelSize: $scope.l.pixelSize ?? qrCodePixelSizeBySize[$scope.l.size ?? "default"],
		onValueChange: $onValueChange($scope)
	});
	$input_size($scope, $scope.l.size);
	$input_class($scope, $scope.l.class);
	$input_overlay($scope, $scope.l.overlay);
	$nativeAttrs2($scope, $nativeAttrs($scope));
});
_var_resume("GI654RV", ($scope, service) => $input$2($scope.e, {
	value: $api,
	service
}));
var $api2__script = _script("J2l5zQI", ($scope) => {
	_attrs_script($scope, "h");
	_attrs_script($scope, "i");
});
_var_resume("Zl4T6lo", /*@__PURE__*/ _const(18, ($scope) => {
	_attrs_partial($scope, "h", $scope.s().getFrameProps(), {
		"data-slot": 1,
		class: 1
	});
	_attrs_partial_content($scope, "i", $scope.s().getPatternProps(), {
		"data-slot": 1,
		class: 1
	});
	_return($scope, $scope.s);
	$api__OR__nativeAttrs($scope);
	$if_content__api($scope);
	$api2__script($scope);
}));
var $input_size__OR__input_class = /*@__PURE__*/ _or(14, ($scope) => _attr_class($scope.g, cn(qrCodeVariants({ size: $scope.m }), $scope.n)));
var $input_size = /*@__PURE__*/ _const(12, $input_size__OR__input_class);
var $input_class = /*@__PURE__*/ _const(13, $input_size__OR__input_class);
var $if = /*@__PURE__*/ _if(9, "<div data-slot=qr-code-overlay class=\"flex items-center justify-center rounded-sm bg-background p-1 shadow-xs\"><!></div>", " D%", $if_content__setup);
var $input_overlay = /*@__PURE__*/ _const(15, ($scope) => {
	$if($scope, $scope.p ? 0 : 1);
	$if_content__input_overlay($scope);
});
function $machine() {
	return machine;
}
function $nativeAttrs($scope) {
	return () => stripOwnProps(splitProps($scope.l)[1], "class", "size", "overlay", "valueChange");
}
function $onValueChange($scope) {
	return function(details) {
		$scope.l.onValueChange?.(details);
		$scope.l.valueChange?.(details.value);
	};
}
function $api(service, normalizeProps) {
	return connect(service, normalizeProps);
}
_resume("HSLYE8z", $machine);
_resume("mrym4C8", $nativeAttrs);
_resume("LVDC_jf", $onValueChange);
_resume("udyI3G$", $api);
//#endregion
export { $input as t };
