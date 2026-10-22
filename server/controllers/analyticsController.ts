import { Request, Response } from 'express';
import { User, TypingPractice, TestSubmission, MockTest } from '../models/index.ts';

export async function getStudentDashboard(req: Request, res: Response) {
  try {
    const userId = (req.query.userId as string) || 'user-primary-1';

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 1. Fetch typing practices
    const typingSessions = await TypingPractice.findAll({
      where: { userId },
      order: [['createdAt', 'ASC']],
    });

    const hindiTyping = typingSessions.filter((s) => s.language === 'hindi');
    const englishTyping = typingSessions.filter((s) => s.language === 'english');

    const maxHindiWpm = hindiTyping.length > 0 ? Math.max(...hindiTyping.map((s) => s.netWpm)) : 0;
    const avgHindiWpm =
      hindiTyping.length > 0 ? Math.round(hindiTyping.reduce((a, b) => a + b.netWpm, 0) / hindiTyping.length) : 0;
    const avgHindiAccuracy =
      hindiTyping.length > 0
        ? Math.round((hindiTyping.reduce((a, b) => a + b.accuracy, 0) / hindiTyping.length) * 10) / 10
        : 0;

    const maxEnglishWpm = englishTyping.length > 0 ? Math.max(...englishTyping.map((s) => s.netWpm)) : 0;
    const avgEnglishWpm =
      englishTyping.length > 0
        ? Math.round(englishTyping.reduce((a, b) => a + b.netWpm, 0) / englishTyping.length)
        : 0;
    const avgEnglishAccuracy =
      englishTyping.length > 0
        ? Math.round((englishTyping.reduce((a, b) => a + b.accuracy, 0) / englishTyping.length) * 10) / 10
        : 0;

    // 2. Fetch mock test submissions
    const submissions = await TestSubmission.findAll({
      where: { userId },
      order: [['createdAt', 'ASC']],
    });

    const totalTestsTaken = submissions.length;
    const passedTestsCount = submissions.filter((s) => s.passed).length;
    const avgMockPercentage =
      totalTestsTaken > 0
        ? Math.round((submissions.reduce((a, b) => a + b.percentage, 0) / totalTestsTaken) * 10) / 10
        : 0;
    const highestMockScore =
      totalTestsTaken > 0 ? Math.max(...submissions.map((s) => s.percentage)) : 0;

    // 3. Aggregate Topic Breakdown to find real Weak Topics
    const topicAggregates: Record<
      string,
      { totalQuestions: number; correctQuestions: number; attempts: number }
    > = {};

    submissions.forEach((sub) => {
      const breakdown =
        typeof sub.topicWiseBreakdown === 'string'
          ? JSON.parse(sub.topicWiseBreakdown)
          : sub.topicWiseBreakdown || {};

      Object.entries(breakdown).forEach(([topic, stats]: [string, any]) => {
        if (!topicAggregates[topic]) {
          topicAggregates[topic] = { totalQuestions: 0, correctQuestions: 0, attempts: 0 };
        }
        topicAggregates[topic].totalQuestions += stats.total || 0;
        topicAggregates[topic].correctQuestions += stats.correct || 0;
        topicAggregates[topic].attempts++;
      });
    });

    const weakTopicsList: Array<{
      topic: string;
      accuracy: number;
      recommendation: string;
      severity: 'High' | 'Medium';
    }> = [];

    const strongTopicsList: Array<{ topic: string; accuracy: number }> = [];

    Object.entries(topicAggregates).forEach(([topic, data]) => {
      if (data.totalQuestions > 0) {
        const accuracy = Math.round((data.correctQuestions / data.totalQuestions) * 100);
        if (accuracy < 60) {
          weakTopicsList.push({
            topic,
            accuracy,
            severity: accuracy < 40 ? 'High' : 'Medium',
            recommendation:
              accuracy < 40
                ? `Critical focus needed: revise core concepts and solve dedicated topic mock test.`
                : `Needs improvement: review explanation notes and shortcut keys.`,
          });
        } else {
          strongTopicsList.push({ topic, accuracy });
        }
      }
    });

    // If no test taken yet or not enough topics, default suggestions
    if (weakTopicsList.length === 0 && totalTestsTaken === 0) {
      weakTopicsList.push(
        {
          topic: 'MS Excel Advanced Formulas & VLOOKUP',
          accuracy: 45,
          severity: 'Medium',
          recommendation: 'Practice cell referencing ($A$1) and lookup functions.',
        },
        {
          topic: 'Computer Networking (OSI Model & Protocols)',
          accuracy: 40,
          severity: 'High',
          recommendation: 'Study 7 layers of OSI and standard TCP/IP port numbers.',
        }
      );
    }

    // 4. CPCT Qualification Assessment
    // CPCT passing criteria:
    // Computer Proficiency Test >= 50%
    // English Typing >= 30 WPM (Net)
    // Hindi Typing >= 20 WPM (Net)
    const computerPassed = avgMockPercentage >= 50;
    const englishTypingQualified = maxEnglishWpm >= 30;
    const hindiTypingQualified = maxHindiWpm >= 20;
    const fullyQualified = computerPassed && englishTypingQualified && hindiTypingQualified;

    return res.json({
      user,
      summary: {
        totalTestsTaken,
        passedTestsCount,
        avgMockPercentage,
        highestMockScore,
        hindi: {
          maxNetWpm: maxHindiWpm,
          avgNetWpm: avgHindiWpm,
          avgAccuracy: avgHindiAccuracy,
          qualified: hindiTypingQualified,
          targetWpm: 20,
        },
        english: {
          maxNetWpm: maxEnglishWpm,
          avgNetWpm: avgEnglishWpm,
          avgAccuracy: avgEnglishAccuracy,
          qualified: englishTypingQualified,
          targetWpm: 30,
        },
        cpctCertificationStatus: {
          fullyQualified,
          computerPassed,
          englishTypingQualified,
          hindiTypingQualified,
          scoreGrade:
            avgMockPercentage >= 75
              ? 'Distinction (Grade A)'
              : avgMockPercentage >= 60
              ? 'First Class (Grade B)'
              : avgMockPercentage >= 50
              ? 'Qualified (Grade C)'
              : 'Needs Practice',
        },
      },
      weakTopics: weakTopicsList,
      strongTopics: strongTopicsList,
      submissionsHistory: submissions.map((s) => ({
        id: s.id,
        testTitle: s.testTitle,
        score: s.score,
        totalQuestions: s.totalQuestions,
        percentage: s.percentage,
        passed: s.passed,
        timeSpentSeconds: s.timeSpentSeconds,
        date: new Date(s.createdAt || Date.now()).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      })),
      typingTimeline: typingSessions.map((t) => ({
        id: t.id,
        language: t.language,
        script: t.script,
        netWpm: t.netWpm,
        grossWpm: t.grossWpm,
        accuracy: t.accuracy,
        backspaceCount: t.backspaceCount,
        date: new Date(t.createdAt || Date.now()).toLocaleDateString('en-IN', {
          month: 'short',
          day: 'numeric',
        }),
      })),
    });
  } catch (error) {
    console.error('Error fetching student dashboard analytics:', error);
    return res.status(500).json({ error: 'Failed to fetch student dashboard analytics' });
  }
}

