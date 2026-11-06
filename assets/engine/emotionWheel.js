/**
 * Emotion compass vocabulary transcribed from a high-resolution photo of
 * the printed three-ring wheel (clockwise from 恐惧).
 *
 * Level-2 corrections vs an earlier guess: 担心 is an outer (level-3) word
 * under 焦虑, not a fear level-2 word; 受到威胁 is readable; 愤怒's first
 * three level-2 words are readable; 悲伤 uses 脆弱 (not 郁闷); 快乐 uses
 * 玩要的 (not 玩趣的). Every label below was read from the photo; nothing
 * is invented. No node is marked uncertain.
 *
 * Duplicate surface words (失望, 虚弱, 无能为力, 厌恶, …) keep distinct ids
 * because they sit under different parents.
 */
function node(id, zh, en, sv, extra = {}) {
  return {id, zh, en, sv, uncertain: false, children: extra.children || [], ...extra};
}

export const EMOTION_WHEEL = [
  node('fear', '恐惧', 'Fear', 'Rädsla', {
    color: '#8ebdd9',
    children: [
      node('afraid', '害怕', 'Afraid', 'Rädd', {
        children: [
          node('helpless', '无助', 'Helpless', 'Hjälplös'),
          node('frightened', '惊吓', 'Frightened', 'Skrämd'),
        ],
      }),
      node('anxious', '焦虑', 'Anxious', 'Ängslig', {
        children: [
          node('overruled', '被否决', 'Overruled', 'Nedröstad'),
          node('worried', '担心', 'Worried', 'Orolig'),
        ],
      }),
      node('insecure', '无安全感', 'Insecure', 'Otrygg', {
        children: [
          node('inadequate', '不胜任感', 'Inadequate', 'Otillräcklig'),
          node('inferior', '次等感', 'Inferior', 'Underlägsen'),
        ],
      }),
      node('fear-weak', '虚弱', 'Weak', 'Svag', {
        children: [
          node('worthless', '无价值', 'Worthless', 'Värdelös'),
          node('insignificant', '无关紧要', 'Insignificant', 'Obetydlig'),
        ],
      }),
      node('rejected', '被拒绝', 'Rejected', 'Avvisad', {
        children: [
          node('excluded', '被排斥', 'Excluded', 'Utesluten'),
          node('persecuted', '受迫害', 'Persecuted', 'Förföljd'),
        ],
      }),
      node('threatened', '受到威胁', 'Threatened', 'Hotad', {
        children: [
          node('neurotic', '神经质', 'Neurotic', 'Neurotisk'),
          node('exposed', '暴露感', 'Exposed', 'Blottad'),
        ],
      }),
    ],
  }),
  node('anger', '愤怒', 'Anger', 'Ilska', {
    color: '#e89a5b',
    children: [
      node('anger-disappointed', '失望', 'Disappointed', 'Besviken', {
        children: [
          node('betrayed', '被背叛', 'Betrayed', 'Förrådd'),
          node('resentful', '忿恨', 'Resentful', 'Förbittrad'),
        ],
      }),
      node('humiliated', '受辱', 'Humiliated', 'Förödmjukad', {
        children: [
          node('belittled', '被轻视', 'Belittled', 'Förminskad'),
          node('mocked', '被嘲笑', 'Mocked', 'Hånad'),
        ],
      }),
      node('hurt', '痛苦', 'Hurt', 'Sårad', {
        children: [
          node('indignant', '愤愤不平', 'Indignant', 'Upprörd'),
          node('profaned', '被亵渎', 'Violated', 'Kränkt'),
        ],
      }),
      node('angry', '生气', 'Angry', 'Arg', {
        children: [
          node('furious', '狂怒', 'Furious', 'Rasande'),
          node('jealous', '嫉妒', 'Jealous', 'Avundsjuk'),
        ],
      }),
      node('aggressive', '侵略性', 'Aggressive', 'Aggressiv', {
        children: [
          node('provoked', '被激怒', 'Provoked', 'Provokad'),
          node('hostile', '敌意', 'Hostile', 'Fientlig'),
        ],
      }),
      node('frustrated', '挫败感', 'Frustrated', 'Frustrerad', {
        children: [
          node('jealous-anger', '嫉妒愤怒', 'Jealous anger', 'Avundsraseri'),
          node('annoyed', '烦恼', 'Annoyed', 'Irriterad'),
        ],
      }),
      node('distant', '疏离', 'Distant', 'Avståndstagande', {
        children: [
          node('withdrawn', '孤僻', 'Withdrawn', 'Tillbakadragen'),
          node('numb', '麻木', 'Numb', 'Avdomnad'),
        ],
      }),
      node('critical', '挑剔', 'Critical', 'Kritisk', {
        children: [
          node('contemptuous', '轻蔑', 'Contemptuous', 'Föraktfull'),
          node('disdainful', '鄙视', 'Disdainful', 'Nedsättande'),
        ],
      }),
    ],
  }),
  node('disgust', '厌恶', 'Disgust', 'Avsky', {
    color: '#e59ab8',
    children: [
      node('opposed', '反对', 'Opposed', 'Avvisande', {
        children: [
          node('judgmental', '评判', 'Judgmental', 'Dömande'),
          node('embarrassed', '尴尬', 'Embarrassed', 'Generad'),
        ],
      }),
      node('disgust-disappointed', '失望', 'Disappointed', 'Besviken', {
        children: [
          node('appalled', '惊骇', 'Appalled', 'Chockad'),
          node('revolted', '厌恶', 'Disgusted', 'Äcklad'),
        ],
      }),
      node('awful', '糟糕', 'Awful', 'Förfärlig', {
        children: [
          node('nauseated', '恶心', 'Nauseated', 'Illamående'),
          node('detestable', '可憎', 'Detestable', 'Avskyvärd'),
        ],
      }),
      node('repulsed', '反感', 'Repulsed', 'Frånstött', {
        children: [
          node('horrified', '惊恐', 'Horrified', 'Förskräckt'),
          node('hesitant', '犹豫', 'Hesitant', 'Tveksam'),
        ],
      }),
    ],
  }),
  node('sadness', '悲伤', 'Sadness', 'Sorg', {
    color: '#b7a8d9',
    children: [
      node('sadness-weak', '虚弱', 'Weak', 'Svag', {
        children: [
          node('embarrassed-sad', '尴尬的', 'Embarrassed', 'Generad'),
          node('disappointed-sad', '失望的', 'Disappointed', 'Besviken'),
        ],
      }),
      node('grief', '悲痛', 'Grief', 'Sorgsen', {
        children: [
          node('self-abasing', '自卑的', 'Inferior', 'Mindre värd'),
          node('empty', '空虚的', 'Empty', 'Tom'),
        ],
      }),
      node('powerless', '无能为力', 'Powerless', 'Maktlös', {
        children: [
          node('remorseful', '懊悔的', 'Remorseful', 'Ångerfull'),
          node('unable', '力不从心', 'Overextended', 'Otillräcklig kraft'),
        ],
      }),
      node('hopeless', '绝望', 'Hopeless', 'Hopplös', {
        children: [
          node('powerless-sad', '无能为力', 'Powerless', 'Maktlös'),
          node('ashamed', '感到羞耻', 'Ashamed', 'Skamsen'),
        ],
      }),
      node('vulnerable', '脆弱', 'Vulnerable', 'Sårbar', {
        children: [
          node('guilty', '有罪恶感', 'Guilty', 'Skuldig'),
          node('wounded', '受伤', 'Hurt', 'Sårad'),
        ],
      }),
      node('lonely', '孤独', 'Lonely', 'Ensam', {
        children: [
          node('abandoned', '被抛弃', 'Abandoned', 'Övergiven'),
          node('isolated', '被孤立', 'Isolated', 'Isolerad'),
        ],
      }),
    ],
  }),
  node('joy', '快乐', 'Joy', 'Glädje', {
    color: '#9dc87c',
    children: [
      node('optimistic', '乐观的', 'Optimistic', 'Optimistisk', {
        children: [
          node('inspired', '受到启发的', 'Inspired', 'Inspirerad'),
          node('hopeful', '充满希望的', 'Hopeful', 'Hoppfylld'),
        ],
      }),
      node('trusting', '信任的', 'Trusting', 'Tillitsfull', {
        children: [
          node('intimate', '亲密的', 'Intimate', 'Närstående'),
          node('sensitive', '敏感的', 'Sensitive', 'Känslig'),
        ],
      }),
      node('peaceful', '和平的', 'Peaceful', 'Fridfull', {
        children: [
          node('thankful', '感激的', 'Thankful', 'Tacksam'),
          node('loving', '充满爱的', 'Loving', 'Kärleksfull'),
        ],
      }),
      node('powerful', '强大的', 'Powerful', 'Stark', {
        children: [
          node('creative', '有创造力的', 'Creative', 'Kreativ'),
          node('courageous', '勇敢的', 'Courageous', 'Modig'),
        ],
      }),
      node('accepted', '被接受的', 'Accepted', 'Accepterad', {
        children: [
          node('valued', '有价值的', 'Valued', 'Värderad'),
          node('respected', '受尊敬的', 'Respected', 'Respekterad'),
        ],
      }),
      node('proud', '骄傲的', 'Proud', 'Stolt', {
        children: [
          node('confident', '自信的', 'Confident', 'Självsäker'),
          node('successful', '如愿以偿', 'Fulfilled', 'Uppfylld'),
        ],
      }),
      node('interested', '感兴趣的', 'Interested', 'Intresserad', {
        children: [
          node('inquisitive', '好问的', 'Inquisitive', 'Frågvis'),
          node('curious', '好奇的', 'Curious', 'Nyfiken'),
        ],
      }),
      node('content', '满足的', 'Content', 'Tillfreds', {
        children: [
          node('joyful', '愉快的', 'Joyful', 'Glad'),
          node('free', '自由的', 'Free', 'Fri'),
        ],
      }),
      node('playful', '玩要的', 'Playful', 'Lekfull', {
        children: [
          node('cheeky', '顽皮的', 'Cheeky', 'Okynnig'),
          node('aroused', '兴奋的', 'Excited', 'Uppspelt'),
        ],
      }),
    ],
  }),
  node('surprise', '惊讶', 'Surprise', 'Förvåning', {
    color: '#f0b8c6',
    children: [
      node('excited', '激动的', 'Excited', 'Upprymd', {
        children: [
          node('energetic', '精力充沛的', 'Energetic', 'Energisk'),
          node('eager', '渴望的', 'Eager', 'Ivrig'),
        ],
      }),
      node('amazed', '惊奇的', 'Amazed', 'Häpen', {
        children: [
          node('awe', '敬畏的', 'Awe', 'Vördnadsfull'),
          node('astonished', '惊讶的', 'Astonished', 'Förvånad'),
        ],
      }),
      node('confused', '迷惑的', 'Confused', 'Förvirrad', {
        children: [
          node('perplexed', '困惑的', 'Perplexed', 'Villrådig'),
          node('disillusioned', '幻灭的', 'Disillusioned', 'Desillusionerad'),
        ],
      }),
      node('startled', '吃惊的', 'Startled', 'Överrumplad', {
        children: [
          node('dismayed', '沮丧的', 'Dismayed', 'Bestört'),
          node('shocked', '震惊的', 'Shocked', 'Chockad'),
        ],
      }),
    ],
  }),
  node('low', '消极', 'Low', 'Låg', {
    color: '#e8d36a',
    children: [
      node('tired', '疲倦的', 'Tired', 'Trött', {
        children: [
          node('unfocused', '注意力不集中', 'Unfocused', 'Ofokuserad'),
          node('groggy', '昏昏沉沉的', 'Groggy', 'Dåsig'),
        ],
      }),
      node('tense', '紧张的', 'Tense', 'Spänd', {
        children: [
          node('out-of-control', '失控的', 'Out of control', 'Utom kontroll'),
          node('at-a-loss', '无所适从感', 'At a loss', 'Vilsen'),
        ],
      }),
      node('busy', '忙碌的', 'Busy', 'Upptagen', {
        children: [
          node('rushed', '匆忙感', 'Rushed', 'Jäktad'),
          node('pressured', '有压力', 'Pressured', 'Pressad'),
        ],
      }),
      node('bored', '无聊的', 'Bored', 'Uttråkad', {
        children: [
          node('indifferent', '无动于衷', 'Indifferent', 'Likgiltig'),
          node('apathetic', '冷漠的', 'Apathetic', 'Apatisk'),
        ],
      }),
    ],
  }),
];

export function findEmotion(id, nodes = EMOTION_WHEEL) {
  for (const n of nodes) {
    if (n.id === id) return n;
    const hit = n.children && n.children.length ? findEmotion(id, n.children) : null;
    if (hit) return hit;
  }
  return null;
}

export function flattenWheel(nodes = EMOTION_WHEEL, depth = 0, parent = null) {
  const out = [];
  for (const n of nodes) {
    out.push({...n, depth, parentId: parent ? parent.id : null});
    if (n.children && n.children.length) {
      out.push(...flattenWheel(n.children, depth + 1, n));
    }
  }
  return out;
}

export function wheelCounts(nodes = EMOTION_WHEEL) {
  const flat = flattenWheel(nodes);
  return {
    level1: flat.filter((n) => n.depth === 0).length,
    level2: flat.filter((n) => n.depth === 1).length,
    level3: flat.filter((n) => n.depth === 2).length,
  };
}
