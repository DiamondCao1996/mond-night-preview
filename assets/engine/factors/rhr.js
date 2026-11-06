export default {
  "id": "rhr",
  "number": 2,
  "role": "observation",
  "names": {
    "en": "Resting heart rate",
    "zh-CN": "静息心率",
    "sv": "Vilopuls"
  },
  "short": {
    "en": "Resting heart rate",
    "zh-CN": "静息心率",
    "sv": "Vilopuls"
  },
  "citations": [
    "3"
  ],
  "evidenceStrength": "observational",
  "association": {
    "targets": [
      "rhr"
    ],
    "direction": "contextual",
    "note": {
      "en": "A wearable cohort of 92,457 adults showed about 2 bpm seasonal RHR variation, highest in early January and lowest in late July.",
      "zh-CN": "大型穿戴队列的静息心率季节变化约为 2 次/分，一月初最高，七月底最低。",
      "sv": "En stor kohort visade cirka 2 slag/min säsongsvariation, högst tidigt i januari och lägst sent i juli."
    }
  },
  "modelRole": "observation",
  "outputType": "joint-trajectory",
  "inputs": [
    "timestamp",
    "timezone",
    "device",
    "metric",
    "window",
    "quality"
  ],
  "evidence": {
    "en": "A wearable cohort of 92,457 adults showed about 2 bpm seasonal RHR variation, highest in early January and lowest in late July.",
    "zh-CN": "大型穿戴队列的静息心率季节变化约为 2 次/分，一月初最高，七月底最低。",
    "sv": "En stor kohort visade cirka 2 slag/min säsongsvariation, högst tidigt i januari och lägst sent i juli."
  },
  "limits": {
    "en": "The descriptive cohort does not validate causes of individual changes.",
    "zh-CN": "描述性关联不能解释个人变化原因。",
    "sv": "Beskrivande samband förklarar inte individuella orsaker."
  },
  "proposedUse": {
    "en": "Describe joint HRV/RHR trajectories with uncertainty.",
    "zh-CN": "联合描述 HRV 与静息心率及不确定性。",
    "sv": "Beskriv gemensamma HRV- och pulsförlopp med osäkerhet."
  },
  "existingModel": "Within-person longitudinal descriptive baselines.",
  "forbiddenOutputs": [],
  "evidenceDesigns": [
    {
      "design": "Longitudinal wearable cohort",
      "citations": [
        "3"
      ],
      "detail": {
        "en": "A wearable cohort of 92,457 adults showed about 2 bpm seasonal RHR variation, highest in early January and lowest in late July.",
        "zh-CN": "大型穿戴队列的静息心率季节变化约为 2 次/分，一月初最高，七月底最低。",
        "sv": "En stor kohort visade cirka 2 slag/min säsongsvariation, högst tidigt i januari och lägst sent i juli."
      }
    }
  ]
};
