import { Request, Response } from 'express';
import { MockTest, Question, TestSubmission, User } from '../models/index.ts';

// Fisher-Yates array shuffle helper
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function getMockTests(req: Request, res: Response) {
  try {
    const { category, topic } = req.query;
    const whereClause: any = {};
    if (category && category !== 'all') {
      whereClause.category = category;
    }
    if (topic && topic !== 'all') {
      whereClause.topic = topic;
    }

    const tests = await MockTest.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });

    return res.json(tests);
  } catch (error) {
    console.error('Error fetching mock tests:', error);
    return res.status(500).json({ error: 'Failed to fetch mock tests' });
  }
}

export async function getMockTestById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const shuffle = req.query.shuffle === 'true' || req.query.shuffle === '1';

    const test = await MockTest.findByPk(id, {
      include: [
        {
          model: Question,
          as: 'questions',
        },
      ],
    });

    if (!test) {
      return res.status(404).json({ error: 'Mock test not found' });
    }

    let questions = (test as any).questions || [];

    // Format questions and optionally shuffle options
    let formattedQuestions = questions.map((q: any) => {
      const rawOptionsEn = typeof q.optionsEnglish === 'string' ? JSON.parse(q.optionsEnglish) : q.optionsEnglish;
      const rawOptionsHi = typeof q.optionsHindi === 'string' ? JSON.parse(q.optionsHindi) : q.optionsHindi;
      const correctIdx = q.correctAnswerIndex;

      if (!shuffle) {
        return {
          id: q.id,
          questionTextEnglish: q.questionTextEnglish,
          questionTextHindi: q.questionTextHindi,
          optionsEnglish: rawOptionsEn,
          optionsHindi: rawOptionsHi,
          topic: q.topic,
          subtopic: q.subtopic,
          difficulty: q.difficulty,
          // note: correctAnswerIndex is omitted during exam mode to prevent cheating via devtools
        };
      }

      // Shuffle options while preserving correct answer mapping
      const pairedOptions: Array<{
        en: string;
        hi: string;
        isCorrect: boolean;
        originalIndex: number;
      }> = rawOptionsEn.map((en: string, idx: number) => ({
        en,
        hi: rawOptionsHi[idx] || en,
        isCorrect: idx === correctIdx,
        originalIndex: idx,
      }));

      const shuffledPairs = shuffleArray(pairedOptions);
      const newCorrectIndex = shuffledPairs.findIndex((p) => p.isCorrect);

      return {
        id: q.id,
        questionTextEnglish: q.questionTextEnglish,
        questionTextHindi: q.questionTextHindi,
        optionsEnglish: shuffledPairs.map((p) => p.en),
        optionsHindi: shuffledPairs.map((p) => p.hi),
        topic: q.topic,
        subtopic: q.subtopic,
        difficulty: q.difficulty,
        _shuffledMap: shuffledPairs.map((p) => p.originalIndex),
        _newCorrectIndex: newCorrectIndex,
      };
    });

    if (shuffle) {
      formattedQuestions = shuffleArray(formattedQuestions);
    }

    const baseObj = (test as any).toJSON ? (test as any).toJSON() : test;
    const responseData = {
      ...baseObj,
      questions: formattedQuestions,
    };

    return res.json(responseData);
  } catch (error) {
    console.error('Error fetching mock test details:', error);
    return res.status(500).json({ error: 'Failed to fetch mock test details' });
  }
}

