export default {
  "id": "sport",
  "number": 13,
  "role": "behavior",
  "names": {
    "en": "Sport & exercise",
    "zh-CN": "运动锻炼",
    "sv": "Träning"
  },
  "short": {
    "en": "Sport & exercise",
    "zh-CN": "运动锻炼",
    "sv": "Träning"
  },
  "citations": [
    "24",
    "25",
    "34"
  ],
  "evidenceStrength": "meta-obs",
  "association": {
    "targets": [
      "hrv"
    ],
    "direction": "up",
    "note": {
      "en": "HRV-guided training involved fewer hard sessions and improved vagal HRV (SMD 0.50); pooled fitness advantages were small and nonsignificant.",
      "zh-CN": "HRV 指导训练减少高强度次数；迷走 HRV 改善，体能优势小且不显著。",
      "sv": "HRV-styrd träning gav färre hårda pass och bättre vagal HRV; konditionsfördelar var små och inte signifikanta."
    }
  },
  "modelRole": "logged-exposure",
  "outputType": "personal-association",
  "inputs": [
    "explicit event logs",
    "comparable overnight RMSSD"
  ],
  "evidence": {
    "en": "HRV-guided training involved fewer hard sessions and improved vagal HRV (SMD 0.50); pooled fitness advantages were small and nonsignificant.",
    "zh-CN": "HRV 指导训练减少高强度次数；迷走 HRV 改善，体能优势小且不显著。",
    "sv": "HRV-styrd träning gav färre hårda pass och bättre vagal HRV; konditionsfördelar var små och inte signifikanta."
  },
  "limits": {
    "en": "Fitness benefits remain uncertain; FitRec models workout HR, not HRV recovery.",
    "zh-CN": "FitRec 研究运动心率而非 HRV 恢复。",
    "sv": "FitRec modellerar träningspuls, inte HRV-återhämtning."
  },
  "proposedUse": {
    "en": "Log workouts for delayed observational comparisons; future training rules require separate evaluation.",
    "zh-CN": "记录训练，描述延迟关联。",
    "sv": "Logga träning för fördröjda observationssamband."
  },
  "existingModel": "HRV-guided training rules; adjacent FitRec LSTM workout-response model.",
  "forbiddenOutputs": [],
  "evidenceDesigns": [
    {
      "design": "Controlled training trial",
      "citations": [
        "24"
      ],
      "detail": {
        "en": "HRV-guided training involved fewer hard sessions and improved vagal HRV (SMD 0.50); pooled fitness advantages were small and nonsignificant.",
        "zh-CN": "HRV 指导训练减少高强度次数；迷走 HRV 改善，体能优势小且不显著。",
        "sv": "HRV-styrd träning gav färre hårda pass och bättre vagal HRV; konditionsfördelar var små och inte signifikanta."
      }
    },
    {
      "design": "Systematic review and meta-analysis of HRV-guided training (not described as RCTs): vagal HRV SMD 0.50",
      "citations": [
        "25"
      ],
      "detail": {
        "en": "HRV-guided training involved fewer hard sessions and improved vagal HRV (SMD 0.50); pooled fitness advantages were small and nonsignificant.",
        "zh-CN": "HRV 指导训练减少高强度次数；迷走 HRV 改善，体能优势小且不显著。",
        "sv": "HRV-styrd träning gav färre hårda pass och bättre vagal HRV; konditionsfördelar var små och inte signifikanta."
      }
    },
    {
      "design": "Adjacent FitRec LSTM workout heart-rate response model",
      "citations": [
        "34"
      ],
      "detail": {
        "en": "HRV-guided training involved fewer hard sessions and improved vagal HRV (SMD 0.50); pooled fitness advantages were small and nonsignificant.",
        "zh-CN": "HRV 指导训练减少高强度次数；迷走 HRV 改善，体能优势小且不显著。",
        "sv": "HRV-styrd träning gav färre hårda pass och bättre vagal HRV; konditionsfördelar var små och inte signifikanta."
      }
    }
  ]
};
