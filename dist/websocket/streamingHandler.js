"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleStreamingConnection = handleStreamingConnection;
const speech_service_1 = __importDefault(require("../services/speech.service"));
const logger_1 = __importDefault(require("../utils/logger"));
function handleStreamingConnection(ws) {
    let googleStream = null;
    let isStreamActive = false;
    const sessionId = Math.random().toString(36).substring(7);
    let silenceTimer = null;
    const SILENCE_THRESHOLD_MS = 2000;
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
    ws.on('message', async (data) => {
        try {
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
                    logger_1.default.info(`Starting streaming session | sessionId: ${sessionId}`, {
                        sourceLang: message.sourceLang,
                        targetLang: message.targetLang,
                        interimResults: message.interimResults ?? true,
                    });
                    const { stream, configRequest } = speech_service_1.default.createStreamingRecognition(message.sourceLang, message.targetLang, message.interimResults ?? true);
                    googleStream = stream;
                    isStreamActive = true;
                    googleStream.write(configRequest);
                    googleStream.on('data', (response) => {
                        if (!response.results || response.results.length === 0)
                            return;
                        const result = response.results[0];
                        const alternative = result.alternatives?.[0];
                        if (!alternative)
                            return;
                        resetSilenceTimer();
                        const responseMsg = {
                            type: result.isFinal ? 'final' : 'interim',
                            transcript: alternative.transcript,
                            confidence: alternative.confidence,
                            languageCode: result.languageCode,
                            stability: result.stability,
                        };
                        ws.send(JSON.stringify(responseMsg));
                        if (result.isFinal) {
                            logger_1.default.debug(`Final transcript | sessionId: ${sessionId}`, {
                                transcript: alternative.transcript.substring(0, 50),
                                confidence: alternative.confidence,
                                languageCode: result.languageCode,
                            });
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
        if (googleStream) {
            googleStream.end();
            googleStream = null;
        }
        isStreamActive = false;
    });
    ws.on('error', (error) => {
        logger_1.default.error(`WebSocket error | sessionId: ${sessionId}`, error);
        clearSilenceTimer();
        if (googleStream) {
            googleStream.end();
            googleStream = null;
        }
        isStreamActive = false;
    });
}
//# sourceMappingURL=streamingHandler.js.map