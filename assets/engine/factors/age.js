export default {
  "id": "age",
  "number": 5,
  "role": "profile",
  "names": {
    "en": "Age",
    "zh-CN": "年龄",
    "sv": "Ålder"
  },
  "short": {
    "en": "Age",
    "zh-CN": "年龄",
    "sv": "Ålder"
  },
  "citations": [
    "8"
  ],
  "evidenceStrength": "observational",
  "association": {
    "targets": [
      "hrv"
    ],
    "direction": "down",
    "note": {
      "en": "HRV declined with age in 149,205 people using 10-second resting ECGs; age and sex explained about one fifth of between-person variation.",
      "zh-CN": "10 秒静息心电人群中 HRV 随年龄下降；年龄和性别解释约五分之一的人际差异。",
      "sv": "HRV minskade med ålder i 10-sekunders vilo-EKG; ålder och kön förklarade cirka en femtedel av variationen."
    }
  },
  "modelRole": "nonlinear-covariate",
  "outputType": "descriptive-age-comparison",
  "inputs": [
    "age"
  ],
  "evidence": {
    "en": "HRV declined with age in 149,205 people using 10-second resting ECGs; age and sex explained about one fifth of between-person variation.",
    "zh-CN": "10 秒静息心电人群中 HRV 随年龄下降；年龄和性别解释约五分之一的人际差异。",
    "sv": "HRV minskade med ålder i 10-sekunders vilo-EKG; ålder och kön förklarade cirka en femtedel av variationen."
  },
  "limits": {
    "en": "These ECG population relationships are not transferable to overnight PPG.",
    "zh-CN": "不可直接迁移至整夜 PPG。",
    "sv": "Kan inte överföras till nattlig PPG."
  },
  "proposedUse": {
    "en": "Use a mild nonlinear illustrative covariate alongside personal baselines; test age-stratified calibration.",
    "zh-CN": "仅作非线性示意背景并结合个人基线。",
    "sv": "Använd endast en illustrativ olinjär kovariat och personlig baslinje."
  },
  "existingModel": "Hierarchical regression of HRV determinants.",
  "forbiddenOutputs": []
};
