import { NextRequest, NextResponse } from "next/server";

// Pre-create the dummy file that pdf-parse requires on import
// This runs at module load time (before any request)
async function ensurePdfParseTestFile() {
    try {
        const fs = await import("fs");
        const path = await import("path");
        const testDir = path.join(process.cwd(), "test", "data");
        const testFile = path.join(testDir, "05-versions-space.pdf");
        if (!fs.existsSync(testFile)) {
            fs.mkdirSync(testDir, { recursive: true });
            // Write minimal valid PDF
            fs.writeFileSync(testFile, "%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 3 3]>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF\n");
        }
    } catch {
        // Swallow - best effort
    }
}

// Run once at module load
const _init = ensurePdfParseTestFile();

export async function POST(request: NextRequest) {
    try {
        // Ensure test file is ready before first use
        await _init;

        const formData = await request.formData();
        const files = formData.getAll("files") as File[];

        if (!files.length) {
            return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
        }

        const results = [];

        for (const file of files) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            let text = "";
            let error = "";

            try {
                if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
                    const pdfParse = (await import("pdf-parse")).default;
                    const data = await pdfParse(buffer);
                    text = data.text || "";
                } else if (
                    file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                    file.name.toLowerCase().endsWith(".docx")
                ) {
                    const mammoth = await import("mammoth");
                    const result = await mammoth.extractRawText({ buffer });
                    text = result.value;
                } else {
                    error = `Formato não suportado: ${file.type || file.name}. Use PDF ou DOCX.`;
                }
            } catch (e) {
                error = `Falha na extração: ${e instanceof Error ? e.message : "Erro desconhecido"}`;
            }

            // Normalize text
            if (text) {
                text = text.replace(/\s+/g, " ").trim();
            }

            results.push({
                name: file.name,
                size: file.size,
                text,
                error,
                status: text ? "extracted" : "error",
            });
        }

        return NextResponse.json({ files: results });
    } catch (e) {
        return NextResponse.json(
            { error: `Erro do servidor: ${e instanceof Error ? e.message : "Desconhecido"}` },
            { status: 500 }
        );
    }
}
