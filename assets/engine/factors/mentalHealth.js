export default {
  "id": "mentalHealth",
  "number": 9,
  "role": "health",
  "names": {
    "en": "Mental health",
    "zh-CN": "心理健康",
    "sv": "Psykisk hälsa"
  },
  "short": {
    "en": "Mental health",
    "zh-CN": "心理健康",
    "sv": "Psykisk hälsa"
  },
  "citations": [
    "13"
  ],
  "evidenceStrength": "rct-meta",
  "association": {
    "targets": [
      "hrv"
    ],
    "direction": "mixed",
    "note": {
      "en": "An umbrella review found disorder- and metric-dependent differences; only a minority of comparisons reached suggestive evidence, none convincing or highly suggestive.",
      "zh-CN": "不同疾病和指标结果不同；少数比较达到提示性证据，无令人信服或高度提示性证据。",
      "sv": "Skillnader varierade mellan diagnoser och mått; få jämförelser nådde antydande evidens, ingen övertygande eller starkt antydande."
    }
  },
  "modelRole": "separate-pathway",
  "outputType": "evidence-only",
  "inputs": [
    "optional consented context"
  ],
  "evidence": {
    "en": "An umbrella review found disorder- and metric-dependent differences; only a minority of comparisons reached suggestive evidence, none convincing or highly suggestive.",
    "zh-CN": "不同疾病和指标结果不同；少数比较达到提示性证据，无令人信服或高度提示性证据。",
    "sv": "Skillnader varierade mellan diagnoser och mått; få jämförelser nådde antydande evidens, ingen övertygande eller starkt antydande."
  },
  "limits": {
    "en": "HRV is not a validated standalone diagnostic classifier.",
    "zh-CN": "不能用 HRV 独立诊断心理疾病。",
    "sv": "HRV är ingen fristående diagnostisk klassificerare."
  },
  "proposedUse": {
    "en": "Separate research with independently assessed wellbeing and consented medication context.",
    "zh-CN": "独立研究，使用外部评估的幸福感分数和自愿用药背景。",
    "sv": "Separat forskning med oberoende skattat välbefinnande och frivillig läkemedelskontext."
  },
  "existingModel": "Random-effects synthesis of disorder and treatment differences.",
  "forbiddenOutputs": [
    "individual-risk-score",
    "diagnosis",
    "years-of-life"
  ]
};
