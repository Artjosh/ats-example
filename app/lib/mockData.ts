import { CandidateResult, FileItem, AnalysisStats } from "./types";

export const MOCK_CANDIDATES: CandidateResult[] = [
    {
        id: "mock-1",
        fileName: "curriculo_ana_silva.pdf",
        name: "Ana Clara Martins",
        score: 94,
        summary: "Especialista em React e Node.js com 6 anos de experiência em arquiteturas escaláveis. Forte orientação a produtos e liderança técnica.",
        strengths: ["React.js", "Python", "AWS"],
        gaps: ["Inglês Intermediário"],
        recommendation: "AVANÇAR",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC8zBATzzsiOgJbGcjfbIv7B-w-MEQ51t3P5C87CHxVdjQPI62408WB2uYVeOmmrEFLEVzlMNkLXEUADTP0gHsNDDE_b0CyrKir88MuSW7Uct7anAZEBU6oeLsIzuYFI9FznZ241D79GqiNEKVlosDz_a5uUhF5dbT0Qk_9zx0TzZ27_FsN5j-mBu4nfYIFpAM45xUxoxXAXNrYVFKMNCKGZyO6v4TaESVzXSH_KUmdX3ZZLZROPufL45XAy1s1DVL3zlCMRSjHkQ2_",
    },
    {
        id: "mock-2",
        fileName: "jose_santos_dev.docx",
        name: "Roberto Figueira",
        score: 72,
        summary: "Desenvolvedor Fullstack com foco em Backend (Java/Kotlin). Possui experiência acadêmica sólida, mas pouca vivência em startups.",
        strengths: ["Java", "Spring Boot"],
        gaps: ["Sem React"],
        recommendation: "ANALISAR",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDk0lHmqX1mjDcjuTkaq-a-IDBDznX2bVBIqw48fSyVHK5ZwnhRdNPW_eUchfBpxa_cqJll86bLxR68C_YkLaGCGBqhjyR_oBlOTA35WsFSPETzB1zABJEOAgGzzvFBwT4d7ySE3LB5MDJJtSgTAPpZeDa_qamSxF-aVjl8jYaTUJZRaRJT99egGnW98PNsS8NAbU7bO5CU6Zte41PZbHLwWCxK4BpfGPp-nF4YiZEthyvPJW5-WjmLPk5BE_WM03HwaIDLfuIi12ck",
    },
    {
        id: "mock-3",
        fileName: "cv_juliana_mendes.pdf",
        name: "Juliana Mendes",
        score: 88,
        summary: "Engenheira de Dados com domínio em ETL e Big Data. Experiência em empresas globais e fluência total em inglês.",
        strengths: ["Python", "SQL", "English C2"],
        gaps: [],
        recommendation: "AVANÇAR",
        imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCyd_W9p5pdY3FPhmRosMcIPeohs-k6SMKUUZHYFqrzabfZuNhOMJ2ghdMX_XReY8dUX5cAff92iMhWlRGB1OFEZDLKcBS1TDIfMf660XPErBSuY5jVxDM8uA7gZ2vIAHTTs8Or_MlzgB5H99vKhPttwrdq9ZDXVoTh2anewyOEU0wr7YF2tVwMHoomgTmrqcDXrPi9Zp8AWPbsrbjDNRAz0sr0QuUNKLE5N9xEXrGOLxWjTruEoeWzwLPD9Pg5XBtA2JPPsKLm42oq",
    },
    {
        id: "mock-4",
        fileName: "portfolio_carla_designer.pdf",
        name: "Candidato Oculto",
        score: 34,
        summary: "Perfil com competências muito distantes da vaga de Software Engineer. Foco atual em Design Gráfico e Marketing.",
        strengths: [],
        gaps: ["Sem Coding Exp", "Outro Setor"],
        recommendation: "DESCARTAR",
    },
];

export const MOCK_FILES: Omit<FileItem, "file">[] = [
    { id: "mf-1", name: "curriculo_ana_silva.pdf", size: 1258291, status: "extracted" },
    { id: "mf-2", name: "jose_santos_dev.docx", size: 865280, status: "extracting" },
    { id: "mf-3", name: "cv_marcos_oliveira_final.pdf", size: 2202009, status: "pending" },
    { id: "mf-4", name: "portfolio_carla_designer.pdf", size: 4718592, status: "pending" },
];

export const MOCK_STATS: AnalysisStats = {
    total: 12,
    qualified: 4,
    analyze: 5,
    discard: 3,
    timeSeconds: 47,
    averageScore: 72,
};

export const MOCK_JOB_REQUIREMENTS = `Vaga: Software Engineer Pleno

Requisitos:
- 3+ anos de experiência com React.js ou frameworks frontend modernos
- Experiência com Node.js, Python ou Go no backend
- Conhecimento em AWS ou cloud computing
- Git e CI/CD pipelines
- Inglês técnico (leitura de docs)

Diferenciais:
- Experiência com TypeScript
- Conhecimento em microsserviços e containers (Docker/K8s)
- Experiência com banco de dados NoSQL
- Inglês fluente

Responsabilidades:
- Desenvolver e manter aplicações web escaláveis
- Participar de code reviews e decisões de arquitetura
- Colaborar com times de produto e design
- Garantir qualidade do código com testes automatizados`;
