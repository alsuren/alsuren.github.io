#!/usr/bin/env -S npx --package=puppeteer -- node --experimental-strip-types

import puppeteer from 'puppeteer';
import path from 'path';

/** 
 * For some reason, the puppeteer step of https://github.com/yzane/vscode-markdown-pdf
 * keeps crashing. I new that something like this would happen eventually, but other md-to-pdf
 * tools were giving me output that look like crap, so I stuck with the vscode extension for a bit.
 * This script is something that ChatGPT threw together because I still need to apply for jobs, and
 * I don't want to put in a bunch of effort right now.
 * 
 * Steps to use: 
 * * run 'Markdown PDF: Export (PDF)' vscode command
 * * wait for cv_tmp.html to be generated
 * * open it in an editor so you can revert it when it goes away
 * * `scripts/cv2pdf.ts cv_tmp.html cv.pdf && cp cv.pdf DavidLaban.pdf`
 * 
 * FIXME: make this script also do the markdown to html conversion, and add it to Makefile, so that
 * I can stop using the vscode extension.
 */
async function convertToPDF(urlOrPath: string, outputPath: string) {
    // Launch browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Check if input is a URL or local file
    if (urlOrPath.startsWith('http')) {
        await page.goto(urlOrPath, { waitUntil: 'networkidle2' });
    } else {
        const filePath = `file://${path.resolve(urlOrPath)}`;
        await page.goto(filePath, { waitUntil: 'networkidle2' });
    }

    // Generate PDF
    await page.pdf({
        path: outputPath,
        format: 'A4',
        // defaults from https://github.com/yzane/vscode-markdown-pdf but then I tuned top margin
        // down because it was overflowing in a different place from my public CV.
        margin: {
            top: '1cm',
            right: '1cm',
            bottom: '1cm',
            left: '1cm',
        }
    });

    console.log(`✅ PDF saved as ${outputPath}`);

    // Close browser
    await browser.close();
}

// Get arguments from CLI
const args = process.argv.slice(2);
if (args.length !== 2) {
    console.error('Usage: npx ts-node htmlToPdf.ts <URL or HTML file> <output.pdf>');
    process.exit(1);
}

const [input, output] = args;

// Run the conversion
convertToPDF(input, output).catch(error => {
    console.error('❌ Error generating PDF:', error);
    process.exit(1);
});
