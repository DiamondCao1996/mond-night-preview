export default {
  "id": "lifeExpectancy",
  "number": 10,
  "role": "health",
  "names": {
    "en": "Life expectancy",
    "zh-CN": "预期寿命",
    "sv": "Livslängd"
  },
  "short": {
    "en": "Life expectancy",
    "zh-CN": "预期寿命",
    "sv": "Livslängd"
  },
  "citations": [
    "14",
    "15"
  ],
  "evidenceStrength": "meta-obs",
  "association": {
    "targets": [
      "hrv"
    ],
    "direction": "contextual",
    "note": {
      "en": "Lower HRV correlated with mortality in pooled studies; measured but not genetically predicted HRV was associated with mortality in UK Biobank.",
      "zh-CN": "较低 HRV 与死亡率相关；英国生物样本库中实测而非遗传预测 HRV 与死亡率相关。",
      "sv": "Lägre HRV hade samband med mortalitet; uppmätt men inte genetiskt förutsagt HRV var associerat i UK Biobank."
    }
  },
  "modelRole": "separate-pathway",
  "outputType": "evidence-only",
  "inputs": [
    "optional consented context"
  ],
  "evidence": {
    "en": "Lower HRV correlated with mortality in pooled studies; measured but not genetically predicted HRV was associated with mortality in UK Biobank.",
    "zh-CN": "较低 HRV 与死亡率相关；英国生物样本库中实测而非遗传预测 HRV 与死亡率相关。",
    "sv": "Lägre HRV hade samband med mortalitet; uppmätt men inte genetiskt förutsagt HRV var associerat i UK Biobank."
  },
  "limits": {
    "en": "Mortality association is not a calibrated remaining-lifespan estimate; no HRV-to-years shortcut.",
    "zh-CN": "死亡关联不是剩余寿命估计，不能把 HRV 换算成年数。",
    "sv": "Mortalitetssamband är ingen skattning av återstående livslängd; ingen HRV-till-år-genväg."
  },
  "proposedUse": {
    "en": "Separate externally validated survival research with event times and censoring.",
    "zh-CN": "仅限具有事件时间和删失信息的独立生存研究。",
    "sv": "Separat validerad överlevnadsforskning med händelsetider och censurering."
  },
  "existingModel": "Cox association analysis and pooled prognostic meta-analysis.",
  "forbiddenOutputs": [
    "individual-risk-score",
    "diagnosis",
    "years-of-life",
    "life-expectancy-prediction"
  ],
  "evidenceDesigns": [
    {
      "design": "Prognostic meta-analysis with individual-participant subanalyses",
      "citations": [
        "14"
      ],
      "detail": {
        "en": "Lower HRV correlated with mortality in pooled studies; measured but not genetically predicted HRV was associated with mortality in UK Biobank.",
        "zh-CN": "较低 HRV 与死亡率相关；英国生物样本库中实测而非遗传预测 HRV 与死亡率相关。",
        "sv": "Lägre HRV hade samband med mortalitet; uppmätt men inte genetiskt förutsagt HRV var associerat i UK Biobank."
      }
    },
    {
      "design": "UK Biobank observational and genetic association analyses",
      "citations": [
        "15"
      ],
      "detail": {
        "en": "Lower HRV correlated with mortality in pooled studies; measured but not genetically predicted HRV was associated with mortality in UK Biobank.",
        "zh-CN": "较低 HRV 与死亡率相关；英国生物样本库中实测而非遗传预测 HRV 与死亡率相关。",
        "sv": "Lägre HRV hade samband med mortalitet; uppmätt men inte genetiskt förutsagt HRV var associerat i UK Biobank."
      }
    }
  ]
};
