import { appConfig } from "./config";

export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

interface PdfTextItem {
    str?: string;
    transform?: number[];
    width?: number;
    hasEOL?: boolean;
}

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    isLoading = true;
    // @ts-expect-error - pdfjs-dist/build/pdf.mjs is not a module
    loadPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
        lib.GlobalWorkerOptions.workerSrc = appConfig.pdf.workerSrc;
        pdfjsLib = lib;
        isLoading = false;
        return lib;
    });

    return loadPromise;
}

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        const lib = await loadPdfJs();

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: appConfig.pdf.renderScale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (context) {
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = "high";
        }

        await page.render({ canvasContext: context!, viewport }).promise;

        return new Promise((resolve) => {
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        // Create a File from the blob with the same name as the pdf
                        const originalName = file.name.replace(/\.pdf$/i, "");
                        const imageFile = new File(
                            [blob],
                            `${originalName}.${appConfig.pdf.imageExtension}`,
                            { type: appConfig.pdf.imageMimeType }
                        );

                        resolve({
                            imageUrl: URL.createObjectURL(blob),
                            file: imageFile,
                        });
                    } else {
                        resolve({
                            imageUrl: "",
                            file: null,
                            error: "Failed to create image blob",
                        });
                    }
                },
                appConfig.pdf.imageMimeType,
                appConfig.pdf.imageQuality
            );
        });
    } catch (err) {
        return {
            imageUrl: "",
            file: null,
            error: `Failed to convert PDF: ${err}`,
        };
    }
}

export async function extractPdfText(file: File): Promise<string> {
    const lib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
    const pages: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        const text = extractPageText(content.items as PdfTextItem[]);

        if (text) pages.push(text);
    }

    return pages.join("\n\n").trim();
}

function extractPageText(items: PdfTextItem[]): string {
    const positionedItems = items
        .map((item) => ({
            text: (item.str || "").replace(/\s+/g, " ").trim(),
            x: item.transform?.[4] ?? 0,
            y: item.transform?.[5] ?? 0,
            width: item.width ?? 0,
            hasEOL: item.hasEOL ?? false,
        }))
        .filter((item) => item.text);

    if (positionedItems.length === 0) return "";

    const lineTolerance = 2.5;
    const lines: { y: number; items: typeof positionedItems }[] = [];

    for (const item of positionedItems.sort((a, b) => b.y - a.y || a.x - b.x)) {
        const line = lines.find((candidate) => Math.abs(candidate.y - item.y) <= lineTolerance);

        if (line) {
            line.items.push(item);
            line.y = (line.y + item.y) / 2;
        } else {
            lines.push({ y: item.y, items: [item] });
        }
    }

    return lines
        .sort((a, b) => b.y - a.y)
        .map((line) => {
            const lineItems = line.items.sort((a, b) => a.x - b.x);
            return lineItems.reduce((text, item, index) => {
                if (index === 0) return item.text;

                const previous = lineItems[index - 1];
                const previousEnd = previous.x + previous.width;
                const gap = item.x - previousEnd;
                const separator = previous.hasEOL || gap > 3 ? " " : "";

                return `${text}${separator}${item.text}`;
            }, "");
        })
        .join("\n")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}
