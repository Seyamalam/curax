import { type NextRequest, NextResponse } from 'next/server';

// Remove the following line if you want to use Node.js runtime for better env var support
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await req.formData();
    const audioFile = formData.get('audio');
    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 },
      );
    }

    // Prepare form data for Groq API
    const groqForm = new FormData();
    groqForm.append('file', audioFile, 'audio.webm');
    groqForm.append('model', 'distil-whisper-large-v3-en');
    groqForm.append('language', 'en');
    groqForm.append('response_format', 'json');
    groqForm.append('temperature', '0');

    // Call Groq API
    const groqRes = await fetch(
      'https://api.groq.com/openai/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: groqForm,
      },
    );

    if (!groqRes.ok) {
      const err = await groqRes.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }

    const data = await groqRes.json();
    return NextResponse.json({ text: data.text });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Transcription failed' },
      { status: 500 },
    );
  }
}
