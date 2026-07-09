import { prepareMockExam } from "@/lib/mock-exam/prepare-exam";

export type ExamSection = "listening" | "reading" | "writing";

export type MockExamQuestion = {
  id: string;
  section: ExamSection;
  skill: string;
  stem: string;
  /** Chinese audio script for listening items (not shown as text during the exam). */
  audioText?: string;
  choices?: string[];
  answerIndex?: number;
};

const HSK3_MOCK_EXAM_BASE: MockExamQuestion[] = [
  {
    id: "l1",
    section: "listening",
    skill: "listening",
    audioText: "你明天几点去学校？",
    stem: "What time will you go to school tomorrow?",
    choices: ["八点", "明天", "学校", "几点"],
    answerIndex: 0,
  },
  {
    id: "l2",
    section: "listening",
    skill: "listening",
    audioText: "这本书比那本书贵。",
    stem: "Which book is more expensive?",
    choices: ["这本书", "那本书", "一样贵", "很便宜"],
    answerIndex: 0,
  },
  {
    id: "l3",
    section: "listening",
    skill: "listening",
    audioText: "我打算周末去爬山。",
    stem: "What does the speaker plan to do on the weekend?",
    choices: ["去爬山", "去游泳", "看电影", "写作业"],
    answerIndex: 0,
  },
  {
    id: "l4",
    section: "listening",
    skill: "listening",
    audioText: "请把窗户打开，房间里太热了。",
    stem: "Why does the speaker want the window opened?",
    choices: ["房间里太热了", "外面下雨了", "要睡觉了", "有人敲门"],
    answerIndex: 0,
  },
  {
    id: "l5",
    section: "listening",
    skill: "listening",
    audioText: "他刚到北京，还不太习惯这里的生活。",
    stem: "How long has he been in Beijing?",
    choices: ["刚到", "十年了", "还没去", "每年都去"],
    answerIndex: 0,
  },
  {
    id: "r1",
    section: "reading",
    skill: "vocabulary",
    stem: "选择正确的词语填空：我每天早上都要___一杯牛奶。",
    choices: ["喝", "吃", "看", "听"],
    answerIndex: 0,
  },
  {
    id: "r2",
    section: "reading",
    skill: "vocabulary",
    stem: "选择正确的词语填空：这条路很___，开车要小心。",
    choices: ["滑", "宽", "短", "新"],
    answerIndex: 0,
  },
  {
    id: "r3",
    section: "reading",
    skill: "grammar",
    stem: "选择正确的句子：",
    choices: [
      "我已经看过这部电影了",
      "我已经看了这部电影",
      "我已经正在看这部电影",
      "我已经要看了这部电影",
    ],
    answerIndex: 0,
  },
  {
    id: "r4",
    section: "reading",
    skill: "grammar",
    stem: "选择正确的句子：",
    choices: [
      "他把作业做完了",
      "他做完作业把了",
      "他把做完作业了",
      "他做完把作业了",
    ],
    answerIndex: 0,
  },
  {
    id: "r5",
    section: "reading",
    skill: "reading",
    stem: "短文：小李喜欢运动。他每天早上跑步，周末常常和朋友打篮球。\n小李周末常常做什么？",
    choices: ["跑步", "打篮球", "游泳", "爬山"],
    answerIndex: 1,
  },
  {
    id: "w1",
    section: "writing",
    skill: "writing",
    stem: "用不少于 30 个汉字写一段话，介绍你最喜欢的运动，并说明为什么喜欢。（MVP: submit your answer; auto-scoring is Pro-only.）",
  },
];

export const HSK3_MOCK_EXAM = prepareMockExam(HSK3_MOCK_EXAM_BASE);

export const HSK3_MOCK_EXAM_MCQ_COUNT = HSK3_MOCK_EXAM.filter(
  (q) => q.answerIndex !== undefined,
).length;
