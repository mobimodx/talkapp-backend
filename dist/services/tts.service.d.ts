import { TTSRequest, TTSResponse } from '../types';
declare class TTSService {
    private apiKey;
    private baseURL;
    constructor();
    textToSpeech(request: TTSRequest): Promise<TTSResponse>;
    private getDefaultVoice;
    getAvailableVoices(): string[];
}
declare const _default: TTSService;
export default _default;
//# sourceMappingURL=tts.service.d.ts.map