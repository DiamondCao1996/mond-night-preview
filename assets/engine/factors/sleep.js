export default {
  "id": "sleep",
  "number": 3,
  "role": "observation",
  "names": {
    "en": "Sleep",
    "zh-CN": "睡眠",
    "sv": "Sömn"
  },
  "short": {
    "en": "Sleep",
    "zh-CN": "睡眠",
    "sv": "Sömn"
  },
  "citations": [
    "23",
    "21"
  ],
  "evidenceStrength": "meta-obs",
  "association": {
    "targets": [
      "hrv"
    ],
    "direction": "down",
    "note": {
      "en": "Personalized short-sleep definitions captured accumulated associations; deprivation modestly reduced RMSSD (SMD −0.24), while SDNN and HF changes were nonsignificant.",
      "zh-CN": "个性化短睡眠存在累积关联；睡眠剥夺使 RMSSD 小幅下降（SMD −0.24），SDNN 和 HF 不显著。",
      "sv": "Personlig kort sömn hade ackumulerade samband; sömnbrist minskade RMSSD något (SMD −0,24), SDNN och HF inte signifikant."
    }
  },
  "modelRole": "observation",
  "outputType": "shortfall-forecast",
  "inputs": [
    "timestamp",
    "timezone",
    "device",
    "metric",
    "window",
    "quality"
  ],
  "evidence": {
    "en": "Personalized short-sleep definitions captured accumulated associations; deprivation modestly reduced RMSSD (SMD −0.24), while SDNN and HF changes were nonsignificant.",
    "zh-CN": "个性化短睡眠存在累积关联；睡眠剥夺使 RMSSD 小幅下降（SMD −0.24），SDNN 和 HF 不显著。",
    "sv": "Personlig kort sömn hade ackumulerade samband; sömnbrist minskade RMSSD något (SMD −0,24), SDNN och HF inte signifikant."
  },
  "limits": {
    "en": "Associations do not validate the benefit of a recommendation.",
    "zh-CN": "关联不证明建议有效。",
    "sv": "Samband bevisar inte nyttan av råd."
  },
  "proposedUse": {
    "en": "Describe personal sleep shortfall and accumulating short nights.",
    "zh-CN": "描述个人睡眠不足及连续短睡眠。",
    "sv": "Beskriv personlig sömnbrist över flera nätter."
  },
  "existingModel": "Personal sleep thresholds and mixed-effects association models.",
  "forbiddenOutputs": [],
  "evidenceDesigns": [
    {
      "design": "Meta-analysis of sleep deprivation (not described as RCTs)",
      "citations": [
        "21"
      ],
      "detail": {
        "en": "Sleep-deprivation meta-analysis: RMSSD SMD −0.24; SDNN and HF nonsignificant. Not described as an RCT meta-analysis.",
        "zh-CN": "睡眠剥夺荟萃分析：RMSSD SMD −0.24；SDNN 和 HF 不显著。报告未称其为 RCT 荟萃分析。",
        "sv": "Metaanalys av sömnbrist: RMSSD SMD −0,24; SDNN och HF inte signifikanta. Inte beskriven som en RCT-metaanalys."
      }
    },
    {
      "design": "Longitudinal observational wearable / personalized short-sleep study",
      "citations": [
        "23"
      ],
      "detail": {
        "en": "Longitudinal wearable observations linked personalized short sleep with accumulating short-term outcomes.",
        "zh-CN": "纵向穿戴观察发现，个性化短睡眠与累积的短期结局相关。",
        "sv": "Longitudinella mätningar kopplade personligt definierad kort sömn till ackumulerade kortsiktiga utfall."
      }
    }
  ]
};
