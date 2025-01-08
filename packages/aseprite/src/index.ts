import pako from "pako";

// Data types
// ================================================

export type Tagged<Name extends string, Type> = Type & { __tag: Name };

/** The equivalent of `BYTE` in the Aseprite file format. */
export type AsepriteByte = Tagged<"AsepriteByte", number>;

/** The equivalent of `WORD` in the Aseprite file format. */
export type AsepriteSignedInt16 = Tagged<"AsepriteSignedInt16", number>;
/** The equivalent of `SHORT` in the Aseprite file format. */
export type AsepriteUnsignedInt16 = Tagged<"AsepriteUnsignedInt16", number>;
/** The equivalent of `DWORD` in the Aseprite file format. */
export type AsepriteSignedInt32 = Tagged<"AsepriteSignedInt32", number>;
/** The equivalent of `LONG` in the Aseprite file format. */
export type AsepriteUnsignedInt32 = Tagged<"AsepriteUnsignedInt32", number>;
/** The equivalent of `QWORD` in the Aseprite file format. */
export type AsepriteSignedInt64 = Tagged<"AsepriteSignedInt64", bigint>;
/** The equivalent of `LONG64` in the Aseprite file format. */
export type AsepriteUnsignedInt64 = Tagged<"AsepriteUnsignedInt64", bigint>;

/** The equivalent of `FLOAT` in the Aseprite file format. */
export type AsepriteFloat32 = Tagged<"AsepriteFloat32", number>;
/** The equivalent of `DOUBLE` in the Aseprite file format. */
export type AsepriteFloat64 = Tagged<"AsepriteFloat64", number>;

/** The equivalent of `FIXED` in the Aseprite file format. */
export type AsepriteFixed32 = Tagged<"AsepriteFixed32", number>;

export type AsepriteUuid = Tagged<"AsepriteUuid", string>;

export interface AsepritePoint {
	x: AsepriteUnsignedInt32;
	y: AsepriteUnsignedInt32;
}

export interface AsepriteSize {
	width: AsepriteUnsignedInt32;
	height: AsepriteUnsignedInt32;
}

export interface AsepriteRect {
	point: AsepritePoint;
	size: AsepriteSize;
}

export type AsepriteRgbaPixel = [
	AsepriteByte,
	AsepriteByte,
	AsepriteByte,
	AsepriteByte
];
export type AsepriteGrayscalePixel = [AsepriteByte, AsepriteByte];
export type AsepriteIndexedPixel = AsepriteByte;

export type AsepritePixel =
	| AsepriteRgbaPixel
	| AsepriteGrayscalePixel
	| AsepriteIndexedPixel;

export type AsepriteFlags = Tagged<"AsepriteFlags", number>;
export type AsepriteBigFlags = Tagged<"AsepriteBigFlags", number>;

// File header
// ================================================

export enum AsepriteColorDepth {
	Rgba = 32,
	Grayscale = 16,
	Index = 8,
}

export interface AsepriteFileHeader {
	/** The file size */
	size: number;
	/** The number of frames in the file. */
	frames: number;
	/** The width of the canvas. */
	width: number;
	/** The height of the canvas. */
	height: number;
	/** The color system used. */
	depth: AsepriteColorDepth;
	/** The flags informs how the file is configured. */
	flags: AsepriteBigFlags;
	/** The speed at which this file's animation plays (to be ignored in favor of frame duration). */
	speed: number;
	/** The transparency color index. */
	transparency: number;
	/** The number of colors in the palette. */
	colors: number;

	pixel: {
		/** The width of a pixel. */
		width: number;
		/** The height of a pixel. */
		height: number;
	};

	grid: {
		/** The horizontal position where the grid starts. */
		x: number;
		/** The vertical position where the grid starts. */
		y: number;
		/** The width of the grid. */
		width: number;
		/** The height of the grid. */
		height: number;
	};
}

// File chunks
// ================================================

export enum AsepriteFileChunkKind {
	/** An old palette format that is included for compatibility. */
	OldPalette0 = 0x0004,
	/** An old palette format that is included for compatibility. */
	OldPalette1 = 0x0011,
	/** A layer of a frame. */
	Layer = 0x2004,
	/** A cel (image) of a layer. */
	Cel = 0x2005,
	/** Additional information about a cel. */
	CelExtra = 0x2006,
	/** The color profile of the file. */
	ColorProfile = 0x2007,
	/** Additional files that are linked to the file. */
	ExternalFiles = 0x2008,
	/** @deprecated */
	Mask = 0x2016,
	/** This chunk type is not currently used. */
	Path = 0x2017,
	/** A tag that can be applied to a frame. */
	Tags = 0x2018,
	/** The palette of the file. */
	Palette = 0x2019,
	/** A user data chunk which is applied to the previous parsed chunk. */
	UserData = 0x2020,
	/** A sliced image. */
	Slice = 0x2022,
	/** A tileset. */
	Tileset = 0x2023,
}

export const AsepriteFileChunkKindReverseLookup: Record<
	number,
	keyof AsepriteFileChunkKind
> = {};

for (const [key, value] of Object.entries(AsepriteFileChunkKind)) {
	AsepriteFileChunkKindReverseLookup[value as unknown as number] =
		key as keyof AsepriteFileChunkKind;
}

interface AsepriteFileChunkBase {
	userdata?: Record<string, any>;
}

export interface AsepriteFileOldPalette0ChunkPacket {
	offset: AsepriteByte;
	colors: [AsepriteByte, AsepriteByte, AsepriteByte][];
}

/** This chunk is often ignored since modern Aseprite files include palette information elsewhere */
export interface AsepriteFileOldPalette0Chunk extends AsepriteFileChunkBase {
	kind: AsepriteFileChunkKind.OldPalette0;
	packets: AsepriteFileOldPalette0ChunkPacket[];
}

export interface AsepriteFileOldPalette1ChunkPacket {
	offset: AsepriteByte;
	colors: [AsepriteByte, AsepriteByte, AsepriteByte][];
}

/** This chunk is often ignored since modern Aseprite files include palette information elsewhere */
export interface AsepriteFileOldPalette1Chunk extends AsepriteFileChunkBase {
	kind: AsepriteFileChunkKind.OldPalette1;
	packets: AsepriteFileOldPalette1ChunkPacket[];
}

export enum AsepriteLayerType {
	Normal = 0,
	Group = 1,
	Tilemap = 2,
}

