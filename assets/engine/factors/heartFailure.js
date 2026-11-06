export default {
  "id": "heartFailure",
  "number": 8,
  "role": "health",
  "names": {
    "en": "Heart failure",
    "zh-CN": "心力衰竭",
    "sv": "Hjärtsvikt"
  },
  "short": {
    "en": "Heart failure",
    "zh-CN": "心力衰竭",
    "sv": "Hjärtsvikt"
  },
  "citations": [
    "10",
    "11",
    "12"
  ],
  "evidenceStrength": "rct-meta",
  "association": {
    "targets": [
      "hrv"
    ],
    "direction": "down",
    "note": {
      "en": "HRV was generally impaired in HFrEF with broad ranges; heart-failure subgroup mortality associations were nonsignificant in one meta-analysis.",
      "zh-CN": "HFrEF 中 HRV 通常受损且范围较宽；一项荟萃分析的心衰死亡亚组关联不显著。",
      "sv": "HRV var ofta nedsatt vid HFrEF med stora spann; mortalitetssamband i en hjärtsviktsundergrupp var inte signifikanta."
    }
  },
  "modelRole": "separate-pathway",
  "outputType": "evidence-only",
  "inputs": [
    "optional consented context"
  ],
  "evidence": {
    "en": "HRV was generally impaired in HFrEF with broad ranges; heart-failure subgroup mortality associations were nonsignificant in one meta-analysis.",
    "zh-CN": "HFrEF 中 HRV 通常受损且范围较宽；一项荟萃分析的心衰死亡亚组关联不显著。",
    "sv": "HRV var ofta nedsatt vid HFrEF med stora spann; mortalitetssamband i en hjärtsviktsundergrupp var inte signifikanta."
  },
  "limits": {
    "en": "MAGGIC is a multivariable clinical survival score, not an HRV-only consumer model.",
    "zh-CN": "MAGGIC 是多变量临床模型，不能用 HRV 独立诊断或评分。",
    "sv": "MAGGIC är en klinisk flervariabelmodell, ingen HRV-baserad konsumentdiagnos."
  },
  "proposedUse": {
    "en": "Separate clinical research pathway; consented known conditions and medication are context labels only.",
    "zh-CN": "独立临床研究路径；同意后记录的病史和用药仅作背景标签。",
    "sv": "Separat klinisk forskning; samtyckt sjukdoms- och läkemedelskontext är bara etiketter."
  },
  "existingModel": "Systematic review and MAGGIC multivariable piecewise Poisson survival analysis.",
  "forbiddenOutputs": [
    "individual-risk-score",
    "diagnosis",
    "years-of-life"
  ]
};
