import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key loaded:', apiKey ? `${apiKey.substring(0, 8)}...` : 'MISSING');

const ai = new GoogleGenAI({ apiKey });

try {
    console.log('\n🧪 Test 1: Simple call with gemini-2.5-flash...');
    const r1 = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: 'Say "hello" in one word.' }] }],
        config: { temperature: 0.1 },
    });
    console.log('✅ gemini-2.5-flash works:', r1.text.trim());
} catch (err) {
    console.error('❌ gemini-2.5-flash FAILED:', err.message);
    console.error('   Status:', err.status || 'unknown');
    console.error('   Full error:', JSON.stringify(err, null, 2).substring(0, 500));
}

try {
    console.log('\n🧪 Test 2: Call with googleSearch tool (like enablementStrategy)...');
    const r2 = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: 'What is Google?' }] }],
        config: {
            temperature: 0.5,
            tools: [{ googleSearch: {} }],
        },
    });
    console.log('✅ googleSearch works:', r2.text.trim().substring(0, 100));
} catch (err) {
    console.error('❌ googleSearch FAILED:', err.message);
    console.error('   Status:', err.status || 'unknown');
}

try {
    console.log('\n🧪 Test 3: Longer generation (like preview report)...');
    const r3 = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: 'Write a 3-paragraph business analysis for a digital marketing agency called Apex Digital Solutions.' }] }],
        config: {
            systemInstruction: 'You are a business strategy consultant. Produce a structured analysis.',
            temperature: 0.6,
            maxOutputTokens: 4096,
        },
    });
    console.log('✅ Longer generation works, length:', r3.text.trim().length, 'chars');
} catch (err) {
    console.error('❌ Longer generation FAILED:', err.message);
    console.error('   Status:', err.status || 'unknown');
}

console.log('\n🏁 All tests complete.');
