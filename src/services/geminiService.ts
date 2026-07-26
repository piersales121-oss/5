export async function generateAIResponse(params: {
  prompt: string;
  systemPrompt?: string;
  imageBase64?: string;
  mimeType?: string;
  isImageOutput?: boolean;
}): Promise<{ text: string; imageUrl?: string }> {
  try {
    const res = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: params.prompt,
        systemInstruction: params.systemPrompt,
        imageBase64: params.imageBase64,
        mimeType: params.mimeType,
        isImageOutput: params.isImageOutput,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'AI সার্ভারে ত্রুটি ঘটেছে');
    }

    const data = await res.json();
    return {
      text: data.text || '',
      imageUrl: data.imageUrl,
    };
  } catch (error: any) {
    console.error('Gemini API call failed:', error);
    return {
      text: `❌ ত্রুটি: ${error.message || 'AI উত্তর পেতে সমস্যা হচ্ছে। ইন্টারনেট বা API কি চেক করুন।'}`,
    };
  }
}

// Text to Speech Helper using Browser SpeechSynthesis
export function speakText(text: string, lang = 'bn-BD') {
  if (!('speechSynthesis' in window)) {
    alert('আপনার ব্রাউজারে Text-to-Speech সমর্থন করে না।');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.replace(/[*#`_]/g, ''));
  utterance.lang = lang;
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
