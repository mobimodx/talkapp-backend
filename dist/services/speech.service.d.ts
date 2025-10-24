import { SupportedLanguage } from '../types';
declare class SpeechService {
    private apiKey;
    private baseURL;
    constructor();
    speechToText(audioBase64: string, language: SupportedLanguage): Promise<string>;
    private getLanguageCode;
}
declare const _default: SpeechService;
export default _default;
//# sourceMappingURL=speech.service.d.ts.map