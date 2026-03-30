import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
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
                    // pdf-parse v1.1.1: simple function(buffer) => Promise<{text}>
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
