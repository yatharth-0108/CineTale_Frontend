import { Routes, Route } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import AuthLayout from './layouts/AuthLayout';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import OnboardingPage from './pages/onboarding/OnboardingPage';
import AppLayout from './layouts/AppLayout';
import HomePage from './pages/home/HomePage';
import ForYouPage from './pages/for-you/ForYouPage';
import DiscoverPage from './pages/discover/DiscoverPage';
import SearchPage from './pages/search/SearchPage';
import MovieDetailPage from './pages/movie/MovieDetailPage';
import WatchlistPage from './pages/watchlist/WatchlistPage';
import CommunityPage from './pages/community/CommunityPage';
import CreatePostPage from './pages/community/CreatePostPage';
import WriteReviewPage from './pages/review/WriteReviewPage';
import ProfilePage from './pages/profile/ProfilePage';
import PeoplePage from './pages/people/PeoplePage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import CollectionsPage from './pages/collections/CollectionsPage';
import CollectionDetailPage from './pages/collections/CollectionDetailPage';
import NotFound from './pages/NotFound';
import ProtectedRoute, { GuestRoute } from './routes/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<AuthLayout />}>
        <Route element={<GuestRoute />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        <Route path="reset-password" element={<ResetPasswordPage />} />
      </Route>
      <Route element={<ProtectedRoute requireOnboarded={false} />}><Route path="onboarding" element={<OnboardingPage />} /></Route>
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="home" element={<HomePage />} />
          <Route path="for-you" element={<ForYouPage />} />
          <Route path="discover" element={<DiscoverPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="movie/:movieId" element={<MovieDetailPage />} />
          <Route path="watchlist" element={<WatchlistPage />} />
          <Route path="movie/:movieId/review" element={<WriteReviewPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="create-post" element={<CreatePostPage />} />
          <Route path="profile/:username" element={<ProfilePage />} />
          <Route path="people" element={<PeoplePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="collections/:collectionId" element={<CollectionDetailPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
}
