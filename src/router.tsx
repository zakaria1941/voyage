import { lazy, Suspense, type ComponentType, type JSX } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { ProtectedRoute, AdminRoute, GuestOnlyRoute } from '@/components/layout/ProtectedRoute';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { PageSpinner } from '@/components/ui/Spinner';
import NotFoundPage from '@/pages/NotFoundPage';

function lazyPage(factory: () => Promise<{ default: ComponentType }>): JSX.Element {
  const LazyComponent = lazy(factory);
  return (
    <Suspense fallback={<PageSpinner />}>
      <LazyComponent />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: lazyPage(() => import('@/pages/HomePage')) },
      { path: 'explore', element: lazyPage(() => import('@/pages/ExplorePage')) },
      { path: 'deals', element: lazyPage(() => import('@/pages/DealsPage')) },
      { path: 'help', element: lazyPage(() => import('@/pages/HelpPage')) },

      { path: 'flights', element: lazyPage(() => import('@/pages/flight/FlightSearchPage')) },
      { path: 'flights/results', element: lazyPage(() => import('@/pages/flight/FlightResultsPage')) },
      { path: 'flights/:id', element: lazyPage(() => import('@/pages/flight/FlightDetailsPage')) },

      { path: 'hotels', element: lazyPage(() => import('@/pages/hotel/HotelSearchPage')) },
      { path: 'hotels/results', element: lazyPage(() => import('@/pages/hotel/HotelResultsPage')) },
      { path: 'hotels/:id', element: lazyPage(() => import('@/pages/hotel/HotelDetailsPage')) },

      { path: 'cars', element: lazyPage(() => import('@/pages/car/CarSearchPage')) },
      { path: 'cars/results', element: lazyPage(() => import('@/pages/car/CarResultsPage')) },
      { path: 'cars/:id', element: lazyPage(() => import('@/pages/car/CarDetailsPage')) },

      { path: 'transfers', element: lazyPage(() => import('@/pages/transfer/TransferSearchPage')) },
      { path: 'transfers/results', element: lazyPage(() => import('@/pages/transfer/TransferResultsPage')) },
      { path: 'transfers/:id', element: lazyPage(() => import('@/pages/transfer/TransferDetailsPage')) },

      { path: 'booking/:bookingType/:itemId', element: lazyPage(() => import('@/pages/booking/CheckoutPage')) },
      { path: 'confirmation/:id', element: lazyPage(() => import('@/pages/booking/ConfirmationPage')) },

      {
        element: <GuestOnlyRoute />,
        children: [
          { path: 'login', element: lazyPage(() => import('@/pages/auth/LoginPage')) },
          { path: 'register', element: lazyPage(() => import('@/pages/auth/RegisterPage')) },
          { path: 'forgot-password', element: lazyPage(() => import('@/pages/auth/ForgotPasswordPage')) },
        ],
      },
      { path: 'reset-password', element: lazyPage(() => import('@/pages/auth/ResetPasswordPage')) },

      {
        path: 'dashboard',
        element: <ProtectedRoute />,
        children: [
          {
            element: <DashboardLayout />,
            children: [
              { index: true, element: lazyPage(() => import('@/pages/dashboard/DashboardOverviewPage')) },
              { path: 'bookings', element: lazyPage(() => import('@/pages/dashboard/DashboardBookingsPage')) },
              { path: 'trips', element: lazyPage(() => import('@/pages/dashboard/DashboardTripsPage')) },
              { path: 'favorites', element: lazyPage(() => import('@/pages/dashboard/DashboardFavoritesPage')) },
              { path: 'profile', element: lazyPage(() => import('@/pages/dashboard/DashboardProfilePage')) },
              { path: 'notifications', element: lazyPage(() => import('@/pages/dashboard/DashboardNotificationsPage')) },
              { path: 'settings', element: lazyPage(() => import('@/pages/dashboard/DashboardSettingsPage')) },
            ],
          },
        ],
      },

      {
        path: 'admin',
        element: <AdminRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, element: lazyPage(() => import('@/pages/admin/AdminOverviewPage')) },
              { path: 'bookings', element: lazyPage(() => import('@/pages/admin/AdminBookingsPage')) },
              { path: 'users', element: lazyPage(() => import('@/pages/admin/AdminUsersPage')) },
              { path: 'flights', element: lazyPage(() => import('@/pages/admin/AdminFlightsPage')) },
              { path: 'hotels', element: lazyPage(() => import('@/pages/admin/AdminHotelsPage')) },
              { path: 'cars', element: lazyPage(() => import('@/pages/admin/AdminCarsPage')) },
              { path: 'transfers', element: lazyPage(() => import('@/pages/admin/AdminTransfersPage')) },
              { path: 'airports', element: lazyPage(() => import('@/pages/admin/AdminAirportsPage')) },
              { path: 'airlines', element: lazyPage(() => import('@/pages/admin/AdminAirlinesPage')) },
              { path: 'suppliers', element: lazyPage(() => import('@/pages/admin/AdminSuppliersPage')) },
              { path: 'coupons', element: lazyPage(() => import('@/pages/admin/AdminCouponsPage')) },
              { path: 'reviews', element: lazyPage(() => import('@/pages/admin/AdminReviewsPage')) },
              { path: 'settings', element: lazyPage(() => import('@/pages/admin/AdminSettingsPage')) },
            ],
          },
        ],
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
