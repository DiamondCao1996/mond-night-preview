export default {
  "id": "education",
  "number": 7,
  "role": "profile",
  "names": {
    "en": "Education",
    "zh-CN": "教育程度",
    "sv": "Utbildning"
  },
  "short": {
    "en": "Education",
    "zh-CN": "教育程度",
    "sv": "Utbildning"
  },
  "citations": [
    "4"
  ],
  "evidenceStrength": "observational",
  "association": {
    "targets": [
      "hrv"
    ],
    "direction": "up",
    "note": {
      "en": "CARDIA examined education and income alongside RR variability; higher education correlated with LF variability after demographic adjustment.",
      "zh-CN": "CARDIA 横断面分析：人口学调整后，较高教育程度与较高 LF 变异性相关；并非 RMSSD 结果。",
      "sv": "Tvärsnittsanalys i CARDIA: högre utbildning var kopplad till större LF-variabilitet efter demografisk justering; detta avser inte RMSSD."
    }
  },
  "modelRole": "optional-covariate",
  "outputType": "optional-context",
  "inputs": [
    "education"
  ],
  "evidence": {
    "en": "CARDIA examined education and income alongside RR variability; higher education correlated with LF variability after demographic adjustment.",
    "zh-CN": "CARDIA 横断面分析：人口学调整后，较高教育程度与较高 LF 变异性相关；并非 RMSSD 结果。",
    "sv": "Tvärsnittsanalys i CARDIA: högre utbildning var kopplad till större LF-variabilitet efter demografisk justering; detta avser inte RMSSD."
  },
  "limits": {
    "en": "Socioeconomic associations do not establish a causal education effect.",
    "zh-CN": "不是教育的因果效应。",
    "sv": "Inget kausalt utbildningssamband."
  },
  "proposedUse": {
    "en": "Optional context only; ask explanation-detail preference separately.",
    "zh-CN": "可选背景；解释详细程度另行询问。",
    "sv": "Valfri kontext; fråga separat om förklaringsnivå."
  },
  "existingModel": "Covariate-adjusted linear regression.",
  "forbiddenOutputs": [],
  "evidenceDesigns": [
    {
      "design": "Cross-sectional CARDIA: higher education associated with greater LF variability",
      "citations": [
        "4"
      ],
      "detail": {
        "en": "CARDIA examined education and income alongside RR variability; higher education correlated with LF variability after demographic adjustment.",
        "zh-CN": "CARDIA 横断面分析：人口学调整后，较高教育程度与较高 LF 变异性相关；并非 RMSSD 结果。",
        "sv": "Tvärsnittsanalys i CARDIA: högre utbildning var kopplad till större LF-variabilitet efter demografisk justering; detta avser inte RMSSD."
      }
    }
  ]
};
