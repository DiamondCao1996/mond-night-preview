export default {
  "id": "activity",
  "number": 4,
  "role": "observation",
  "names": {
    "en": "Physical activity",
    "zh-CN": "身体活动",
    "sv": "Fysisk aktivitet"
  },
  "short": {
    "en": "Physical activity",
    "zh-CN": "身体活动",
    "sv": "Fysisk aktivitet"
  },
  "citations": [
    "31",
    "36"
  ],
  "evidenceStrength": "rct-meta",
  "association": {
    "targets": [
      "hrv"
    ],
    "direction": "up",
    "note": {
      "en": "HeartSteps walking prompts increased subsequent steps; a separate training meta-analysis found improved resting SDNN, RMSSD and HF.",
      "zh-CN": "步行提示增加步数；另一训练荟萃分析发现静息 SDNN、RMSSD 和 HF 改善。",
      "sv": "Gångpåminnelser ökade steg; en separat träningsmetaanalys fann förbättrat SDNN, RMSSD och HF i vila."
    }
  },
  "modelRole": "observation",
  "outputType": "load-context",
  "inputs": [
    "timestamp",
    "timezone",
    "device",
    "metric",
    "window",
    "quality"
  ],
  "evidence": {
    "en": "HeartSteps walking prompts increased subsequent steps; a separate training meta-analysis found improved resting SDNN, RMSSD and HF.",
    "zh-CN": "步行提示增加步数；另一训练荟萃分析发现静息 SDNN、RMSSD 和 HF 改善。",
    "sv": "Gångpåminnelser ökade steg; en separat träningsmetaanalys fann förbättrat SDNN, RMSSD och HF i vila."
  },
  "limits": {
    "en": "Prompt effects on steps do not establish an HRV recovery model.",
    "zh-CN": "步数干预不是 HRV 恢复模型。",
    "sv": "Stegeffekter validerar ingen HRV-återhämtningsmodell."
  },
  "proposedUse": {
    "en": "Retain activity load context; future prompts require intervention evaluation.",
    "zh-CN": "保留活动负荷背景，建议需未来干预验证。",
    "sv": "Behåll belastningskontext; framtida råd kräver interventionsprövning."
  },
  "existingModel": "HeartSteps centered and weighted least squares.",
  "forbiddenOutputs": []
};
