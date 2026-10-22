import { Request, Response } from 'express';
import { Passage, TypingPractice, User } from '../models/index.ts';

export async function getPassages(req: Request, res: Response) {
  try {
    const { language, difficulty } = req.query;
    const whereClause: any = {};
    if (language && language !== 'all') {
      whereClause.language = language;
    }
    if (difficulty && difficulty !== 'all') {
      whereClause.difficulty = difficulty;
    }

    const passages = await Passage.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
    });
    return res.json(passages);
  } catch (error) {
    console.error('Error fetching passages:', error);
    return res.status(500).json({ error: 'Failed to fetch passages' });
  }
}

export async function getPassageById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const passage = await Passage.findByPk(id);
    if (!passage) {
      return res.status(404).json({ error: 'Passage not found' });
    }
    return res.json(passage);
  } catch (error) {
    console.error('Error fetching passage:', error);
    return res.status(500).json({ error: 'Failed to fetch passage' });
  }
}

export async function submitTypingResult(req: Request, res: Response) {
  try {
    const {
      userId = 'user-primary-1',
      passageId,
      passageTitle,
      language,
      script = 'english',
      durationMinutes,
      timeSpentSeconds,
      grossWpm,
      netWpm,
      cpm,
      accuracy,
      correctWords,
      incorrectWords,
      correctCharacters,
      incorrectCharacters,
      backspaceCount,
      totalKeystrokes,
      errorDetails,
    } = req.body;

    // Validate required fields
    if (!passageTitle || !language || timeSpentSeconds === undefined) {
      return res.status(400).json({ error: 'Missing required typing session parameters' });
    }

    const practice = await TypingPractice.create({
      id: `tp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      userId,
      passageId,
      passageTitle,
      language,
      script,
      durationMinutes: Number(durationMinutes) || 5,
      timeSpentSeconds: Number(timeSpentSeconds) || 60,
      grossWpm: Math.round(Number(grossWpm) || 0),
      netWpm: Math.round(Number(netWpm) || 0),
      cpm: Math.round(Number(cpm) || 0),
      accuracy: Math.round((Number(accuracy) || 0) * 10) / 10,
      correctWords: Number(correctWords) || 0,
      incorrectWords: Number(incorrectWords) || 0,
      correctCharacters: Number(correctCharacters) || 0,
      incorrectCharacters: Number(incorrectCharacters) || 0,
      backspaceCount: Number(backspaceCount) || 0,
      totalKeystrokes: Number(totalKeystrokes) || 0,
      errorDetails: typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails || {}),
    });

    return res.status(201).json(practice);
  } catch (error) {
    console.error('Error saving typing result:', error);
    return res.status(500).json({ error: 'Failed to save typing practice result' });
  }
}

export async function getTypingHistory(req: Request, res: Response) {
  try {
    const userId = (req.query.userId as string) || 'user-primary-1';
    const language = req.query.language as string;

    const whereClause: any = { userId };
    if (language && language !== 'all') {
      whereClause.language = language;
    }

    const history = await TypingPractice.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    return res.json(history);
  } catch (error) {
    console.error('Error fetching typing history:', error);
    return res.status(500).json({ error: 'Failed to fetch typing history' });
  }
}

export async function getTypingAnalytics(req: Request, res: Response) {
  try {
    const userId = (req.query.userId as string) || 'user-primary-1';

    const allSessions = await TypingPractice.findAll({
      where: { userId },
      order: [['createdAt', 'ASC']],
    });

    const hindiSessions = allSessions.filter((s) => s.language === 'hindi');
    const englishSessions = allSessions.filter((s) => s.language === 'english');

    const calcStats = (sessions: any[]) => {
      if (sessions.length === 0) {
        return {
          totalTests: 0,
          avgNetWpm: 0,
          maxNetWpm: 0,
          avgAccuracy: 0,
          avgGrossWpm: 0,
          avgCpm: 0,
          avgBackspace: 0,
          cpctQualified: false, // Hindi: 20 WPM, English: 30 WPM
        };
      }
      const totalTests = sessions.length;
      const sumNetWpm = sessions.reduce((acc, s) => acc + s.netWpm, 0);
      const maxNetWpm = Math.max(...sessions.map((s) => s.netWpm));
      const sumGross = sessions.reduce((acc, s) => acc + s.grossWpm, 0);
      const sumAccuracy = sessions.reduce((acc, s) => acc + s.accuracy, 0);
      const sumCpm = sessions.reduce((acc, s) => acc + s.cpm, 0);
      const sumBackspace = sessions.reduce((acc, s) => acc + s.backspaceCount, 0);

      return {
        totalTests,
        avgNetWpm: Math.round(sumNetWpm / totalTests),
        maxNetWpm,
        avgGrossWpm: Math.round(sumGross / totalTests),
        avgAccuracy: Math.round((sumAccuracy / totalTests) * 10) / 10,
        avgCpm: Math.round(sumCpm / totalTests),
        avgBackspace: Math.round(sumBackspace / totalTests),
      };
    };

    const hindiStats = {
      ...calcStats(hindiSessions),
      cpctQualified: (calcStats(hindiSessions).maxNetWpm || 0) >= 20,
      targetWpm: 20, // MP CPCT benchmark for Hindi
    };

    const englishStats = {
      ...calcStats(englishSessions),
      cpctQualified: (calcStats(englishSessions).maxNetWpm || 0) >= 30,
      targetWpm: 30, // MP CPCT benchmark for English
    };

    // Progression data for graphing
    const speedProgression = allSessions.map((s, idx) => ({
      index: idx + 1,
      id: s.id,
      date: new Date(s.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      language: s.language,
      script: s.script,
      netWpm: s.netWpm,
      grossWpm: s.grossWpm,
      accuracy: s.accuracy,
      cpm: s.cpm,
      backspaces: s.backspaceCount,
      passageTitle: s.passageTitle,
    }));

    return res.json({
      hindiStats,
      englishStats,
      totalPractices: allSessions.length,
      speedProgression,
    });
  } catch (error) {
    console.error('Error calculating typing analytics:', error);
    return res.status(500).json({ error: 'Failed to calculate typing analytics' });
  }
}