export enum AsepriteLayerBlendMode {
	Normal = 0,
	Multiply = 1,
	Screen = 2,
	Overlay = 3,
	Darken = 4,
	Lighten = 5,
	ColorDodge = 6,
	ColorBurn = 7,
	HardLight = 8,
	SoftLight = 9,
	Difference = 10,
	Exclusion = 11,
	Hue = 12,
	Saturation = 13,
	Color = 14,
	Luminosity = 15,
	Addition = 16,
	Subtract = 17,
	Divide = 18,
}

interface AsepriteFileLayerChunkBase extends AsepriteFileChunkBase {
	/** The kind of chunk. */
	kind: AsepriteFileChunkKind.Layer;
	/** The flags of the layer. */
	flags: AsepriteFlags;
	/** The level of the layer's children. */
	level: AsepriteSignedInt16;
	/** The blend mode of the layer. */
	blend: AsepriteLayerBlendMode;
	/** The opacity of the layer. */
	opacity: AsepriteByte;
	/** The name of the layer. */
	name: string;
}

export interface AsepriteFileLayerChunkNormal
	extends AsepriteFileLayerChunkBase {
	type: AsepriteLayerType.Normal;
}

export interface AsepriteFileLayerChunkGroup
	extends AsepriteFileLayerChunkBase {
	type: AsepriteLayerType.Group;
}

export interface AsepriteFileLayerChunkTilemap
	extends AsepriteFileLayerChunkBase {
	tileset: AsepriteSignedInt32;
}

export type AsepriteFileLayerChunk =
	| AsepriteFileLayerChunkNormal
	| AsepriteFileLayerChunkGroup
	| AsepriteFileLayerChunkTilemap;

export enum AsepriteCelType {
	RawImage = 0,
	LinkedCel = 1,
	CompressedImage = 2,
	CompressedTilemap = 3,
}

interface AsepriteFileCelChunkBase {
	kind: AsepriteFileChunkKind.Cel;
	layer: AsepriteSignedInt16;
	x: AsepriteUnsignedInt16;
	y: AsepriteUnsignedInt16;
	opacity: AsepriteByte;
	z: AsepriteUnsignedInt16;
}

export interface AsepriteFileCelChunkRawImage extends AsepriteFileCelChunkBase {
	type: AsepriteCelType.RawImage;
	width: AsepriteSignedInt16;
	height: AsepriteSignedInt16;
	pixels: AsepritePixel[];
}

export interface AsepriteFileCelChunkLinkedCel
	extends AsepriteFileCelChunkBase {
	type: AsepriteCelType.LinkedCel;
	frame: AsepriteSignedInt16;
}

export interface AsepriteFileCelChunkCompressedImage
	extends AsepriteFileCelChunkBase {
	type: AsepriteCelType.CompressedImage;
	width: AsepriteSignedInt16;
	height: AsepriteSignedInt16;
	pixels: AsepriteByte[];
}

/** We aren't supporting tiles yet so this chunk type will go unused. */
export interface AsepriteFileCelChunkCompressedTilemap
	extends AsepriteFileCelChunkBase {
	type: AsepriteCelType.CompressedTilemap;
}

export type AsepriteFileCelChunk =
	| AsepriteFileCelChunkRawImage
	| AsepriteFileCelChunkLinkedCel
	| AsepriteFileCelChunkCompressedImage
	| AsepriteFileCelChunkCompressedTilemap;

export enum AsepriteFileChunkType {
	None = 0,
	Srgb = 1,
	Embedded = 2,
}

export enum AsepriteTagAnimationDirection {
	Forward = 0,
	Reverse = 1,
	PingPong = 2,
	PingPongReverse = 3,
}

export interface AsepriteTag {
	from: AsepriteSignedInt16;
	to: AsepriteSignedInt16;
	direction: AsepriteTagAnimationDirection;
	repeat: AsepriteSignedInt16;
	color: AsepriteRgbaPixel;
	name: string;
}

export interface AsepriteFileTagsChunk extends AsepriteFileChunkBase {
	kind: AsepriteFileChunkKind.Tags;
	tags: Array<AsepriteTag>;
}

interface AsepriteFileColorProfileChunkBase {
	kind: AsepriteFileChunkKind.ColorProfile;
	flags: AsepriteFlags;
	gamma: AsepriteFixed32;
}

export interface AsepriteFileColorProfileChunkNone
	extends AsepriteFileColorProfileChunkBase {
	type: AsepriteFileChunkType.None;
}

export interface AsepriteFileColorProfileChunkSrgb
	extends AsepriteFileColorProfileChunkBase {
	type: AsepriteFileChunkType.Srgb;
}

/** We don't support embedded color profiles yet so this chunk type will go unused. */
export interface AsepriteFileColorProfileChunkEmbedded
	extends AsepriteFileColorProfileChunkBase {
	type: AsepriteFileChunkType.Embedded;
	data: AsepriteByte[];
}

export type AsepriteFileColorProfileChunk =
	| AsepriteFileColorProfileChunkNone
	| AsepriteFileColorProfileChunkSrgb
	| AsepriteFileColorProfileChunkEmbedded;

export interface AsepritePaletteEntry {
	flags: AsepriteFlags;
	red: AsepriteByte;
	green: AsepriteByte;
	blue: AsepriteByte;
	alpha: AsepriteByte;
	name?: string;
}

export interface AsepriteFilePaletteChunk {
	kind: AsepriteFileChunkKind.Palette;
	size: AsepriteSignedInt32;
	start: AsepriteSignedInt32;
	end: AsepriteSignedInt32;
	entries: AsepritePaletteEntry[];
}

interface AsepriteFileUserDataChunkBase {
	kind: AsepriteFileChunkKind.UserData;
	flags: AsepriteBigFlags;
}

export interface AsepriteFileUserDataChunkText
	extends AsepriteFileUserDataChunkBase {
	text: string;
}

export interface AsepriteFileUserDataChunkColor
	extends AsepriteFileUserDataChunkBase {
	color: {
		red: AsepriteByte;
		green: AsepriteByte;
		blue: AsepriteByte;
		alpha: AsepriteByte;
	};
}

export enum AsepriteUserDataType {
	Boolean = 0x0001,
	SignedInt8 = 0x0002,
	UnsignedInt8 = 0x0003,
	SignedInt16 = 0x0004,
	UnsignedInt16 = 0x0005,
	SignedInt32 = 0x0006,
	UnsignedInt32 = 0x0007,
	SignedInt64 = 0x0008,
	UnsignedInt64 = 0x0009,
	Fixed32 = 0x000a,
	Float32 = 0x000b,
	Float64 = 0x000c,
	String = 0x000d,
	Point = 0x000e,
	Size = 0x000f,
	Rect = 0x0010,
	Vector = 0x0011,
	Map = 0x0012,
	Uuid = 0x0013,
}

