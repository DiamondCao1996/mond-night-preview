export default {
  "id": "dailyHabits",
  "number": 12,
  "role": "behavior",
  "names": {
    "en": "Daily habits",
    "zh-CN": "日常习惯",
    "sv": "Vardagsvanor"
  },
  "short": {
    "en": "Daily habits",
    "zh-CN": "日常习惯",
    "sv": "Vardagsvanor"
  },
  "citations": [
    "20",
    "22"
  ],
  "evidenceStrength": "meta-obs",
  "association": {
    "targets": [
      "hrv"
    ],
    "direction": "mixed",
    "note": {
      "en": "Logged alcohol was associated with dose-dependent impaired early-night recovery; slow breathing increased vagally mediated HRV in a meta-analysis.",
      "zh-CN": "饮酒与早夜恢复受损存在剂量关联；慢呼吸可提高迷走相关 HRV。",
      "sv": "Alkohol korrelerade dosberoende med sämre tidig nattlig återhämtning; långsam andning ökade vagal HRV."
    }
  },
  "modelRole": "logged-exposure",
  "outputType": "personal-association",
  "inputs": [
    "explicit event logs",
    "comparable overnight RMSSD"
  ],
  "evidence": {
    "en": "Logged alcohol was associated with dose-dependent impaired early-night recovery; slow breathing increased vagally mediated HRV in a meta-analysis.",
    "zh-CN": "饮酒与早夜恢复受损存在剂量关联；慢呼吸可提高迷走相关 HRV。",
    "sv": "Alkohol korrelerade dosberoende med sämre tidig nattlig återhämtning; långsam andning ökade vagal HRV."
  },
  "limits": {
    "en": "HRV cannot identify alcohol or a specific behavior; paced breathing must remain separate from overnight measurements.",
    "zh-CN": "HRV 不能识别饮酒等行为，慢呼吸测量不能与整夜混用。",
    "sv": "HRV kan inte identifiera alkohol; andningsmätningar hålls separata."
  },
  "proposedUse": {
    "en": "Compare explicitly logged exposures, with intervention testing still required.",
    "zh-CN": "仅比较明确记录的暴露，仍需干预验证。",
    "sv": "Jämför bara uttryckligen loggade exponeringar."
  },
  "existingModel": "Within-person exposure comparisons and intervention meta-analysis.",
  "forbiddenOutputs": [],
  "evidenceDesigns": [
    {
      "design": "Within-person observational analysis: alcohol impaired early-night recovery",
      "citations": [
        "20"
      ],
      "detail": {
        "en": "Logged alcohol was associated with dose-dependent impaired early-night recovery; slow breathing increased vagally mediated HRV in a meta-analysis.",
        "zh-CN": "饮酒与早夜恢复受损存在剂量关联；慢呼吸可提高迷走相关 HRV。",
        "sv": "Alkohol korrelerade dosberoende med sämre tidig nattlig återhämtning; långsam andning ökade vagal HRV."
      }
    },
    {
      "design": "Systematic review and meta-analysis of slow breathing (not described as RCTs): increased vagal HRV",
      "citations": [
        "22"
      ],
      "detail": {
        "en": "Logged alcohol was associated with dose-dependent impaired early-night recovery; slow breathing increased vagally mediated HRV in a meta-analysis.",
        "zh-CN": "饮酒与早夜恢复受损存在剂量关联；慢呼吸可提高迷走相关 HRV。",
        "sv": "Alkohol korrelerade dosberoende med sämre tidig nattlig återhämtning; långsam andning ökade vagal HRV."
      }
    }
  ]
};
