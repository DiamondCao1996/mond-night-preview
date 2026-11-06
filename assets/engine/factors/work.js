export default {
  "id": "work",
  "number": 14,
  "role": "behavior",
  "names": {
    "en": "Work",
    "zh-CN": "工作",
    "sv": "Arbete"
  },
  "short": {
    "en": "Work",
    "zh-CN": "工作",
    "sv": "Arbete"
  },
  "citations": [
    "26",
    "27",
    "33"
  ],
  "evidenceStrength": "review",
  "association": {
    "targets": [
      "hrv",
      "rhr"
    ],
    "direction": "down",
    "note": {
      "en": "Job stress correlated with lower HRV and higher HR; burnout was inconclusive and 24-hour-shift findings inconsistent.",
      "zh-CN": "工作压力与较低 HRV 和较高心率相关；倦怠及长班次证据不一致。",
      "sv": "Arbetsstress korrelerade med lägre HRV och högre puls; utmattning och långa skift gav osäkra fynd."
    },
    "byTarget": {
      "hrv": "down",
      "rhr": "up"
    }
  },
  "modelRole": "logged-exposure",
  "outputType": "personal-association",
  "inputs": [
    "explicit event logs",
    "comparable overnight RMSSD"
  ],
  "evidence": {
    "en": "Job stress correlated with lower HRV and higher HR; burnout was inconclusive and 24-hour-shift findings inconsistent.",
    "zh-CN": "工作压力与较低 HRV 和较高心率相关；倦怠及长班次证据不一致。",
    "sv": "Arbetsstress korrelerade med lägre HRV och högre puls; utmattning och långa skift gav osäkra fynd."
  },
  "limits": {
    "en": "Stress-label prediction neither diagnoses burnout nor proves that a work adjustment helps.",
    "zh-CN": "压力标签预测不是倦怠诊断，也不证明调整工作有效。",
    "sv": "Stressprediktion är ingen utmattningsdiagnos eller bevis för nyttan av arbetsändringar."
  },
  "proposedUse": {
    "en": "Require strain and break logs; evaluate future break suggestions in randomized studies.",
    "zh-CN": "必须记录压力与休息；未来建议需随机试验。",
    "sv": "Kräv belastnings- och pausloggar; pröva framtida råd randomiserat."
  },
  "existingModel": "Reviews and cross-context stress-prediction/domain-adaptation experiments.",
  "forbiddenOutputs": [],
  "evidenceDesigns": [
    {
      "design": "Systematic review of job stress: lower HRV and higher HR",
      "citations": [
        "26"
      ],
      "detail": {
        "en": "Job stress correlated with lower HRV and higher HR; burnout was inconclusive and 24-hour-shift findings inconsistent.",
        "zh-CN": "工作压力与较低 HRV 和较高心率相关；倦怠及长班次证据不一致。",
        "sv": "Arbetsstress korrelerade med lägre HRV och högre puls; utmattning och långa skift gav osäkra fynd."
      }
    },
    {
      "design": "Systematic review and meta-analysis of 24-hour shifts: inconsistent findings",
      "citations": [
        "27"
      ],
      "detail": {
        "en": "Job stress correlated with lower HRV and higher HR; burnout was inconclusive and 24-hour-shift findings inconsistent.",
        "zh-CN": "工作压力与较低 HRV 和较高心率相关；倦怠及长班次证据不一致。",
        "sv": "Arbetsstress korrelerade med lägre HRV och högre puls; utmattning och långa skift gav osäkra fynd."
      }
    },
    {
      "design": "Supporting cross-context stress-prediction and domain-adaptation experiments",
      "citations": [
        "33"
      ],
      "detail": {
        "en": "Job stress correlated with lower HRV and higher HR; burnout was inconclusive and 24-hour-shift findings inconsistent.",
        "zh-CN": "工作压力与较低 HRV 和较高心率相关；倦怠及长班次证据不一致。",
        "sv": "Arbetsstress korrelerade med lägre HRV och högre puls; utmattning och långa skift gav osäkra fynd."
      }
    }
  ]
};
