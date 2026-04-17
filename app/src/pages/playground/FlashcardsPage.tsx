import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PlaygroundHeader } from '../../components/playground/PlaygroundHeader';
import { FlashcardTool } from '../../components/playground/FlashcardTool';

const FlashcardsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-parchment pb-20">
      <Helmet>
        <title>Legal Flashcards | EduLaw Playground</title>
        <meta name="description" content="Master legal concepts with interactive flashcards and study decks." />
      </Helmet>

      <PlaygroundHeader title="Knowledge Cards" />

      <main className="section-container px-4 py-12">
        <FlashcardTool />
      </main>
    </div>
  );
};

export default FlashcardsPage;