export type AsepriteUserDataValue =
	| boolean
	| AsepriteByte
	| AsepriteSignedInt16
	| AsepriteUnsignedInt16
	| AsepriteSignedInt32
	| AsepriteUnsignedInt32
	| AsepriteSignedInt64
	| AsepriteUnsignedInt64
	| AsepriteFixed32
	| AsepriteFloat32
	| AsepriteFloat64
	| string
	| AsepritePoint
	| AsepriteSize
	| AsepriteRect
	| AsepriteUserDataValue[]
	| AsepriteUserDataMap
	| AsepriteUuid;

export interface AsepriteUserDataMap {
	[key: string]: AsepriteUserDataValue;
}

export interface AsepriteFileUserDataChunkMap
	extends AsepriteFileUserDataChunkBase {
	data: AsepriteUserDataMap;
}

export type AsepriteFileUserDataChunk =
	| AsepriteFileUserDataChunkText
	| AsepriteFileUserDataChunkColor
	| AsepriteFileUserDataChunkMap;

/** We don't support every single chunk type yet so this type is more limited than what we will parse in a file. */
export type AsepriteFileChunk =
	| AsepriteFileOldPalette0Chunk
	| AsepriteFileOldPalette1Chunk
	| AsepriteFileLayerChunk
	| AsepriteFileCelChunk
	| AsepriteFileColorProfileChunk
	| AsepriteFilePaletteChunk
	| AsepriteFileUserDataChunk
	| AsepriteFileTagsChunk;

// Parsed data
// ================================================

export interface AsepriteFrame {
	duration: number;
	layers: AsepriteLayer[];
	userdata: AsepriteUserDataMap;
}

export interface AsepriteLayer {
	blend: AsepriteLayerBlendMode;
	opacity: number;
	visible: boolean;
	cels: AsepriteCel[];
	userdata: AsepriteUserDataMap;
}

export interface AsepriteCel {
	x: number;
	y: number;
	z: number;
	width: number;
	height: number;
	opacity: number;
	pixels: AsepritePixel[];
	userdata: AsepriteUserDataMap;
}

// Aseprite
// ================================================

export class Aseprite {
	/** The current byte index in the file. */
	private cursor: number = 0;

	private file: ArrayBuffer;
	private data: DataView;

	public header: AsepriteFileHeader;
	public frames: AsepriteFrame[];
	public tags: AsepriteTag[] = [];
	public palette: Record<
		number | string,
		Omit<AsepritePaletteEntry, "flags" | "name">
	>;
	public width: number;
	public height: number;

	constructor(file: ArrayBuffer) {
		this.palette = {};
		this.file = file;
		this.data = new DataView(file);
		this.header = this.parseHeader();
		this.frames = this.parseFrames();
		this.width = this.header.width;
		this.height = this.header.height;
	}

	// File parsing
	// ================================================

	private parseHeader(): AsepriteFileHeader {
		/**
		 * DWORD       File size
		 * WORD        Magic number (0xA5E0)
		 * WORD        Frames
		 * WORD        Width in pixels
		 * WORD        Height in pixels
		 * WORD        Color depth (bits per pixel)
		 *               32 bpp = RGBA
		 *               16 bpp = Grayscale
		 *               8 bpp = Indexed
		 * DWORD       Flags:
		 *               1 = Layer opacity has valid value
		 * WORD        Speed (milliseconds between frame, like in FLC files)
		 *             DEPRECATED: You should use the frame duration field
		 *             from each frame header
		 * DWORD       Set be 0
		 * DWORD       Set be 0
		 * BYTE        Palette entry (index) which represent transparent color
		 *             in all non-background layers (only for Indexed sprites).
		 * BYTE[3]     Ignore these bytes
		 * WORD        Number of colors (0 means 256 for old sprites)
		 * BYTE        Pixel width (pixel ratio is "pixel width/pixel height").
		 *             If this or pixel height field is zero, pixel ratio is 1:1
		 * BYTE        Pixel height
		 * SHORT       X position of the grid
		 * SHORT       Y position of the grid
		 * WORD        Grid width (zero if there is no grid, grid size
		 *             is 16x16 on Aseprite by default)
		 * WORD        Grid height (zero if there is no grid)
		 * BYTE[84]    For future (set to zero)
		 */
		const size: AsepriteFileHeader["size"] = this.readUnsignedInt32();
		const magic: AsepriteUnsignedInt16 = this.readUnsignedInt16();

		if (magic !== 0xa5e0) {
			throw new Error("Invalid magic number");
		}

		const frames: AsepriteUnsignedInt16 = this.readUnsignedInt16();
		const width: AsepriteUnsignedInt16 = this.readUnsignedInt16();
		const height: AsepriteUnsignedInt16 = this.readUnsignedInt16();
		const depth: AsepriteColorDepth =
			this.readUnsignedInt16() as AsepriteColorDepth;

		if (
			depth !== AsepriteColorDepth.Rgba &&
			depth !== AsepriteColorDepth.Grayscale &&
			depth !== AsepriteColorDepth.Index
		) {
			throw new Error("Invalid color depth");
		}

		const flags: AsepriteBigFlags = this.readBigFlags();
		const speed: AsepriteUnsignedInt16 = this.readUnsignedInt16();

		const p0 = this.readUnsignedInt32();
		const p1 = this.readUnsignedInt32();

		if (p0 !== 0 || p1 !== 0) {
			throw new Error("Invalid header padding");
		}

		const transparency: AsepriteByte = this.readByte();

		this.readBytes(3);

		const colors: AsepriteUnsignedInt16 = this.readUnsignedInt16();

		const pixel: AsepriteFileHeader["pixel"] = {
			width: this.readByte(),
			height: this.readByte(),
		};

		const grid: AsepriteFileHeader["grid"] = {
			x: this.readSignedInt16(),
			y: this.readSignedInt16(),
			width: this.readUnsignedInt16(),
			height: this.readUnsignedInt16(),
		};

		this.readBytes(84);

		return {
			size,
			frames,
			width,
			height,
			depth,
			flags,
			speed,
			transparency,
			colors,
			pixel,
			grid,
		};
	}

	private parseFrames(): AsepriteFrame[] {
		const frames: AsepriteFrame[] = [];

		for (let i = 0; i < this.header.frames; i++) {
			frames.push(this.parseFrame(frames));
		}

		return frames;
	}

