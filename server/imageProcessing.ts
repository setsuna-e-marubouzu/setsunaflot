import sharp from "sharp";

/**
 * Add watermark to image to prevent unauthorized redistribution
 * Adds a semi-transparent overlay with text
 */
export async function addWatermark(
  imageBuffer: Buffer,
  watermarkText: string = "©setsuna_float_FAN"
): Promise<Buffer> {
  try {
    // Create SVG watermark
    const watermarkSvg = Buffer.from(`
      <svg width="1000" height="1000" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow">
            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
        <text 
          x="500" 
          y="500" 
          font-size="80" 
          font-family="Arial, sans-serif"
          text-anchor="middle"
          fill="rgba(255, 255, 255, 0.3)"
          filter="url(#shadow)"
          transform="rotate(-45 500 500)"
        >
          ${watermarkText}
        </text>
      </svg>
    `);

    // Composite watermark onto image
    const watermarked = await sharp(imageBuffer)
      .composite([
        {
          input: watermarkSvg,
          blend: "overlay",
        },
      ])
      .toBuffer();

    return watermarked;
  } catch (error) {
    console.error("Watermark error:", error);
    // Return original if watermarking fails
    return imageBuffer;
  }
}

/**
 * Resize image to prevent high-resolution downloads
 * Limits to 2000x2000px for web viewing
 */
export async function resizeImageForWeb(
  imageBuffer: Buffer,
  maxWidth: number = 2000,
  maxHeight: number = 2000
): Promise<Buffer> {
  try {
    return await sharp(imageBuffer)
      .resize(maxWidth, maxHeight, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();
  } catch (error) {
    console.error("Resize error:", error);
    return imageBuffer;
  }
}

/**
 * Create thumbnail for gallery preview
 */
export async function createThumbnail(
  imageBuffer: Buffer,
  width: number = 400,
  height: number = 400
): Promise<Buffer> {
  try {
    return await sharp(imageBuffer)
      .resize(width, height, {
        fit: "cover",
        position: "center",
      })
      .toBuffer();
  } catch (error) {
    console.error("Thumbnail error:", error);
    return imageBuffer;
  }
}

/**
 * Process image for subscriber-only gallery
 * Adds watermark and resizes for web
 */
export async function processGalleryImage(imageBuffer: Buffer): Promise<Buffer> {
  let processed = imageBuffer;

  // Add watermark
  processed = await addWatermark(processed);

  // Resize for web
  processed = await resizeImageForWeb(processed);

  return processed;
}

/**
 * Process image for sale
 * Adds watermark and resizes for web
 */
export async function processSaleImage(imageBuffer: Buffer): Promise<Buffer> {
  let processed = imageBuffer;

  // Add watermark
  processed = await addWatermark(processed);

  // Resize for web
  processed = await resizeImageForWeb(processed);

  return processed;
}