export async function submitMockTest(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      userId = 'user-primary-1',
      userAnswers = {}, // { [questionId]: selectedOptionIndex }
      timeSpentSeconds = 0,
      answerMapping = {}, // Optional mapping if client had shuffled options
    } = req.body;

    const test = await MockTest.findByPk(id, {
      include: [{ model: Question, as: 'questions' }],
    });

    if (!test) {
      return res.status(404).json({ error: 'Mock test not found' });
    }

    const questions: any[] = (test as any).questions || [];
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    const topicStats: Record<string, { total: number; correct: number; incorrect: number; unattempted: number }> = {};

    questions.forEach((q) => {
      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { total: 0, correct: 0, incorrect: 0, unattempted: 0 };
      }
      topicStats[q.topic].total++;

      const chosenOption = userAnswers[q.id];
      // Check if client provided mapped original index
      const effectiveChosenOption =
        answerMapping && answerMapping[q.id] !== undefined
          ? answerMapping[q.id]
          : chosenOption;

      if (effectiveChosenOption === undefined || effectiveChosenOption === null || effectiveChosenOption === -1) {
        unattemptedCount++;
        topicStats[q.topic].unattempted++;
      } else if (effectiveChosenOption === q.correctAnswerIndex) {
        correctCount++;
        topicStats[q.topic].correct++;
      } else {
        incorrectCount++;
        topicStats[q.topic].incorrect++;
      }
    });

    const totalQuestions = questions.length;
    const score = correctCount;
    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const passed = score >= test.passingMarks;

    const topicWiseBreakdown: Record<string, any> = {};
    const weakTopics: string[] = [];

    Object.entries(topicStats).forEach(([topic, s]) => {
      const topicPct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
      const isWeak = topicPct < 50;
      if (isWeak) {
        weakTopics.push(topic);
      }
      topicWiseBreakdown[topic] = {
        topic,
        total: s.total,
        correct: s.correct,
        incorrect: s.incorrect,
        unattempted: s.unattempted,
        percentage: topicPct,
        isWeakArea: isWeak,
      };
    });

    const submission = await TestSubmission.create({
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId,
      mockTestId: test.id,
      testTitle: test.title,
      score,
      totalQuestions,
      percentage,
      correctCount,
      incorrectCount,
      unattemptedCount,
      timeSpentSeconds: Number(timeSpentSeconds) || 0,
      passed,
      topicWiseBreakdown,
      userAnswers,
    });

    return res.status(201).json({
      submission,
      weakTopics,
      passingMarks: test.passingMarks,
    });
  } catch (error) {
    console.error('Error submitting mock test:', error);
    return res.status(500).json({ error: 'Failed to evaluate and submit mock test' });
  }
}

export async function getTestSubmissions(req: Request, res: Response) {
  try {
    const userId = (req.query.userId as string) || 'user-primary-1';
    const submissions = await TestSubmission.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
    return res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return res.status(500).json({ error: 'Failed to fetch test submissions' });
  }
}

export async function getSubmissionReview(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const submission = await TestSubmission.findByPk(id);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const test = await MockTest.findByPk(submission.mockTestId, {
      include: [{ model: Question, as: 'questions' }],
    });

    const questions = test ? (test as any).questions || [] : [];
    const userAnswers = typeof submission.userAnswers === 'string'
      ? JSON.parse(submission.userAnswers)
      : submission.userAnswers || {};

    const reviewQuestions = questions.map((q: any) => {
      const selectedIndex = userAnswers[q.id];
      const isCorrect = selectedIndex === q.correctAnswerIndex;
      const isAttempted = selectedIndex !== undefined && selectedIndex !== null && selectedIndex !== -1;

      return {
        id: q.id,
        questionTextEnglish: q.questionTextEnglish,
        questionTextHindi: q.questionTextHindi,
        optionsEnglish: typeof q.optionsEnglish === 'string' ? JSON.parse(q.optionsEnglish) : q.optionsEnglish,
        optionsHindi: typeof q.optionsHindi === 'string' ? JSON.parse(q.optionsHindi) : q.optionsHindi,
        correctAnswerIndex: q.correctAnswerIndex,
        userAnswerIndex: selectedIndex ?? -1,
        isCorrect,
        isAttempted,
        explanationEnglish: q.explanationEnglish,
        explanationHindi: q.explanationHindi,
        topic: q.topic,
        subtopic: q.subtopic,
      };
    });

    return res.json({
      submission,
      reviewQuestions,
      test,
    });
  } catch (error) {
    console.error('Error fetching submission review:', error);
    return res.status(500).json({ error: 'Failed to fetch submission review' });
  }
}
