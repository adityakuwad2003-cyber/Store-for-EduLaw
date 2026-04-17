import React from 'react';
import { Award, ShieldCheck, Calendar, Trophy, Scale } from 'lucide-react';

interface MCQCertificateProps {
  userName: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  date: string;
  certificateId: string;
}

export const MCQCertificate: React.FC<MCQCertificateProps> = ({
  userName,
  quizTitle,
  score,
  totalQuestions,
  date,
  certificateId,
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);

  return (
    <div 
      id="certificate-template"
      className="w-[842px] h-[595px] bg-parchment p-1 flex items-center justify-center relative overflow-hidden"
      style={{ fontFamily: 'Cinzel, serif' }}
    >
      {/* Outer Border */}
      <div className="w-full h-full border-[12px] border-burgundy p-2 relative">
        {/* Inner Decorative Border */}
        <div className="w-full h-full border-2 border-gold/40 p-12 flex flex-col items-center text-center relative">
          
          {/* Background Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <Scale size={400} className="text-burgundy" />
          </div>

          {/* Logo Section */}
          <div className="mb-6 flex flex-col items-center">
            <div className="w-16 h-16 mb-2">
              <img src="/images/edulaw-logo.png" alt="EduLaw Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-burgundy text-2xl font-black tracking-[0.2em] uppercase">EduLaw</h2>
            <p className="text-[10px] text-gold tracking-[0.3em] uppercase mt-1 font-sans font-bold">Legal Excellence Platform</p>
          </div>

          {/* Certificate Title */}
          <div className="mb-6">
            <h1 className="text-4xl text-ink mb-1 tracking-tight">Certificate of Achievement</h1>
            <div className="w-48 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
          </div>

          {/* Recipient Text */}
          <div className="mb-8 font-sans">
            <p className="text-mutedgray italic text-lg mb-4">This is to certify that</p>
            <h3 className="text-4xl text-burgundy font-bold underline decoration-[#C9A84C]/30 underline-offset-8 mb-6 uppercase tracking-wider">
              {userName}
            </h3>
            <p className="text-mutedgray text-lg max-w-xl mx-auto leading-relaxed">
              has successfully completed the <span className="text-ink font-bold">"{quizTitle}"</span> proficiency assessment with an outstanding score of 
              <span className="text-ink font-bold italic ml-1">{percentage}%</span>.
            </p>
          </div>

          {/* Badge & Signature Section */}
          <div className="w-full mt-auto flex items-end justify-between px-10 pb-4 font-sans">
            {/* Left Box: Issue Info */}
            <div className="text-left">
              <div className="flex items-center gap-2 text-mutedgray mb-1">
                <Calendar size={14} className="text-gold" />
                <span className="text-xs font-bold uppercase tracking-widest">{date}</span>
              </div>
              <div className="flex items-center gap-2 text-mutedgray">
                <ShieldCheck size={14} className="text-gold" />
                <span className="text-[10px] font-bold uppercase tracking-widest">ID: {certificateId}</span>
              </div>
            </div>

            {/* Middle: Excellence Seal */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-gold flex items-center justify-center bg-white shadow-xl relative z-10">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-gold flex items-center justify-center">
                  <Trophy size={36} className="text-gold" />
                </div>
              </div>
              {/* Ribbon */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-16 h-20 bg-burgundy clip-ribbon z-0" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)' }} />
            </div>

            {/* Right Box: Signature */}
            <div className="text-center">
              <div className="mb-1">
                <img src="/images/signature-mock.png" alt="Signature" className="h-8 mx-auto opacity-80" />
                <div className="w-32 h-[1px] bg-ink/30 mx-auto" />
              </div>
              <span className="text-[10px] font-bold text-ink uppercase tracking-[0.2em]">Academic Director</span>
              <br />
              <span className="text-[8px] text-mutedgray uppercase font-bold tracking-widest">EduLaw Institute</span>
            </div>
          </div>

          {/* Decorations */}
          <div className="absolute top-4 left-4">
            <Award className="text-gold/20" size={60} />
          </div>
          <div className="absolute bottom-4 right-4">
            <ShieldCheck className="text-gold/20" size={60} />
          </div>
        </div>
      </div>
    </div>
  );
};
