export default {
  "id": "meditation",
  "number": 16,
  "role": "behavior",
  "names": {
    "en": "Meditation",
    "zh-CN": "冥想",
    "sv": "Meditation"
  },
  "short": {
    "en": "Meditation",
    "zh-CN": "冥想",
    "sv": "Meditation"
  },
  "citations": [
    "6",
    "7"
  ],
  "evidenceStrength": "rct-meta",
  "association": {
    "targets": [
      "hrv"
    ],
    "direction": "mixed",
    "note": {
      "en": "A 2021 meta-analysis found nonsignificant resting vagal HRV changes with high heterogeneity; a limited 2025 review reported some short-term RMSSD increases.",
      "zh-CN": "2021 年荟萃分析静息迷走 HRV 变化不显著且异质性高；2025 年有限研究发现部分短期 RMSSD 上升。",
      "sv": "En metaanalys 2021 fann ingen signifikant viloeffekt med hög heterogenitet; en begränsad översikt 2025 fann vissa korta RMSSD-ökningar."
    }
  },
  "modelRole": "logged-exposure",
  "outputType": "personal-association",
  "inputs": [
    "explicit event logs",
    "comparable overnight RMSSD"
  ],
  "evidence": {
    "en": "A 2021 meta-analysis found nonsignificant resting vagal HRV changes with high heterogeneity; a limited 2025 review reported some short-term RMSSD increases.",
    "zh-CN": "2021 年荟萃分析静息迷走 HRV 变化不显著且异质性高；2025 年有限研究发现部分短期 RMSSD 上升。",
    "sv": "En metaanalys 2021 fann ingen signifikant viloeffekt med hög heterogenitet; en begränsad översikt 2025 fann vissa korta RMSSD-ökningar."
  },
  "limits": {
    "en": "Acute and chronic effects differ; resting effects remain uncertain.",
    "zh-CN": "急性和长期效应不同。",
    "sv": "Akuta och långvariga effekter skiljer sig."
  },
  "proposedUse": {
    "en": "Use session-tagged repeated measures; evaluate wellbeing separately from resting physiology.",
    "zh-CN": "分别评估幸福感和静息生理，记录冥想时段。",
    "sv": "Utvärdera välbefinnande och vilofysiologi separat."
  },
  "existingModel": "Random-effects RCT meta-analysis and short-term intervention synthesis.",
  "forbiddenOutputs": []
};
