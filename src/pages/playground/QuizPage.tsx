import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PlaygroundHeader } from '../../components/playground/PlaygroundHeader';
import { QuizOfTheDay } from '../../components/playground/QuizOfTheDay';

const QuizPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-parchment pb-20">
      <Helmet>
        <title>Daily Legal Quiz | EduLaw Playground</title>
        <meta name="description" content="Test your legal knowledge with our daily interactive quiz." />
      </Helmet>

      <PlaygroundHeader title="Daily Legal Quiz" />

      <main className="section-container px-4 py-12">
        <QuizOfTheDay />
      </main>
    </div>
  );
};

export default QuizPage;
