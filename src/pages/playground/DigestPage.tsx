import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PlaygroundHeader } from '../../components/playground/PlaygroundHeader';
import { DailyLegalNews } from '../../components/playground/DailyLegalNews';

const DigestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-parchment pb-20">
      <Helmet>
        <title>Daily Legal Digest | EduLaw Playground</title>
        <meta name="description" content="Get your daily legal news and updates from High Courts and Supreme Court." />
      </Helmet>

      <PlaygroundHeader title="Legal News Digest" />

      <main className="section-container px-4 py-8">
        <DailyLegalNews />
      </main>
    </div>
  );
};

export default DigestPage;
