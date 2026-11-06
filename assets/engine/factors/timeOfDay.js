export default {
  "id": "timeOfDay",
  "number": 17,
  "role": "temporal",
  "names": {
    "en": "Time of day",
    "zh-CN": "时段",
    "sv": "Tid på dygnet"
  },
  "short": {
    "en": "Time of day",
    "zh-CN": "时段",
    "sv": "Tid på dygnet"
  },
  "citations": [
    "1"
  ],
  "evidenceStrength": "experimental",
  "association": {
    "targets": [
      "hrv"
    ],
    "direction": "contextual",
    "note": {
      "en": "Forced-desynchrony experiments showed endogenous circadian modulation of vagal markers independently of scheduled behavior.",
      "zh-CN": "实验发现内源昼夜节律独立于计划行为影响迷走指标。",
      "sv": "Laboratorieexperiment visade endogen dygnsmodulering av vagala markörer oberoende av schemalagt beteende."
    }
  },
  "modelRole": "temporal-context",
  "outputType": "temporal-illustration",
  "inputs": [
    "timestamp",
    "timezone",
    "device",
    "metric",
    "window",
    "quality"
  ],
  "evidence": {
    "en": "Forced-desynchrony experiments showed endogenous circadian modulation of vagal markers independently of scheduled behavior.",
    "zh-CN": "实验发现内源昼夜节律独立于计划行为影响迷走指标。",
    "sv": "Laboratorieexperiment visade endogen dygnsmodulering av vagala markörer oberoende av schemalagt beteende."
  },
  "limits": {
    "en": "Local clock time is only a proxy for internal phase.",
    "zh-CN": "本地钟点只是生物相位的代理。",
    "sv": "Klocktid är bara en proxy för biologisk fas."
  },
  "proposedUse": {
    "en": "Use cyclical time context with sleep/wake state and time since waking when available.",
    "zh-CN": "结合睡醒状态与醒后时间作周期背景。",
    "sv": "Använd cyklisk tid med sömn/vakenhet och tid sedan uppvaknande."
  },
  "existingModel": "Experimental circadian-rhythm analysis under forced desynchrony.",
  "forbiddenOutputs": [],
  "evidenceDesigns": [
    {
      "design": "Forced-desynchrony laboratory experiment",
      "citations": [
        "1"
      ],
      "detail": {
        "en": "Forced-desynchrony experiments showed endogenous circadian modulation of vagal markers independently of scheduled behavior.",
        "zh-CN": "实验发现内源昼夜节律独立于计划行为影响迷走指标。",
        "sv": "Laboratorieexperiment visade endogen dygnsmodulering av vagala markörer oberoende av schemalagt beteende."
      }
    }
  ]
};
