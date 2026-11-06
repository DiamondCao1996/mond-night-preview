export default {
  "id": "reading",
  "number": 15,
  "role": "behavior",
  "names": {
    "en": "Reading",
    "zh-CN": "阅读",
    "sv": "Läsning"
  },
  "short": {
    "en": "Reading",
    "zh-CN": "阅读",
    "sv": "Läsning"
  },
  "citations": [
    "5"
  ],
  "evidenceStrength": "rct-meta",
  "association": {
    "targets": [
      "sleep"
    ],
    "direction": "contextual",
    "note": {
      "en": "In a pragmatic randomized trial, 42% of reading respondents versus 28% of controls reported improved sleep quality.",
      "zh-CN": "阅读试验中 42% 对 28% 的受访者报告睡眠质量改善。",
      "sv": "42 % av läsande svarande jämfört med 28 % av kontroller rapporterade bättre sömn."
    }
  },
  "modelRole": "logged-exposure",
  "outputType": "personal-association",
  "inputs": [
    "explicit event logs",
    "comparable overnight RMSSD"
  ],
  "evidence": {
    "en": "In a pragmatic randomized trial, 42% of reading respondents versus 28% of controls reported improved sleep quality.",
    "zh-CN": "阅读试验中 42% 对 28% 的受访者报告睡眠质量改善。",
    "sv": "42 % av läsande svarande jämfört med 28 % av kontroller rapporterade bättre sömn."
  },
  "limits": {
    "en": "No validated reading-to-HRV predictive model was identified.",
    "zh-CN": "没有验证的阅读至 HRV 预测模型。",
    "sv": "Ingen validerad läsning-till-HRV-modell."
  },
  "proposedUse": {
    "en": "Log medium, timing and duration if provided; compare next-night sleep and RMSSD when sufficient.",
    "zh-CN": "自愿记录媒介、时间和时长，数据足够后比较随后夜晚。",
    "sv": "Logga medium, tidpunkt och längd frivilligt och jämför nästa natt."
  },
  "existingModel": "Randomized reading/no-reading self-reported sleep comparison.",
  "forbiddenOutputs": []
};
