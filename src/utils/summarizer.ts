import OpenAI from 'openai';

type SummarizeResult = {
  summary: string;
  topics: string[];
  coverImage?: string;
};

export async function summarizer(chunks: string[], qtTopics: number = 5) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  let summaries: string[] = [];

  for (const chunk of chunks) {
    const chatCompletion: OpenAI.Chat.ChatCompletion =
      await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Isso é uma transcrição de um video do youtube.',
          },
          {
            role: 'user',
            content: `Se estiver em outro idioma traduza para pt-BR e resuma detalhadamente isso para um aluno do segundo grau: ${chunk}`,
          },
        ],
      });

    summaries = [
      ...summaries,
      (chatCompletion.choices[0]?.message?.content as string) || '',
    ];
  }

  const consolidatedSummary = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'Isso é uma transcrição de um video do youtube.',
      },
      {
        role: 'user',
        content: `Consolide o resumo abaixo no formato JSON usando a chave summary e consolide em ${qtTopics} principais tópicos mais importantes do vídeo na chave topics: ${summaries.join(
          '\n'
        )}`,
      },
    ],
  });

  const summaryConsolidated = JSON.parse(
    (consolidatedSummary.choices[0]?.message?.content as string) || '{}'
  ) as SummarizeResult;

  return summaryConsolidated;
}
