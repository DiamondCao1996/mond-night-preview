export default {
  "id": "height",
  "number": 6,
  "role": "profile",
  "names": {
    "en": "Height",
    "zh-CN": "身高",
    "sv": "Längd"
  },
  "short": {
    "en": "Height",
    "zh-CN": "身高",
    "sv": "Längd"
  },
  "citations": [
    "9"
  ],
  "evidenceStrength": "adjacent",
  "association": {
    "targets": [
      "rhr"
    ],
    "direction": "down",
    "note": {
      "en": "A physiological perspective examined an inverse height–resting-HR relationship in 4,795 adults.",
      "zh-CN": "研究讨论身高与静息心率的反向关联。",
      "sv": "En fysiologisk analys diskuterade omvänt samband mellan längd och vilopuls."
    }
  },
  "modelRole": "candidate-covariate",
  "outputType": "candidate-covariate",
  "inputs": [
    "height"
  ],
  "evidence": {
    "en": "A physiological perspective examined an inverse height–resting-HR relationship in 4,795 adults.",
    "zh-CN": "研究讨论身高与静息心率的反向关联。",
    "sv": "En fysiologisk analys diskuterade omvänt samband mellan längd och vilopuls."
  },
  "limits": {
    "en": "This is adjacent HR evidence, not validated height–HRV normalization.",
    "zh-CN": "是相邻心率证据，不是身高与 HRV 的校正依据。",
    "sv": "Närliggande pulsevidens, ingen validerad HRV-normalisering."
  },
  "proposedUse": {
    "en": "Retain a small candidate RHR covariate only pending demonstrated incremental utility.",
    "zh-CN": "仅保留小权重候选心率协变量。",
    "sv": "Behåll endast en liten kandidatkovariat för puls."
  },
  "existingModel": "Linear height–resting-HR regression.",
  "forbiddenOutputs": [],
  "evidenceDesigns": [
    {
      "design": "Adjacent physiological perspective and height–resting-HR cohort discussion",
      "citations": [
        "9"
      ],
      "detail": {
        "en": "A physiological perspective examined an inverse height–resting-HR relationship in 4,795 adults.",
        "zh-CN": "研究讨论身高与静息心率的反向关联。",
        "sv": "En fysiologisk analys diskuterade omvänt samband mellan längd och vilopuls."
      }
    }
  ]
};
