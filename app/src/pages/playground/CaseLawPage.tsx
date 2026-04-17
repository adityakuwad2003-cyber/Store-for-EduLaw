import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PlaygroundHeader } from '../../components/playground/PlaygroundHeader';
import { CaseLawTool } from '../../components/playground/CaseLawTool';

const CaseLawPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-parchment pb-20">
      <Helmet>
        <title>Landmark Case Laws | EduLaw Playground</title>
        <meta name="description" content="Study landmark judgements and historical legal cases from the Supreme Court and High Courts." />
      </Helmet>

      <PlaygroundHeader title="Landmark Judgements" />

      <main className="section-container px-4 py-12">
        <CaseLawTool />
      </main>
    </div>
  );
};

export default CaseLawPage;
