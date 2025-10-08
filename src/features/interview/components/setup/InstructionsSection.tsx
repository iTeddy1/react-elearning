import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface InstructionsSectionProps {
  className?: string;
}

export const InstructionsSection: React.FC<InstructionsSectionProps> = ({ className }) => {
  const instructions = [
    {
      step: 1,
      title: 'Question Presentation',
      description: 'Each question will be displayed clearly with recording controls.',
    },
    {
      step: 2,
      title: 'Voice Recording',
      description: 'Click the microphone button to start recording your answer.',
    },
    {
      step: 3,
      title: 'AI Analysis',
      description: 'Your responses will be transcribed and analyzed for feedback.',
    },
    {
      step: 4,
      title: 'Detailed Report',
      description: 'Receive comprehensive feedback with scores and improvement suggestions.',
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          What to Expect
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {instructions.map((instruction) => (
            <div key={instruction.step} className="flex gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-medium">
                {instruction.step}
              </div>
              <div>
                <h4 className="font-medium">{instruction.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {instruction.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};