export async function getLeaderboard(_req: Request, res: Response) {
  try {
    const users = await User.findAll();

    const leaderboardPromises = users.map(async (u) => {
      const submissions = await TestSubmission.findAll({ where: { userId: u.id } });
      const typing = await TypingPractice.findAll({ where: { userId: u.id } });

      const hindiSessions = typing.filter((t) => t.language === 'hindi');
      const englishSessions = typing.filter((t) => t.language === 'english');

      const maxHindiWpm = hindiSessions.length > 0 ? Math.max(...hindiSessions.map((t) => t.netWpm)) : 0;
      const maxEnglishWpm = englishSessions.length > 0 ? Math.max(...englishSessions.map((t) => t.netWpm)) : 0;

      const avgMockScore =
        submissions.length > 0
          ? Math.round(submissions.reduce((a, b) => a + b.percentage, 0) / submissions.length)
          : 0;

      // Composite CPCT Score formula = (Mock Score * 0.5) + (English WPM * 0.3) + (Hindi WPM * 0.2)
      const compositeScore = Math.round(avgMockScore * 0.5 + maxEnglishWpm * 0.3 + maxHindiWpm * 0.2);

      const isQualified = avgMockScore >= 50 && maxEnglishWpm >= 30 && maxHindiWpm >= 20;

      return {
        userId: u.id,
        name: u.name,
        rollNumber: u.rollNumber,
        avatar: u.avatar,
        avgMockScore,
        maxEnglishWpm,
        maxHindiWpm,
        totalTypingTests: typing.length,
        totalMockTests: submissions.length,
        compositeScore,
        isQualified,
      };
    });

    const results = await Promise.all(leaderboardPromises);
    results.sort((a, b) => b.compositeScore - a.compositeScore);

    const ranked = results.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      badge:
        idx === 0
          ? '🥇 Gold Topper'
          : idx === 1
          ? '🥈 Silver Rank'
          : idx === 2
          ? '🥉 Bronze Rank'
          : item.isQualified
          ? '⭐ CPCT Qualified'
          : 'Aspirant',
    }));

    return res.json(ranked);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}