	private parseFrame(frames: AsepriteFrame[]) {
		/**
		 * DWORD       Bytes in this frame
		 * WORD        Magic number (always 0xF1FA)
		 * WORD        Old field which specifies the number of "chunks"
		 *             in this frame. If this value is 0xFFFF, we might
		 *             have more chunks to read in this frame
		 *             (so we have to use the new field)
		 * WORD        Frame duration (in milliseconds)
		 * BYTE[2]     For future (set to zero)
		 * DWORD       New field which specifies the number of "chunks"
		 *             in this frame (if this is 0, use the old field)
		 */
		const _size = this.readSignedInt32();
		const magic = this.readUnsignedInt16();

		if (magic !== 0xf1fa) {
			throw new Error("Invalid frame magic number");
		}

		const legacyChunks = this.readUnsignedInt16();
		const duration = this.readUnsignedInt16();

		this.readBytes(2);

		const modernChunks = this.readUnsignedInt32();

		let totalChunks = legacyChunks;

		if (modernChunks === 0) {
			totalChunks = legacyChunks;
		}

		const frame: AsepriteFrame = {
			duration,
			layers: [],
			userdata: {},
		};

		if (frames.length > 0) {
			const first = frames[0];

			for (const layer of first.layers) {
				frame.layers.push({
					...layer,
					cels: [],
				});
			}
		}

		let last: AsepriteFrame | AsepriteLayer | AsepriteCel | null = frame;
		let layer: AsepriteLayer | null = null;

		let hasModernPalette = false;
		let legacyPalette:
			| AsepriteFileOldPalette0Chunk
			| AsepriteFileOldPalette1Chunk
			| null = null;

		for (let i = 0; i < totalChunks; i++) {
			const chunk = this.parseChunk();

			if (chunk) {
				switch (chunk.kind) {
					default:
						// @ts-ignore-error
						// prettier-ignore
						console.warn(`Skipping unsupported Aseprite chunk: ${AsepriteFileChunkKindReverseLookup[chunk.kind] || `0x${chunk.kind.toString(16)}`}`);
						break;
					case AsepriteFileChunkKind.ColorProfile:
						// We don't need to do anything with color profiles since the only palette used is indexed.
						break;
					case AsepriteFileChunkKind.OldPalette0:
					case AsepriteFileChunkKind.OldPalette1:
						legacyPalette = chunk;
						break;
					case AsepriteFileChunkKind.Palette:
						hasModernPalette = true;

						for (let i = chunk.start; i <= chunk.end; i++) {
							const entry = chunk.entries[i - chunk.start];
							this.palette[i] = {
								red: entry.red,
								green: entry.green,
								blue: entry.blue,
								alpha: entry.alpha,
							};
						}
						break;
					case AsepriteFileChunkKind.Layer:
						layer = {
							blend: chunk.blend,
							opacity: chunk.opacity,
							visible: Boolean(chunk.flags & 1),
							cels: [],
							userdata: {},
						};
						last = layer;
						frame.layers.push(layer);
						break;
					case AsepriteFileChunkKind.Cel:
						const cel: AsepriteCel = {
							x: chunk.x,
							y: chunk.y,
							z: chunk.z,
							width:
								(chunk as AsepriteFileCelChunkRawImage).width ??
								0,
							height:
								(chunk as AsepriteFileCelChunkRawImage)
									.height ?? 0,
							opacity: chunk.opacity,
							pixels: (chunk as AsepriteFileCelChunkRawImage)
								.pixels,
							userdata: {},
						};
						last = cel;
						if (!frame.layers[chunk.layer]) {
							console.error("Cel found without a layer");
							break;
						}
						frame.layers[chunk.layer].cels.push(cel);
						break;
					case AsepriteFileChunkKind.UserData:
						if (last === null) {
							break;
						}

						if (chunk.flags & 1) {
							last.userdata._text = (
								chunk as AsepriteFileUserDataChunkText
							).text;
						}
						if (chunk.flags & 2) {
							last.userdata._color = (
								chunk as AsepriteFileUserDataChunkColor
							).color;
						}
						if (chunk.flags & 4) {
							last.userdata = {
								...last.userdata,
								...(chunk as AsepriteFileUserDataChunkMap).data,
							};
						}
						break;
					case AsepriteFileChunkKind.Tags:
						this.tags.push(
							...(chunk as AsepriteFileTagsChunk).tags
						);
						last = null;
						break;
				}
			}
		}

		if (!hasModernPalette && legacyPalette) {
			for (const packet of legacyPalette.packets) {
				for (let i = 0; i < packet.colors.length; i++) {
					this.palette[packet.offset + i] = {
						red: packet.colors[i][0],
						green: packet.colors[i][1],
						blue: packet.colors[i][2],
						alpha: 255 as AsepriteByte,
					};
				}
			}
		}

		return frame;
	}

	private parseChunk(): AsepriteFileChunk | null {
		/**
		 * DWORD       Chunk size
		 * WORD        Chunk type
		 * BYTE[]      Chunk data
		 */
		const cursor = this.cursor;
		const size = this.readSignedInt32();
		const type = this.readSignedInt16();

		switch (type) {
			case AsepriteFileChunkKind.OldPalette0: {
				const palette = this.parseOldPalette0();

				console.log({
					start: cursor,
					end: this.cursor,
					expected: size,
					actual: this.cursor - cursor,
				});

				return palette;
			}
			case AsepriteFileChunkKind.OldPalette1:
				return this.parseOldPalette1();
			case AsepriteFileChunkKind.Layer:
				return this.parseLayer();
			case AsepriteFileChunkKind.Cel:
				return this.parseCel(size);
			case AsepriteFileChunkKind.ColorProfile:
				return this.parseColorProfile();
			case AsepriteFileChunkKind.Palette:
				return this.parsePalette();
			case AsepriteFileChunkKind.UserData:
				return this.parseUserData();
			case AsepriteFileChunkKind.Tags:
				return this.parseTags();
			default:
				console.warn(
					`Skipping unsupported Aseprite chunk: ${
						AsepriteFileChunkKindReverseLookup[type] ||
						`0x${type.toString(16)}`
					}`
				);

				this.readBytes(size - 6);
				return null;
		}
	}

