import { GPTGeneratedWord, GPTTranslationRequest, GPTTranslationResult, GPTWordGenerationRequest } from '../types';
declare class GPTService {
    private apiKey;
    private baseURL;
    private model;
    constructor();
    translateAndCorrect(request: GPTTranslationRequest): Promise<GPTTranslationResult>;
    generateWords(request: GPTWordGenerationRequest): Promise<GPTGeneratedWord[]>;
    private getLanguageName;
    private getLanguageNames;
}
declare const _default: GPTService;
export default _default;
//# sourceMappingURL=gpt.service.d.ts.map