export default {
  "id": "hrv",
  "number": 1,
  "role": "observation",
  "names": {
    "en": "HRV",
    "zh-CN": "心率变异性",
    "sv": "HRV"
  },
  "short": {
    "en": "HRV",
    "zh-CN": "心率变异性",
    "sv": "HRV"
  },
  "citations": [
    "32",
    "35"
  ],
  "evidenceStrength": "guideline",
  "association": {
    "targets": [
      "hrv"
    ],
    "direction": "contextual",
    "note": {
      "en": "Physiology, behavior and acquisition context influence HRV; compatible acquisition and processing are essential.",
      "zh-CN": "HRV 受生理、行为及测量条件影响，必须保证采集可比。",
      "sv": "HRV påverkas av fysiologi, beteende och mätvillkor."
    }
  },
  "modelRole": "observation",
  "outputType": "quality-gated-observation",
  "inputs": [
    "timestamp",
    "timezone",
    "device",
    "metric",
    "window",
    "quality"
  ],
  "evidence": {
    "en": "Physiology, behavior and acquisition context influence HRV; compatible acquisition and processing are essential.",
    "zh-CN": "HRV 受生理、行为及测量条件影响，必须保证采集可比。",
    "sv": "HRV påverkas av fysiologi, beteende och mätvillkor."
  },
  "limits": {
    "en": "Different metrics, devices and recording windows are not interchangeable.",
    "zh-CN": "不同指标、设备和时间窗不可混用。",
    "sv": "Mått, apparater och mätfönster är inte utbytbara."
  },
  "proposedUse": {
    "en": "Use a personal longitudinal baseline with quality gating.",
    "zh-CN": "建立质量门控的个人纵向基线。",
    "sv": "Använd en personlig baslinje med kvalitetsgranskning."
  },
  "existingModel": "Feature extraction with NeuroKit2/pyHRV; not a recommendation model.",
  "forbiddenOutputs": []
};