	private parseOldPalette0(): AsepriteFileOldPalette0Chunk {
		/**
		 * WORD        Number of packets
		 * + For each packet
		 *   BYTE      Number of palette entries to skip from the last packet (start from 0)
		 *   BYTE      Number of colors in the packet (0 means 256)
		 *   + For each color in the packet
		 *     BYTE    Red (0-255)
		 *     BYTE    Green (0-255)
		 *     BYTE    Blue (0-255)
		 */

		const packets = this.readSignedInt16();

		const chunk: AsepriteFileOldPalette0Chunk = {
			kind: AsepriteFileChunkKind.OldPalette0,
			packets: [],
		};

		for (let i = 0; i < packets; i++) {
			const offset = this.readByte();
			let colors = this.readByte();

			if (colors === 0) {
				colors = 256 as AsepriteByte;
			}

			const packet: AsepriteFileOldPalette0ChunkPacket = {
				offset,
				colors: [],
			};

			for (let j = 0; j < colors; j++) {
				packet.colors.push([
					this.readByte(),
					this.readByte(),
					this.readByte(),
				]);
			}

			chunk.packets.push(packet);
		}

		return chunk;
	}

	private parseOldPalette1(): AsepriteFileOldPalette1Chunk {
		/**
		 * WORD        Number of packets
		 * + For each packet
		 *   BYTE      Number of palette entries to skip from the last packet (start from 0)
		 *   BYTE      Number of colors in the packet (0 means 256)
		 *   + For each color in the packet
		 *     BYTE    Red (0-63)
		 *     BYTE    Green (0-63)
		 *     BYTE    Blue (0-63)
		 */

		const packets = this.readSignedInt16();

		const chunk: AsepriteFileOldPalette1Chunk = {
			kind: AsepriteFileChunkKind.OldPalette1,
			packets: [],
		};

		for (let i = 0; i < packets; i++) {
			const offset = this.readByte();
			let colors = this.readByte();

			if (colors === 0) {
				colors = 256 as AsepriteByte;
			}

			const packet: AsepriteFileOldPalette0ChunkPacket = {
				offset,
				colors: [],
			};

			for (let j = 0; j < colors; j++) {
				packet.colors.push([
					(this.readByte() * 4) as AsepriteByte,
					(this.readByte() * 4) as AsepriteByte,
					(this.readByte() * 4) as AsepriteByte,
				]);
			}

			chunk.packets.push(packet);
		}

		return chunk;
	}

	private parseLayer(): AsepriteFileLayerChunk {
		/**
		 * WORD        Flags:
		 *               1 = Visible
		 *               2 = Editable
		 *               4 = Lock movement
		 *               8 = Background
		 *               16 = Prefer linked cels
		 *               32 = The layer group should be displayed collapsed
		 *               64 = The layer is a reference layer
		 * WORD        Layer type
		 *               0 = Normal (image) layer
		 *               1 = Group
		 *               2 = Tilemap
		 * WORD        Layer child level (see NOTE.1)
		 * WORD        Default layer width in pixels (ignored)
		 * WORD        Default layer height in pixels (ignored)
		 * WORD        Blend mode (always 0 for layer set)
		 *               Normal         = 0
		 *               Multiply       = 1
		 *               Screen         = 2
		 *               Overlay        = 3
		 *               Darken         = 4
		 *               Lighten        = 5
		 *               Color Dodge    = 6
		 *               Color Burn     = 7
		 *               Hard Light     = 8
		 *               Soft Light     = 9
		 *               Difference     = 10
		 *               Exclusion      = 11
		 *               Hue            = 12
		 *               Saturation     = 13
		 *               Color          = 14
		 *               Luminosity     = 15
		 *               Addition       = 16
		 *               Subtract       = 17
		 *               Divide         = 18
		 * BYTE        Opacity
		 *               Note: valid only if file header flags field has bit 1 set
		 * BYTE[3]     For future (set to zero)
		 * STRING      Layer name
		 * + If layer type = 2
		 *   DWORD     Tileset index
		 */
		const flags = this.readFlags();
		const type = this.readSignedInt16() as AsepriteLayerType;
		const level = this.readSignedInt16();
		const _width = this.readSignedInt16();
		const _height = this.readSignedInt16();
		const blend = this.readSignedInt16() as AsepriteLayerBlendMode;
		const opacity = this.readByte();

		this.readBytes(3);

		const name = this.readString();

		switch (type) {
			case AsepriteLayerType.Normal:
				return {
					kind: AsepriteFileChunkKind.Layer,
					flags,
					level,
					blend,
					opacity,
					name,
					type,
				} as AsepriteFileLayerChunkNormal;
			case AsepriteLayerType.Group:
				return {
					kind: AsepriteFileChunkKind.Layer,
					flags,
					level,
					blend,
					opacity,
					name,
					type,
				} as AsepriteFileLayerChunkGroup;
			case AsepriteLayerType.Tilemap:
				return {
					kind: AsepriteFileChunkKind.Layer,
					flags,
					level,
					blend,
					opacity,
					name,
					type,
					tileset: this.readSignedInt32(),
				} as AsepriteFileLayerChunkTilemap;
		}
	}

