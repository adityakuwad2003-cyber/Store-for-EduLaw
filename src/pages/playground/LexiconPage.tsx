import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PlaygroundHeader } from '../../components/playground/PlaygroundHeader';
import { LexiconTool } from '../../components/playground/LexiconTool';

const LexiconPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-parchment pb-20">
      <Helmet>
        <title>Legal Lexicon | EduLaw Playground</title>
        <meta name="description" content="A comprehensive dictionary of legal terms, maxims, and concepts." />
      </Helmet>

      <PlaygroundHeader title="Legal Lexicon" />

      <main className="section-container px-4 py-12">
        <LexiconTool />
      </main>
    </div>
  );
};

export default LexiconPage;
