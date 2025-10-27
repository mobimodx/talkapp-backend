"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStreamingConnection = handleStreamingConnection;
const gpt_service_1 = __importDefault(require("../services/gpt.service"));
const speech_service_1 = __importDefault(require("../services/speech.service"));
const tts_service_1 = __importDefault(require("../services/tts.service"));
const logger_1 = __importDefault(require("../utils/logger"));
function handleStreamingConnection(ws) {
    let googleStream = null;
    let isStreamActive = false;
    const sessionId = Math.random().toString(36).substring(7);
    let silenceTimer = null;
    const SILENCE_THRESHOLD_MS = 2000;
    const audioBuffer = [];
    const MAX_BUFFER_SIZE = 200;
    let bufferWarningMsgSent = false;
    let targetLang = null;
    logger_1.default.info(`Streaming WebSocket connected | sessionId: ${sessionId}`);
    const clearSilenceTimer = () => {
        if (silenceTimer) {
            clearTimeout(silenceTimer);
            silenceTimer = null;
        }
    };
    const resetSilenceTimer = () => {
        clearSilenceTimer();
        silenceTimer = setTimeout(() => {
            if (isStreamActive) {
                logger_1.default.debug(`Silence detected | sessionId: ${sessionId}`);
                ws.send(JSON.stringify({ type: 'silence' }));
            }
        }, SILENCE_THRESHOLD_MS);
    };
    const connectedMsg = { type: 'connected' };
    ws.send(JSON.stringify(connectedMsg));
    ws.on('message', async (data, isBinary) => {
        try {
            if (isBinary) {
                if (!isStreamActive || !googleStream) {
                    if (audioBuffer.length < MAX_BUFFER_SIZE) {
                        audioBuffer.push(data);
                        if (audioBuffer.length === 1) {
                            logger_1.default.debug(`Buffering early audio chunks | sessionId: ${sessionId}`);
                        }
                        if (audioBuffer.length === 10 && !bufferWarningMsgSent) {
                            bufferWarningMsgSent = true;
                            logger_1.default.info(`Auto-starting session with auto language detection | sessionId: ${sessionId}`);
                            const { stream, configRequest } = speech_service_1.default.createStreamingRecognition(undefined, undefined, true);
                            googleStream = stream;
                            isStreamActive = true;
                            googleStream.write(configRequest);
                            logger_1.default.info(`Flushing ${audioBuffer.length} buffered audio chunks | sessionId: ${sessionId}`);
                            audioBuffer.forEach(chunk => {
                                googleStream.write({ audio: chunk });
                            });
                            audioBuffer.length = 0;
                            googleStream.on('data', async (response) => {
                                if (!response.results || response.results.length === 0)
                                    return;
                                const result = response.results[0];
                                const alternative = result.alternatives?.[0];
                                if (!alternative)
                                    return;
                                resetSilenceTimer();
                                const transcript = alternative.transcript;
                                const isFinal = result.isFinal;
                                if (!isFinal) {
                                    logger_1.default.debug(`Interim transcript | sessionId: ${sessionId}`, {
                                        transcript: transcript.substring(0, 50),
                                        stability: result.stability,
                                        languageCode: result.languageCode,
                                    });
                                }
                                if (!isFinal) {
                                    const responseMsg = {
                                        type: 'interim',
                                        transcript,
                                        confidence: alternative.confidence,
                                        languageCode: result.languageCode,
                                        stability: result.stability,
                                    };
                                    ws.send(JSON.stringify(responseMsg));
                                    return;
                                }
                                logger_1.default.debug(`Final transcript | sessionId: ${sessionId}`, {
                                    transcript: transcript.substring(0, 50),
                                    confidence: alternative.confidence,
                                    languageCode: result.languageCode,
                                });
                                if (!targetLang) {
                                    const responseMsg = {
                                        type: 'final',
                                        transcript,
                                        confidence: alternative.confidence,
                                        languageCode: result.languageCode,
                                    };
                                    ws.send(JSON.stringify(responseMsg));
                                    return;
                                }
                                try {
                                    const detectedLang = (result.languageCode?.split('-')[0] || 'auto');
                                    const startGpt = Date.now();
                                    const gptResult = await gpt_service_1.default.translateAndCorrect({
                                        text: transcript,
                                        sourceLang: detectedLang,
                                        targetLang: targetLang,
                                    });
                                    const gptTime = Date.now() - startGpt;
                                    logger_1.default.debug(`GPT translation completed | sessionId: ${sessionId}`, {
                                        original: transcript.substring(0, 30),
                                        translated: gptResult.translatedText.substring(0, 30),
                                        detectedLang: gptResult.detectedLanguage,
                                        timeMs: gptTime,
                                    });
                                    const startTts = Date.now();
                                    const ttsResult = await tts_service_1.default.textToSpeech({
                                        text: gptResult.translatedText,
                                        language: targetLang,
                                    });
                                    const ttsTime = Date.now() - startTts;
                                    logger_1.default.debug(`TTS completed | sessionId: ${sessionId}`, {
                                        textLength: gptResult.translatedText.length,
                                        timeMs: ttsTime,
                                    });
                                    const responseMsg = {
                                        type: 'final',
                                        transcript,
                                        confidence: alternative.confidence,
                                        languageCode: result.languageCode,
                                        translatedText: gptResult.translatedText,
                                        detectedLanguage: gptResult.detectedLanguage,
                                        audioBase64: ttsResult.audioBase64,
                                    };
                                    ws.send(JSON.stringify(responseMsg));
                                    logger_1.default.info(`Streaming translation completed | sessionId: ${sessionId}`, {
                                        gptMs: gptTime,
                                        ttsMs: ttsTime,
                                        totalMs: gptTime + ttsTime,
                                    });
                                }
                                catch (error) {
                                    logger_1.default.error(`Translation/TTS error | sessionId: ${sessionId}`, error);
                                    const responseMsg = {
                                        type: 'final',
                                        transcript,
                                        confidence: alternative.confidence,
                                        languageCode: result.languageCode,
                                        error: 'Translation failed: ' + error.message,
                                    };
                                    ws.send(JSON.stringify(responseMsg));
                                }
                            });
                            googleStream.on('error', (error) => {
                                logger_1.default.error(`Google stream error | sessionId: ${sessionId}`, error);
                                clearSilenceTimer();
                                ws.send(JSON.stringify({
                                    type: 'error',
                                    error: error.message
                                }));
                                isStreamActive = false;
                            });
                            googleStream.on('end', () => {
                                logger_1.default.info(`Google stream ended | sessionId: ${sessionId}`);
                                clearSilenceTimer();
                                ws.send(JSON.stringify({ type: 'stopped' }));
                                isStreamActive = false;
                            });
                        }
                    }
                    else {
                        logger_1.default.warn(`Audio buffer full, dropping chunk | sessionId: ${sessionId}`);
                    }
                    return;
                }
                googleStream.write({ audio: data });
                return;
            }
            const message = JSON.parse(data.toString());
            switch (message.type) {
                case 'start': {
                    if (isStreamActive) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            error: 'Stream already active'
                        }));
                        return;
                    }
                    if (message.targetLang) {
                        targetLang = message.targetLang;
                    }
                    logger_1.default.info(`Starting streaming session | sessionId: ${sessionId}`, {
                        sourceLang: message.sourceLang || 'auto',
                        targetLang,
                        interimResults: message.interimResults ?? true,
                    });
                    const { stream, configRequest } = speech_service_1.default.createStreamingRecognition(message.sourceLang, undefined, message.interimResults ?? true);
                    googleStream = stream;
                    isStreamActive = true;
                    googleStream.write(configRequest);
                    if (audioBuffer.length > 0) {
                        logger_1.default.info(`Flushing ${audioBuffer.length} buffered audio chunks | sessionId: ${sessionId}`);
                        audioBuffer.forEach(chunk => {
                            googleStream.write({ audio: chunk });
                        });
                        audioBuffer.length = 0;
                    }
                    googleStream.on('data', async (response) => {
                        if (!response.results || response.results.length === 0)
                            return;
                        const result = response.results[0];
                        const alternative = result.alternatives?.[0];
                        if (!alternative)
                            return;
                        resetSilenceTimer();
                        const transcript = alternative.transcript;
                        const isFinal = result.isFinal;
                        if (!isFinal) {
                            logger_1.default.debug(`Interim transcript | sessionId: ${sessionId}`, {
                                transcript: transcript.substring(0, 50),
                                stability: result.stability,
                                languageCode: result.languageCode,
                            });
                        }
                        if (!isFinal) {
                            const responseMsg = {
                                type: 'interim',
                                transcript,
                                confidence: alternative.confidence,
                                languageCode: result.languageCode,
                                stability: result.stability,
                            };
                            ws.send(JSON.stringify(responseMsg));
                            return;
                        }
                        logger_1.default.debug(`Final transcript | sessionId: ${sessionId}`, {
                            transcript: transcript.substring(0, 50),
                            confidence: alternative.confidence,
                            languageCode: result.languageCode,
                        });
                        if (!targetLang) {
                            const responseMsg = {
                                type: 'final',
                                transcript,
                                confidence: alternative.confidence,
                                languageCode: result.languageCode,
                            };
                            ws.send(JSON.stringify(responseMsg));
                            return;
                        }
                        try {
                            const detectedLang = (result.languageCode?.split('-')[0] || 'auto');
                            const startGpt = Date.now();
                            const gptResult = await gpt_service_1.default.translateAndCorrect({
                                text: transcript,
                                sourceLang: detectedLang,
                                targetLang: targetLang,
                            });
                            const gptTime = Date.now() - startGpt;
                            logger_1.default.debug(`GPT translation completed | sessionId: ${sessionId}`, {
                                original: transcript.substring(0, 30),
                                translated: gptResult.translatedText.substring(0, 30),
                                detectedLang: gptResult.detectedLanguage,
                                timeMs: gptTime,
                            });
                            const startTts = Date.now();
                            const ttsResult = await tts_service_1.default.textToSpeech({
                                text: gptResult.translatedText,
                                language: targetLang,
                            });
                            const ttsTime = Date.now() - startTts;
                            logger_1.default.debug(`TTS completed | sessionId: ${sessionId}`, {
                                textLength: gptResult.translatedText.length,
                                timeMs: ttsTime,
                            });
                            const responseMsg = {
                                type: 'final',
                                transcript,
                                confidence: alternative.confidence,
                                languageCode: result.languageCode,
                                translatedText: gptResult.translatedText,
                                detectedLanguage: gptResult.detectedLanguage,
                                audioBase64: ttsResult.audioBase64,
                            };
                            ws.send(JSON.stringify(responseMsg));
                            logger_1.default.info(`Streaming translation completed | sessionId: ${sessionId}`, {
                                gptMs: gptTime,
                                ttsMs: ttsTime,
                                totalMs: gptTime + ttsTime,
                            });
                        }
                        catch (error) {
                            logger_1.default.error(`Translation/TTS error | sessionId: ${sessionId}`, error);
                            const responseMsg = {
                                type: 'final',
                                transcript,
                                confidence: alternative.confidence,
                                languageCode: result.languageCode,
                                error: 'Translation failed: ' + error.message,
                            };
                            ws.send(JSON.stringify(responseMsg));
                        }
                    });
                    googleStream.on('error', (error) => {
                        logger_1.default.error(`Google stream error | sessionId: ${sessionId}`, error);
                        clearSilenceTimer();
                        ws.send(JSON.stringify({
                            type: 'error',
                            error: error.message
                        }));
                        isStreamActive = false;
                    });
                    googleStream.on('end', () => {
                        logger_1.default.info(`Google stream ended | sessionId: ${sessionId}`);
                        clearSilenceTimer();
                        ws.send(JSON.stringify({ type: 'stopped' }));
                        isStreamActive = false;
                    });
                    break;
                }
                case 'audio': {
                    if (!isStreamActive || !googleStream) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            error: 'Stream not active. Send "start" first.'
                        }));
                        return;
                    }
                    if (!message.audio) {
                        ws.send(JSON.stringify({
                            type: 'error',
                            error: 'No audio data provided'
                        }));
                        return;
                    }
                    const audioBuffer = Buffer.from(message.audio, 'base64');
                    googleStream.write({ audio: audioBuffer });
                    break;
                }
                case 'stop': {
                    clearSilenceTimer();
                    if (googleStream) {
                        googleStream.end();
                        googleStream = null;
                    }
                    isStreamActive = false;
                    logger_1.default.info(`Streaming session stopped | sessionId: ${sessionId}`);
                    ws.send(JSON.stringify({ type: 'stopped' }));
                    break;
                }
                default: {
                    ws.send(JSON.stringify({
                        type: 'error',
                        error: `Unknown message type: ${message.type}`
                    }));
                    break;
                }
            }
        }
        catch (error) {
            logger_1.default.error(`WebSocket message error | sessionId: ${sessionId}`, error);
            ws.send(JSON.stringify({
                type: 'error',
                error: error.message
            }));
        }
    });
    ws.on('close', () => {
        logger_1.default.info(`Streaming WebSocket disconnected | sessionId: ${sessionId}`);
        clearSilenceTimer();
        audioBuffer.length = 0;
        if (googleStream) {
            googleStream.end();
            googleStream = null;
        }
        isStreamActive = false;
    });
    ws.on('error', (error) => {
        logger_1.default.error(`WebSocket error | sessionId: ${sessionId}`, error);
        clearSilenceTimer();
        audioBuffer.length = 0;
        if (googleStream) {
            googleStream.end();
            googleStream = null;
        }
        isStreamActive = false;
    });
}
//# sourceMappingURL=streamingHandler.js.map