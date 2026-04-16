import React from 'react';
import { Helmet } from 'react-helmet-async';
import { PlaygroundHeader } from '../../components/playground/PlaygroundHeader';
import { InsightsTool } from '../../components/playground/InsightsTool';

const InsightsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-parchment pb-20">
      <Helmet>
        <title>Legal Insights | EduLaw Playground</title>
        <meta name="description" content="Read in-depth articles and case studies on legal and geopolitical topics." />
      </Helmet>

      <PlaygroundHeader title="Legal Insights" />

      <main className="section-container px-4 py-12">
        <InsightsTool />
      </main>
    </div>
  );
};

export default InsightsPage;
