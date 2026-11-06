export default {
  "id": "season",
  "number": 18,
  "role": "temporal",
  "names": {
    "en": "Season",
    "zh-CN": "季节",
    "sv": "Årstid"
  },
  "short": {
    "en": "Season",
    "zh-CN": "季节",
    "sv": "Årstid"
  },
  "citations": [
    "2",
    "3"
  ],
  "evidenceStrength": "observational",
  "association": {
    "targets": [
      "hrv",
      "rhr"
    ],
    "direction": "mixed",
    "note": {
      "en": "Seasonal HRV differences were reported with conflicting direction statements; a large wearable cohort showed about 2 bpm seasonal RHR variation.",
      "zh-CN": "季节 HRV 报告方向不一致；大型队列静息心率季节差约 2 次/分。",
      "sv": "Säsongsfynd för HRV hade motstridiga riktningar; vilopuls varierade cirka 2 slag/min i en stor kohort."
    }
  },
  "modelRole": "temporal-context",
  "outputType": "temporal-illustration",
  "inputs": [
    "timestamp",
    "timezone",
    "device",
    "metric",
    "window",
    "quality"
  ],
  "evidence": {
    "en": "Seasonal HRV differences were reported with conflicting direction statements; a large wearable cohort showed about 2 bpm seasonal RHR variation.",
    "zh-CN": "季节 HRV 报告方向不一致；大型队列静息心率季节差约 2 次/分。",
    "sv": "Säsongsfynd för HRV hade motstridiga riktningar; vilopuls varierade cirka 2 slag/min i en stor kohort."
  },
  "limits": {
    "en": "These findings do not establish a universal HRV correction; short pilots cannot identify annual rhythms.",
    "zh-CN": "不是通用 HRV 校正，短期数据不足以估计全年规律。",
    "sv": "Ingen universell HRV-korrigering; korta pilotstudier visar inte årsmönster."
  },
  "proposedUse": {
    "en": "Use annual cyclical context with geography, climate and personal trajectories when available.",
    "zh-CN": "结合地理、气候及个人轨迹作年度背景。",
    "sv": "Använd årskontext med geografi, klimat och personliga förlopp."
  },
  "existingModel": "Paired seasonal comparisons and longitudinal RHR summaries.",
  "forbiddenOutputs": []
};
