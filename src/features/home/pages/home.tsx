import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Layout from '@/components/layout/layout';
import {
  BookOpen,
  Target,
  TrendingUp,
  Users,
  Award,
  Clock,
} from 'lucide-react';

export default function HomePage() {
  return (
    <Layout>
      <div className="space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-gray-900 sm:text-6xl">
              Master React.js
              <span className="text-blue-600"> Step by Step</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn React.js through interactive lessons and practice with
              AI-powered quizzes. Build your skills from fundamentals to
              advanced concepts.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/learning">
              <Button size="lg" className="px-8 py-3">
                Start Learning
              </Button>
            </Link>
            <Link to="/practice">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Practice Skills
              </Button>
            </Link>
          </div>

          {/* Quick Stats Placeholder */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 pt-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">10,000+</div>
              <div className="text-sm text-gray-500">Active Learners</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">50+</div>
              <div className="text-sm text-gray-500">Practice Quizzes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">25+</div>
              <div className="text-sm text-gray-500">Learning Topics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">95%</div>
              <div className="text-sm text-gray-500">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Choose ReactLearn?
            </h2>
            <p className="text-lg text-gray-600 mt-4">
              Everything you need to become a React developer
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Interactive Learning</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Learn React concepts with hands-on examples and interactive
                  tutorials.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Practice Quizzes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Test your knowledge with AI-powered quizzes and get instant
                  feedback.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Monitor your learning journey and track your improvement over
                  time.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Community Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Join thousands of developers learning React together.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Learning Path Preview */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Learning Journey
            </h2>
            <p className="text-lg text-gray-600">
              Follow our structured path from beginner to advanced React
              developer
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <BookOpen className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Learn</CardTitle>
                    <CardDescription>Interactive Lessons</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Start with fundamentals and work your way up through hands-on
                  tutorials and real-world examples.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Practice</CardTitle>
                    <CardDescription>AI-Powered Quizzes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Test your knowledge with intelligent quizzes that adapt to
                  your learning progress.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Award className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Master</CardTitle>
                    <CardDescription>Build Projects</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Apply your knowledge by building real projects and earn
                  certificates of completion.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link to="/learning">
              <Button size="lg">
                <Clock className="w-4 h-4 mr-2" />
                Start Your Journey
              </Button>
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gray-900 text-white rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">
            Ready to become a React Expert?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who have mastered React through our
            platform. Start your journey today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/learning">
              <Button
                size="lg"
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                Get Started Free
              </Button>
            </Link>
            <Link to="/practice">
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-gray-900"
              >
                Try Practice Quiz
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
