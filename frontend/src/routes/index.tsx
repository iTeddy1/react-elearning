import { Route, Routes } from 'react-router-dom';
import Home from '@/features/home/pages/home';
import Practice from '@/features/practice/pages/practice';
import QuizTaking from '@/features/practice/pages/quiz-taking';
import { InterviewSetupPage } from '@/features/interview/pages/InterviewSetupPage';
import { InterviewPage } from '@/features/interview/pages/InterviewPage';
import { ReviewLandingPage } from '@/features/review/pages/ReviewLandingPage';
import { QuestionViewerPage } from '@/features/review/pages/QuestionViewerPage';
import { GuidesLandingPage } from '@/features/review/pages/GuidesLandingPage';
import { GuideViewerPage } from '@/features/review/pages/GuideViewerPage';

const Router = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/practice" element={<Practice />} />
    <Route path="/practice/:quizId" element={<QuizTaking />} />
    <Route path="/interview/setup" element={<InterviewSetupPage />} />
    <Route path="/interview" element={<InterviewPage />} />
    <Route path="/review" element={<ReviewLandingPage />} />
    <Route
      path="/review/questions/:category/:slug"
      element={<QuestionViewerPage />}
    />
    <Route path="/review/guides" element={<GuidesLandingPage />} />
    <Route
      path="/review/guides/:category/:slug"
      element={<GuideViewerPage />}
    />
  </Routes>
);

export default Router;
