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
    "direction": "contextual",
    "note": {
      "en": "CARDIA examined education and income alongside RR variability; higher education correlated with LF variability after demographic adjustment.",
      "zh-CN": "CARDIA 观察到教育、收入与 RR 变异性的关联。",
      "sv": "CARDIA undersökte utbildning, inkomst och RR-variabilitet."
    }
  },
  "modelRole": "optional-covariate",
  "outputType": "optional-context",
  "inputs": [
    "education"
  ],
  "evidence": {
    "en": "CARDIA examined education and income alongside RR variability; higher education correlated with LF variability after demographic adjustment.",
    "zh-CN": "CARDIA 观察到教育、收入与 RR 变异性的关联。",
    "sv": "CARDIA undersökte utbildning, inkomst och RR-variabilitet."
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
  "forbiddenOutputs": []
};
