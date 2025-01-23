const sharp = require('sharp');
const fs = require('fs').promises;

async function convertSvgFileToJpeg(inputPath, outputPath) {
    try {
        // Read the SVG file
        const svgContent = await fs.readFile(inputPath);

        // Convert to JPEG
        await sharp(svgContent, {
            // Set density when loading SVG for higher resolution
            density: 600
        })
        .jpeg({
            quality: 100,
            chromaSubsampling: '4:4:4'
        })
        .resize({
            height: 5000,
            withoutEnlargement: true,
            kernel: sharp.kernel.lanczos3
        })
        .withMetadata({
            // Set output DPI
            density: 600
        })
        // Ensure high quality rendering
        .png({ quality: 100 })
        .jpeg({ 
            quality: 100,
            chromaSubsampling: '4:4:4'
        })
        .toFile(outputPath);

        const stats = await fs.stat(outputPath);
        const fileSizeInMB = stats.size / (1024 * 1024);

        console.log(`✓ Successfully converted SVG to JPEG`);
        console.log(`✓ Input file: ${inputPath}`);
        console.log(`✓ Output file: ${outputPath}`);
        console.log(`✓ File size: ${fileSizeInMB.toFixed(2)} MB`);

        if (fileSizeInMB > 5) {
            console.warn('⚠️  Warning: File size exceeds 5MB Kindle limit');
        }

    } catch (error) {
        console.error('Error converting SVG:', error);
    }
}

// Example usage
convertSvgFileToJpeg('input.svg', 'book-cover.jpg');