import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTypingMetrics, evaluateMockTest } from './typingLogic.ts';

test('calculateTypingMetrics handles zero input cleanly', () => {
  const result = calculateTypingMetrics('Hello world', '', 0, 0);
  assert.equal(result.grossWpm, 0);
  assert.equal(result.netWpm, 0);
  assert.equal(result.accuracy, 100);
  assert.equal(result.totalKeystrokes, 0);
});

test('calculateTypingMetrics computes accurate WPM and accuracy for perfect typing', () => {
  // 50 characters in 60 seconds = 10 words = 10 gross WPM
  const text = 'The quick brown fox jumps over the lazy dog today.';
  const result = calculateTypingMetrics(text, text, 60, 2);
  
  assert.equal(result.accuracy, 100);
  assert.equal(result.grossWpm, 10);
  assert.equal(result.netWpm, 10);
  assert.equal(result.correctCharacters, text.length);
  assert.equal(result.incorrectCharacters, 0);
  assert.equal(result.backspaceImpact, 'Low');
});

test('calculateTypingMetrics penalizes errors correctly in Net WPM', () => {
  const original = 'Computer proficiency certification test practice';
  // Suppose user typed with some errors
  const typed =    'Computer profixiency cirtification test practice';
  const result = calculateTypingMetrics(original, typed, 60, 15);

  assert.ok(result.accuracy < 100);
  assert.ok(result.incorrectCharacters > 0);
  assert.ok(result.netWpm <= result.grossWpm);
  assert.ok(result.backspaceImpact === 'High' || result.backspaceImpact === 'Moderate');
});

test('evaluateMockTest calculates score and detects weak topics', () => {
  const questions = [
    { id: 1, topic: 'Computer Proficiency', correctAnswerIndex: 0 },
    { id: 2, topic: 'Computer Proficiency', correctAnswerIndex: 1 },
    { id: 3, topic: 'Quantitative Aptitude', correctAnswerIndex: 2 },
    { id: 4, topic: 'Quantitative Aptitude', correctAnswerIndex: 3 },
  ];

  // User answered Q1 correct, Q2 wrong, Q3 wrong, Q4 unattempted
  const userAnswers = {
    1: 0, // correct
    2: 3, // wrong
    3: 0, // wrong
    // 4 unattempted
  };

  const result = evaluateMockTest(questions, userAnswers, 50);

  assert.equal(result.totalQuestions, 4);
  assert.equal(result.correctCount, 1);
  assert.equal(result.incorrectCount, 2);
  assert.equal(result.unattemptedCount, 1);
  assert.equal(result.scoreObtained, 1);
  assert.equal(result.percentage, 25);
  assert.equal(result.passed, false);
  // Quantitative Aptitude has 0% -> must be in weakTopics
  assert.ok(result.weakTopics.includes('Quantitative Aptitude'));
});
