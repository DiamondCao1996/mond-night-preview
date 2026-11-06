export default {
  "id": "diet",
  "number": 11,
  "role": "behavior",
  "names": {
    "en": "Diet",
    "zh-CN": "饮食",
    "sv": "Kost"
  },
  "short": {
    "en": "Diet",
    "zh-CN": "饮食",
    "sv": "Kost"
  },
  "citations": [
    "16",
    "17",
    "18",
    "19"
  ],
  "evidenceStrength": "observational",
  "association": {
    "targets": [
      "hrv"
    ],
    "direction": "mixed",
    "note": {
      "en": "Mediterranean-diet adherence correlated with higher HRV in twins; fish-oil trials increased HF but not SDNN or successive-difference measures significantly.",
      "zh-CN": "地中海饮食依从性与较高 HRV 相关；鱼油提高 HF，但 SDNN 和连续差异不显著。",
      "sv": "Medelhavskost korrelerade med högre HRV; fiskolja ökade HF, men SDNN och successiva differenser inte signifikant."
    }
  },
  "modelRole": "logged-exposure",
  "outputType": "personal-association",
  "inputs": [
    "explicit event logs",
    "comparable overnight RMSSD"
  ],
  "evidence": {
    "en": "Mediterranean-diet adherence correlated with higher HRV in twins; fish-oil trials increased HF but not SDNN or successive-difference measures significantly.",
    "zh-CN": "地中海饮食依从性与较高 HRV 相关；鱼油提高 HF，但 SDNN 和连续差异不显著。",
    "sv": "Medelhavskost korrelerade med högre HRV; fiskolja ökade HF, men SDNN och successiva differenser inte signifikant."
  },
  "limits": {
    "en": "No ready-to-use HRV-to-diet recommender is validated by these sources.",
    "zh-CN": "没有现成且验证的 HRV 饮食推荐模型。",
    "sv": "Ingen validerad färdig HRV-kostrekommendation."
  },
  "proposedUse": {
    "en": "Require diet and meal-timing logs for within-person observational comparisons.",
    "zh-CN": "必须记录饮食及用餐时间再比较个人关联。",
    "sv": "Kräv kost- och måltidsloggar för personliga samband."
  },
  "existingModel": "Twin mixed-effects models, randomized dietary contrasts and meta-analysis.",
  "forbiddenOutputs": []
};