	private parseCel(size: number): AsepriteFileCelChunk {
		/**
		 * WORD        Layer index (see NOTE.2)
		 * SHORT       X position
		 * SHORT       Y position
		 * BYTE        Opacity level
		 * WORD        Cel Type
		 *             0 - Raw Image Data (unused, compressed image is preferred)
		 *             1 - Linked Cel
		 *             2 - Compressed Image
		 *             3 - Compressed Tilemap
		 * SHORT       Z-Index (see NOTE.5)
		 *             0 = default layer ordering
		 *             +N = show this cel N layers later
		 *             -N = show this cel N layers back
		 * BYTE[5]     For future (set to zero)
		 * + For cel type = 0 (Raw Image Data)
		 *   WORD      Width in pixels
		 *   WORD      Height in pixels
		 *   PIXEL[]   Raw pixel data: row by row from top to bottom,
		 *             for each scanline read pixels from left to right.
		 * + For cel type = 1 (Linked Cel)
		 *   WORD      Frame position to link with
		 * + For cel type = 2 (Compressed Image)
		 *   WORD      Width in pixels
		 *   WORD      Height in pixels
		 *   PIXEL[]   "Raw Cel" data compressed with ZLIB method (see NOTE.3)
		 * + For cel type = 3 (Compressed Tilemap)
		 *   WORD      Width in number of tiles
		 *   WORD      Height in number of tiles
		 *   WORD      Bits per tile (at the moment it's always 32-bit per tile)
		 *   DWORD     Bitmask for tile ID (e.g. 0x1fffffff for 32-bit tiles)
		 *   DWORD     Bitmask for X flip
		 *   DWORD     Bitmask for Y flip
		 *   DWORD     Bitmask for diagonal flip (swap X/Y axis)
		 *   BYTE[10]  Reserved
		 *   TILE[]    Row by row, from top to bottom tile by tile
		 *             compressed with ZLIB method (see NOTE.3)
		 */
		const layer = this.readSignedInt16();
		const x = this.readUnsignedInt16();
		const y = this.readUnsignedInt16();
		const opacity = this.readByte();
		const type = this.readSignedInt16() as AsepriteCelType;
		const z = this.readUnsignedInt16();

		this.readBytes(5);

		switch (type) {
			case AsepriteCelType.RawImage: {
				const width = this.readSignedInt16();
				const height = this.readSignedInt16();
				const size = width * height;
				const pixels = this.readPixels(size);

				return {
					kind: AsepriteFileChunkKind.Cel,
					layer,
					x,
					y,
					opacity,
					type,
					z,
					width,
					height,
					pixels,
				} as AsepriteFileCelChunkRawImage;
			}
			case AsepriteCelType.LinkedCel: {
				const frame = this.readSignedInt16();

				return {
					kind: AsepriteFileChunkKind.Cel,
					layer,
					x,
					y,
					opacity,
					type,
					z,
					frame,
				} as AsepriteFileCelChunkLinkedCel;
			}
			case AsepriteCelType.CompressedImage: {
				const width = this.readSignedInt16();
				const height = this.readSignedInt16();

				const compressed = this.readBytes(size - 26);
				const decompressed = pako.inflate(compressed);

				const pixels: AsepritePixel[] = [];

				switch (this.header.depth) {
					case AsepriteColorDepth.Rgba:
						for (let i = 0; i < decompressed.length; i += 4) {
							pixels.push(
								decompressed.subarray(
									i,
									i + 4
								) as unknown as AsepriteRgbaPixel
							);
						}
						break;
					case AsepriteColorDepth.Grayscale:
						for (let i = 0; i < decompressed.length; i += 2) {
							pixels.push(
								decompressed.subarray(
									i,
									i + 2
								) as unknown as AsepriteGrayscalePixel
							);
						}
						break;
					case AsepriteColorDepth.Index:
						for (let i = 0; i < decompressed.length; i++) {
							pixels.push(
								decompressed[i] as AsepriteIndexedPixel
							);
						}
						break;
				}

				return {
					kind: AsepriteFileChunkKind.Cel,
					layer,
					x,
					y,
					opacity,
					type,
					z,
					width,
					height,
					pixels,
				} as AsepriteFileCelChunkCompressedImage;
			}
			case AsepriteCelType.CompressedTilemap: {
				return {
					kind: AsepriteFileChunkKind.Cel,
					layer,
					x,
					y,
					opacity,
					type,
					z,
				} as AsepriteFileCelChunkCompressedTilemap;
			}
		}
	}

	private parseColorProfile(): AsepriteFileColorProfileChunk {
		/**
		 * WORD        Type
		 *               0 - no color profile (as in old .aseprite files)
		 *               1 - use sRGB
		 *               2 - use the embedded ICC profile
		 * WORD        Flags
		 *               1 - use special fixed gamma
		 * FIXED       Fixed gamma (1.0 = linear)
		 *             Note: The gamma in sRGB is 2.2 in overall but it doesn't use
		 *             this fixed gamma, because sRGB uses different gamma sections
		 *             (linear and non-linear). If sRGB is specified with a fixed
		 *             gamma = 1.0, it means that this is Linear sRGB.
		 * BYTE[8]     Reserved (set to zero)
		 * + If type = ICC:
		 *   DWORD     ICC profile data length
		 *   BYTE[]    ICC profile data. More info: http://www.color.org/ICC1V42.pdf
		 */
		const type = this.readUnsignedInt16() as AsepriteFileChunkType;
		const flags = this.readFlags();
		const gamma = this.readFixed32();

		this.readBytes(8);

		switch (type) {
			case AsepriteFileChunkType.None:
				return {
					kind: AsepriteFileChunkKind.ColorProfile,
					type,
					flags,
					gamma,
				} as AsepriteFileColorProfileChunkNone;
			case AsepriteFileChunkType.Srgb:
				return {
					kind: AsepriteFileChunkKind.ColorProfile,
					type,
					flags,
					gamma,
				} as AsepriteFileColorProfileChunkSrgb;
			case AsepriteFileChunkType.Embedded: {
				const length = this.readSignedInt32();
				const data = this.readBytes(
					length
				) as unknown as AsepriteByte[];

				return {
					kind: AsepriteFileChunkKind.ColorProfile,
					type,
					flags,
					gamma,
					data,
				} as AsepriteFileColorProfileChunkEmbedded;
			}
		}
	}

	private parsePalette(): AsepriteFilePaletteChunk {
		/**
		 * DWORD       New palette size (total number of entries)
		 * DWORD       First color index to change
		 * DWORD       Last color index to change
		 * BYTE[8]     For future (set to zero)
		 * + For each palette entry in [from,to] range (to-from+1 entries)
		 *   WORD      Entry flags:
		 *               1 = Has name
		 *   BYTE      Red (0-255)
		 *   BYTE      Green (0-255)
		 *   BYTE      Blue (0-255)
		 *   BYTE      Alpha (0-255)
		 *   + If has name bit in entry flags
		 *     STRING  Color name
		 */
		const size = this.readSignedInt32();
		const start = this.readSignedInt32();
		const end = this.readSignedInt32();

		this.readBytes(8);

		const entries: AsepritePaletteEntry[] = [];

		const length = end - start + 1;

		for (let i = 0; i < length; i++) {
			const flags = this.readFlags();
			const red = this.readByte();
			const green = this.readByte();
			const blue = this.readByte();
			const alpha = this.readByte();

			const name = flags & 1 ? this.readString() : undefined;

			entries.push({
				flags,
				red,
				green,
				blue,
				alpha,
				name,
			});
		}

		return {
			kind: AsepriteFileChunkKind.Palette,
			size,
			start,
			end,
			entries,
		};
	}

