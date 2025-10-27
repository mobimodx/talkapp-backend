# GOOGLE CLOUD SPEECH-TO-TEXT V2 - STREAMING API

## TEMEL BİLGİLER
- **Protokol:** Sadece gRPC (REST değil)
- **Kullanım:** Gerçek zamanlı ses transkripsiyon (mikrofon, canlı ses)
- **İki yönlü stream:** Audio gönderirsiniz → Sonuçları gerçek zamanlı alırsınız

## LİMİTLER
- **Chunk size:** Max 25 KB/request
- **Concurrent sessions:** 300/5 dakika
- **Requests:** 3,000/dakika

## REQUEST AKIŞI
1. **İlk mesaj:** Config (recognizer + streaming_config) - audio yok
2. **Sonraki mesajlar:** Sadece audio bytes (max 25KB chunk'lar)

## PYTHON ÖRNEK

```python
from google.cloud.speech_v2 import SpeechClient
from google.cloud.speech_v2.types import cloud_speech

client = SpeechClient()

# Config
recognition_config = cloud_speech.RecognitionConfig(
    auto_decoding_config=cloud_speech.AutoDetectDecodingConfig(),
    language_codes=["en-US"],  # veya ["auto"] otomatik dil algılama
    model="chirp_3"
)

streaming_config = cloud_speech.StreamingRecognitionConfig(
    config=recognition_config,
    streaming_features=cloud_speech.StreamingRecognitionFeatures(
        interim_results=True  # Ara sonuçlar için
    )
)

# İlk request
config_request = cloud_speech.StreamingRecognizeRequest(
    recognizer=f"projects/{PROJECT_ID}/locations/global/recognizers/_",
    streaming_config=streaming_config
)

# Audio request'ler
def requests(config, audio_chunks):
    yield config
    for chunk in audio_chunks:
        yield cloud_speech.StreamingRecognizeRequest(audio=chunk)

# Stream
responses = client.streaming_recognize(requests=requests(config_request, audio_chunks))

# Sonuçlar
for response in responses:
    for result in response.results:
        print(result.alternatives[0].transcript)
        print(f"Final: {result.is_final}")
```

## NODE.JS ÖRNEK

```javascript
const speech = require('@google-cloud/speech').v2;
const client = new speech.SpeechClient();

const configRequest = {
    recognizer: `projects/${PROJECT_ID}/locations/global/recognizers/_`,
    streamingConfig: {
        config: {
            autoDecodingConfig: {},
            languageCodes: ['en-US'],
            model: 'chirp_3'
        },
        streamingFeatures: {
            interimResults: true
        }
    }
};

// V2'de _streamingRecognize kullan
const stream = client._streamingRecognize()
    .on('data', (response) => {
        const result = response.results[0];
        console.log(result.alternatives[0].transcript);
    });

stream.write(configRequest);  // İlk config
audioChunks.forEach(chunk => stream.write({ audio: chunk }));
stream.end();
```

## RESPONSE YAPISI

```javascript
{
    results: [{
        alternatives: [{
            transcript: "hello world",
            confidence: 0.98  // Sadece final'da
        }],
        is_final: true,      // true = kesin, false = ara sonuç
        stability: 0.85,     // Sadece interim'de (0-1)
        language_code: "en-US"
    }]
}
```

## İNTERİM vs FINAL
- **Interim:** `is_final=false`, `stability` var, sürekli güncellenir
- **Final:** `is_final=true`, `confidence` var, kesinleşmiş sonuç

## OTOMATİK DİL ALGILAMA (Chirp 3)
```python
language_codes=["auto"]  # Tam otomatik
# veya
language_codes=["en-US", "es-ES", "fr-FR"]  # Bu dillerden birini algıla
```

## CHIRP 3 ÖZELLİKLERİ
- ✅ Streaming Recognition
- ✅ Otomatik dil algılama
- ✅ Speaker diarization
- ✅ Otomatik noktalama
- ✅ Built-in denoiser
- ❌ Word timestamps (yok)
- ❌ Word confidence (yok)

## BEST PRACTICES
- 100ms chunk'lar gönderin (16000Hz * 2 byte * 0.1s = 3.2KB güvenli)
- `autoDecodingConfig` kullanın
- 16000 Hz sample rate optimal
- Interim results için `stability > 0.8` daha güvenilir

## HATALAR
- `INVALID_ARGUMENT`: İlk mesajda audio gönderme, config gönder
- `RESOURCE_EXHAUSTED`: Quota aşıldı, concurrent stream azalt
- Chunk > 25KB: Chunk'ları küçült

---

# BACKEND ÖZELLİĞİ: SESSİZLİK ALGILAMA

## NASIL ÇALIŞIR
Backend, Google'dan gelen sonuçlara göre otomatik sessizlik algılar:
- Her interim/final sonuç → 2 saniye timer başlatır
- Yeni sonuç gelirse → Timer sıfırlanır
- 2 saniye hiç sonuç gelmezse → `"silence"` event'i gönderilir

## FRONTEND KULLANIMI

```javascript
ws.onmessage = (e) => {
  const data = JSON.parse(e.data);
  
  switch(data.type) {
    case 'interim':
      console.log('🎤 Konuşuyor:', data.transcript);
      break;
      
    case 'final':
      console.log('✅ Cümle bitti:', data.transcript);
      break;
      
    case 'silence':
      console.log('🤫 Sessizlik algılandı');
      // UI: "..." veya sessizlik ikonı göster
      break;
  }
};
```

## EVENT TİPLERİ

| Event | Açıklama |
|-------|----------|
| `connected` | WebSocket bağlantısı kuruldu |
| `interim` | Ara sonuç (konuşma devam ediyor) |
| `final` | Kesin sonuç (cümle tamamlandı) |
| `silence` | 2 saniye sessizlik algılandı |
| `stopped` | Stream durduruldu |
| `error` | Hata oluştu |

## THRESHOLD AYARLAMA
Varsayılan: 2 saniye sessizlik
- Daha hassas → 1.5 saniye
- Daha toleranslı → 3 saniye

Backend'de `streamingHandler.ts` dosyasındaki `SILENCE_THRESHOLD_MS` değiştirilebilir.