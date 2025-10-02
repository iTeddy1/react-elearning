import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/layout';
import { getTopicById } from '@/data/learning-data';

const LessonDetail = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const topic = getTopicById(Number(topicId));

  if (!topic) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Topic Not Found
          </h1>
          <Link to="/learning">
            <Button>Back to Learning</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const completedLessons = topic.lessons.filter(
    (lesson) => lesson.completed
  ).length;
  const progressPercentage = (completedLessons / topic.lessons.length) * 100;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <Link
          to="/learning"
          className="inline-flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Learning
        </Link>

        {/* Topic Header */}
        <div className="bg-white p-8 rounded-lg shadow-sm border">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {topic.title}
              </h1>
              <p className="text-gray-600 mb-4">{topic.description}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {topic.estimatedTime}
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {topic.lessons.length} lessons
                </div>
                <Badge>{topic.difficulty}</Badge>
              </div>
            </div>

            {/* Progress */}
            <div className="flex-shrink-0 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {Math.round(progressPercentage)}%
              </div>
              <div className="text-sm text-gray-500">Complete</div>
              <div className="w-24 h-2 bg-gray-200 rounded-full mt-2">
                <div
                  className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lessons List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">Lessons</h2>

          {topic.lessons.map((lesson, index) => (
            <Card key={lesson.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Lesson Status */}
                    <div className="flex-shrink-0">
                      {lesson.completed ? (
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {index + 1}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Lesson Info */}
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {lesson.title}
                      </h3>
                      <p className="text-sm text-gray-500">{lesson.duration}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant={lesson.completed ? 'outline' : 'default'}
                    size="sm"
                    className="flex items-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {lesson.completed ? 'Review' : 'Start'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-8">
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Ready to test your knowledge?
            </p>
            <Link to={`/practice?topic=${topicId}`}>
              <Button variant="outline">Take Practice Quiz</Button>
            </Link>
          </div>

          <Button size="lg">Continue Learning</Button>
        </div>
      </div>
    </Layout>
  );
};

export default LessonDetail;