	private parseUserData(): AsepriteFileUserDataChunk {
		/**
		 * DWORD       Flags
		 *               1 = Has text
		 *               2 = Has color
		 *               4 = Has properties
		 * + If flags have bit 1
		 *   STRING    Text
		 * + If flags have bit 2
		 *   BYTE      Color Red (0-255)
		 *   BYTE      Color Green (0-255)
		 *   BYTE      Color Blue (0-255)
		 *   BYTE      Color Alpha (0-255)
		 * + If flags have bit 4
		 *   DWORD     Size in bytes of all properties maps stored in this chunk
		 *             The size includes the this field and the number of property maps
		 *             (so it will be a value greater or equal to 8 bytes).
		 *   DWORD     Number of properties maps
		 *   + For each properties map:
		 *     DWORD     Properties maps key
		 *               == 0 means user properties
		 *               != 0 means an extension Entry ID (see External Files Chunk))
		 *     DWORD     Number of properties
		 *     + For each property:
		 *       STRING    Name
		 *       WORD      Type
		 *       + If type==0x0001 (bool)
		 *         BYTE    == 0 means FALSE
		 *                 != 0 means TRUE
		 *       + If type==0x0002 (int8)
		 *         BYTE
		 *       + If type==0x0003 (uint8)
		 *         BYTE
		 *       + If type==0x0004 (int16)
		 *         SHORT
		 *       + If type==0x0005 (uint16)
		 *         WORD
		 *       + If type==0x0006 (int32)
		 *         LONG
		 *       + If type==0x0007 (uint32)
		 *         DWORD
		 *       + If type==0x0008 (int64)
		 *         LONG64
		 *       + If type==0x0009 (uint64)
		 *         QWORD
		 *       + If type==0x000A
		 *         FIXED
		 *       + If type==0x000B
		 *         FLOAT
		 *       + If type==0x000C
		 *         DOUBLE
		 *       + If type==0x000D
		 *         STRING
		 *       + If type==0x000E
		 *         POINT
		 *       + If type==0x000F
		 *         SIZE
		 *       + If type==0x0010
		 *         RECT
		 *       + If type==0x0011 (vector)
		 *         DWORD     Number of elements
		 *         WORD      Element's type.
		 *         + If Element's type == 0 (all elements are not of the same type)
		 *           For each element:
		 *             WORD      Element's type
		 *             BYTE[]    Element's value. Structure depends on the
		 *                       element's type
		 *         + Else (all elements are of the same type)
		 *           For each element:
		 *             BYTE[]    Element's value. Structure depends on the
		 *                       element's type
		 *       + If type==0x0012 (nested properties map)
		 *         DWORD     Number of properties
		 *         BYTE[]    Nested properties data
		 *                   Structure is the same as indicated in this loop
		 *       + If type==0x0013
		 *         UUID
		 */
		const flags = this.readBigFlags();

		const chunk: AsepriteFileUserDataChunk = {
			kind: AsepriteFileChunkKind.UserData,
			flags,
		} as AsepriteFileUserDataChunk;

		if (flags & 1) {
			(chunk as AsepriteFileUserDataChunkText).text = this.readString();
		}

		if (flags & 2) {
			(chunk as AsepriteFileUserDataChunkColor).color = {
				red: this.readByte(),
				green: this.readByte(),
				blue: this.readByte(),
				alpha: this.readByte(),
			};
		}

		if (flags & 4) {
			(chunk as AsepriteFileUserDataChunkMap).data =
				this.parseUserDataMap();
		}

		return chunk;
	}

	parseUserDataMap(): AsepriteUserDataMap {
		const _size = this.readSignedInt32();
		const count = this.readSignedInt32();

		const map: AsepriteUserDataMap = {};

		for (let i = 0; i < count; i++) {
			const key = this.readString();
			const value = this.parseUserDataValue();

			map[key] = value;
		}

		return map;
	}

	parseUserDataVector(): AsepriteUserDataValue[] {
		const length = this.readSignedInt32();
		const type = this.readSignedInt16();

		const vector: AsepriteUserDataValue[] = [];

		if (type === 0) {
			// Elements have different types.
			for (let i = 0; i < length; i++) {
				vector.push(this.parseUserDataValue());
			}
		} else {
			for (let i = 0; i < length; i++) {
				vector.push(this.parseUserDataValue(type));
			}
		}

		return vector;
	}

	parseUserDataValue(type = this.readSignedInt16()): AsepriteUserDataValue {
		switch (type) {
			case AsepriteUserDataType.Boolean:
				return this.readByte() !== 0;
			case AsepriteUserDataType.SignedInt8:
				return this.readByte();
			case AsepriteUserDataType.UnsignedInt8:
				return this.readByte();
			case AsepriteUserDataType.SignedInt16:
				return this.readSignedInt16();
			case AsepriteUserDataType.UnsignedInt16:
				return this.readUnsignedInt16();
			case AsepriteUserDataType.SignedInt32:
				return this.readSignedInt32();
			case AsepriteUserDataType.UnsignedInt32:
				return this.readUnsignedInt32();
			case AsepriteUserDataType.SignedInt64:
				return this.readSignedInt64();
			case AsepriteUserDataType.UnsignedInt64:
				return this.readUnsignedInt64();
			case AsepriteUserDataType.Fixed32:
				return this.readFixed32();
			case AsepriteUserDataType.Float32:
				return this.readFloat32();
			case AsepriteUserDataType.Float64:
				return this.readFloat64();
			case AsepriteUserDataType.String:
				return this.readString();
			case AsepriteUserDataType.Point:
				return this.readPoint();
			case AsepriteUserDataType.Size:
				return this.readSize();
			case AsepriteUserDataType.Rect:
				return this.readRect();
			case AsepriteUserDataType.Vector:
				return this.parseUserDataVector();
			case AsepriteUserDataType.Map:
				return this.parseUserDataMap();
			case AsepriteUserDataType.Uuid:
				return this.readUuid();
		}

		throw new Error(`Unsupported user data type: 0x${type.toString(16)}`);
	}

