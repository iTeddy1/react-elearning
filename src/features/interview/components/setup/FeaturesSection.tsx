import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Users, Award } from 'lucide-react';

interface FeaturesSectionProps {
  className?: string;
}

const features = [
  {
    icon: Mic,
    title: 'Voice Recording',
    description: 'Record your answers with clear audio quality',
    color: 'text-blue-600',
  },
  {
    icon: Users,
    title: 'AI Analysis',
    description: 'Get detailed feedback on communication skills',
    color: 'text-green-600',
  },
  {
    icon: Award,
    title: 'Detailed Reports',
    description: 'Receive comprehensive performance analysis',
    color: 'text-purple-600',
  },
];

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({
  className,
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className || ''}`}>
      {features.map((feature, index) => (
        <Card key={index}>
          <CardContent className="pt-6 text-center">
            <feature.icon className={`h-8 w-8 mx-auto mb-2 ${feature.color}`} />
            <h3 className="font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">
              {feature.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
