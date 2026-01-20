
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCommanderReport = async (score: number, highScore: number): Promise<string> => {
  try {
    const prompt = `Você é um General de Divisão Blindada brasileiro durão em uma guerra de tanques futuristas.
    O jogador terminou a batalha.
    Pontuação: ${score}
    Recorde: ${highScore}
    Escreva um relatório militar seco e impactante (máx 20 palavras) em PT-BR.
    Use termos: "Blindagem", "Lagartas", "Setor", "Fogo Amigo", "Engajamento", "Perfurante".
    Se recorde: Respeito militar. Se mal: Sarcasmo pesado.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "Relatório interceptado. Volte ao combate!";
  } catch (error) {
    return "As comunicações falharam! Continue atirando, soldado!";
  }
};

export const getBugReportResponse = async (bugDescription: string): Promise<string> => {
  try {
    const prompt = `Você é o Engenheiro Chefe de Manutenção do exército de tanques. 
    Um soldado reportou o seguinte problema técnico: "${bugDescription}"
    Responda em PT-BR como se estivesse anotando o problema em um dossiê técnico. 
    Seja breve, militar e assegure que os mecânicos vão trabalhar nisso. Use termos como "Chassi", "Transmissão", "Software de Mira", "Anomalia Detectada". (máx 25 palavras)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text?.trim() || "Anomalia registrada. Nossas equipes de engenharia estão a caminho.";
  } catch (error) {
    return "Relatório recebido via canais de emergência. Manutenção agendada.";
  }
};