	parseTags(): AsepriteFileTagsChunk {
		/**
		 * WORD        Number of tags
		 * BYTE[8]     For future (set to zero)
		 * + For each tag
		 *   WORD      From frame
		 *   WORD      To frame
		 *   BYTE      Loop animation direction
		 *               0 = Forward
		 *               1 = Reverse
		 *               2 = Ping-pong
		 *               3 = Ping-pong Reverse
		 *   WORD      Repeat N times. Play this animation section N times:
		 *               0 = Doesn't specify (plays infinite in UI, once on export,
		 *                   for ping-pong it plays once in each direction)
		 *               1 = Plays once (for ping-pong, it plays just in one direction)
		 *               2 = Plays twice (for ping-pong, it plays once in one direction,
		 *                   and once in reverse)
		 *               n = Plays N times
		 *   BYTE[6]   For future (set to zero)
		 *   BYTE[3]   RGB values of the tag color
		 *               Deprecated, used only for backward compatibility with Aseprite v1.2.x
		 *               The color of the tag is the one in the user data field following
		 *               the tags chunk
		 *   BYTE      Extra byte (zero)
		 *   STRING    Tag name
		 */
		const count = this.readUnsignedInt16();

		this.readBytes(8);

		const tags: AsepriteFileTagsChunk["tags"] = [];

		for (let i = 0; i < count; i++) {
			const from = this.readSignedInt16();
			const to = this.readSignedInt16();
			const direction = this.readByte() as AsepriteTagAnimationDirection;
			const repeat = this.readSignedInt16();

			this.readBytes(6); // Future

			const r = this.readByte();
			const g = this.readByte();
			const b = this.readByte();

			this.readByte(); //

			const name = this.readString();

			tags.push({
				from,
				to,
				direction,
				repeat,
				color: [r, g, b, 255 as AsepriteByte],
				name,
			});
		}

		const cursor = this.cursor;

		// Tags may be followed by user data for each tag.
		for (let i = 0; i < count; i++) {
			const tag = tags[i];

			const _size = this.readSignedInt32();
			const type = this.readSignedInt16();

			if (type === AsepriteFileChunkKind.UserData) {
				const userdata = this.parseUserData();

				if (userdata.flags & 2) {
					const color = (userdata as AsepriteFileUserDataChunkColor)
						.color;

					tag.color = [
						color.red,
						color.green,
						color.blue,
						color.alpha,
					];
				}
			} else {
				break;
			}
		}

		this.cursor = cursor;

		return {
			kind: AsepriteFileChunkKind.Tags,
			tags,
		};
	}

	// Helpers for consuming data from the file.
	// ================================================

	/** Read a single byte from the file. */
	private readByte(): AsepriteByte {
		const byte = this.data.getUint8(this.cursor);
		this.cursor += 1;
		return byte as AsepriteByte;
	}

	/** Read a number of bytes from the file. */
	private readBytes(length: number): Uint8Array {
		const bytes = new Uint8Array(this.file, this.cursor, length);
		this.cursor += length;
		return bytes;
	}

	private readFlags(): AsepriteFlags {
		return this.readUnsignedInt16() as unknown as AsepriteFlags;
	}

	private readBigFlags(): AsepriteBigFlags {
		return this.readUnsignedInt32() as unknown as AsepriteBigFlags;
	}

	/** Read a signed 16-bit integer from the file. */
	private readSignedInt16(): AsepriteSignedInt16 {
		const int16 = this.data.getInt16(this.cursor, true);
		this.cursor += 2;
		return int16 as AsepriteSignedInt16;
	}

	/** Read an unsigned 16-bit integer from the file. */
	private readUnsignedInt16(): AsepriteUnsignedInt16 {
		const uint16 = this.data.getUint16(this.cursor, true);
		this.cursor += 2;
		return uint16 as AsepriteUnsignedInt16;
	}

	/** Read a signed 32-bit integer from the file. */
	private readSignedInt32(): AsepriteSignedInt32 {
		const int32 = this.data.getInt32(this.cursor, true);
		this.cursor += 4;
		return int32 as AsepriteSignedInt32;
	}

	/** Read an unsigned 32-bit integer from the file. */
	private readUnsignedInt32(): AsepriteUnsignedInt32 {
		const uint32 = this.data.getUint32(this.cursor, true);
		this.cursor += 4;
		return uint32 as AsepriteUnsignedInt32;
	}

	/** Read a signed 64-bit integer from the file. */
	private readSignedInt64(): AsepriteSignedInt64 {
		const int64 = this.data.getBigInt64(this.cursor, true);
		this.cursor += 8;
		return int64 as AsepriteSignedInt64;
	}

	/** Read an unsigned 64-bit integer from the file. */
	private readUnsignedInt64(): AsepriteUnsignedInt64 {
		const uint64 = this.data.getBigUint64(this.cursor, true);
		this.cursor += 8;
		return uint64 as AsepriteUnsignedInt64;
	}

	/** Read a 32-bit floating point number from the file. */
	private readFloat32(): AsepriteFloat32 {
		const float32 = this.data.getFloat32(this.cursor, true);
		this.cursor += 4;
		return float32 as AsepriteFloat32;
	}

	/** Read a 64-bit floating point number from the file. */
	private readFloat64(): AsepriteFloat64 {
		const float64 = this.data.getFloat64(this.cursor, true);
		this.cursor += 8;
		return float64 as AsepriteFloat64;
	}

	/** Read a 32-bit fixed point number from the file. */
	private readFixed32(): AsepriteFixed32 {
		const int32 = this.data.getInt32(this.cursor, true);
		this.cursor += 4;
		return (int32 / 65536) as AsepriteFixed32;
	}

	/** Read a string from the file. */
	private readString(): string {
		const length = this.readSignedInt16();
		const string = new TextDecoder().decode(this.readBytes(length));
		return string;
	}

	/** Read a UUID from the file. */
	private readUuid(): AsepriteUuid {
		const uuid = new TextDecoder().decode(this.readBytes(16));
		return uuid as AsepriteUuid;
	}

	/** Read a point from the file. */
	private readPoint(): AsepritePoint {
		const x = this.readUnsignedInt32();
		const y = this.readUnsignedInt32();
		return { x, y };
	}

	/** Read a size from the file. */
	private readSize(): AsepriteSize {
		const width = this.readUnsignedInt32();
		const height = this.readUnsignedInt32();
		return { width, height };
	}

	/** Read a rect from the file. */
	private readRect(): AsepriteRect {
		const point = this.readPoint();
		const size = this.readSize();
		return { point, size };
	}

	/** Read a pixel from the file. Note that the header must have already been parsed to know the color depth. */
	private readPixel(): AsepritePixel {
		switch (this.header.depth) {
			case AsepriteColorDepth.Rgba:
				return this.readBytes(4) as unknown as AsepriteRgbaPixel;
			case AsepriteColorDepth.Grayscale:
				return this.readBytes(2) as unknown as AsepriteGrayscalePixel;
			case AsepriteColorDepth.Index:
				return this.readByte() as AsepriteIndexedPixel;
		}
	}

	/** Read a number of pixels from the file. */
	private readPixels(length: number): AsepritePixel[] {
		const pixels: AsepritePixel[] = [];
		for (let i = 0; i < length; i++) {
			pixels.push(this.readPixel());
		}
		return pixels;
	}
}
