import { SupportedLanguage } from '../types';
declare class SpeechService {
    private client;
    constructor();
    speechToText(audioBase64: string, primaryLang?: SupportedLanguage, alternativeLang?: SupportedLanguage): Promise<{
        text: string;
        detectedLang: string;
    }>;
}
declare const _default: SpeechService;
export default _default;
//# sourceMappingURL=speech.service.d.ts.map