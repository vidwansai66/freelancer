import { DialogAccessibility } from './components/common/DialogAccessibility';
import { TestimonialsEditorPage } from './pages/admin/TestimonialsEditorPage';
import { SettingsProvider } from './context/SettingsContext';
import { Seo } from './components/common/Seo';
import { Notices } from './components/common/Notices';
import { TrackingPage } from './pages/public/TrackingPage';
import { ManageBookingPage } from './pages/public/ManageBookingPage';
import { AdminClientProjectsPage } from './pages/admin/AdminClientProjectsPage';
import { StudioSettingsPage, AdminUsersPage } from './pages/admin/StudioSettingsPage';
import { AdminNotificationsPage } from './pages/admin/AdminNotificationsPage';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { ServicesPage } from './pages/public/ServicesPage';
import { ServiceDetailPage } from './pages/public/ServiceDetailPage';
import { PortfolioPage } from './pages/public/PortfolioPage';
import { ProjectDetailPage } from './pages/public/ProjectDetailPage';
import { PricingPage } from './pages/public/PricingPage';
import { AboutPage } from './pages/public/AboutPage';
import { ContactPage } from './pages/public/ContactPage';
import { QuotationPage } from './pages/public/QuotationPage';
import { BookingPage } from './pages/public/BookingPage';
import { ReviewsPage } from './pages/public/ReviewsPage';
import { BlogPage } from './pages/public/BlogPage';
import { BlogDetailPage } from './pages/public/BlogDetailPage';
import { FaqPage } from './pages/public/FaqPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { TermsPage } from './pages/public/TermsPage';
import { NotFoundPage } from './pages/public/NotFoundPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminInquiriesPage } from './pages/admin/AdminInquiriesPage';
import { AdminQuotationsPage } from './pages/admin/AdminQuotationsPage';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminProjectsPage } from './pages/admin/AdminProjectsPage';
import { AdminPricingPage } from './pages/admin/AdminPricingPage';
import { AdminTestimonialsPage } from './pages/admin/AdminTestimonialsPage';
import { AdminBlogPage } from './pages/admin/AdminBlogPage';
import { AdminFaqPage } from './pages/admin/AdminFaqPage';
import { AdminChatsPage } from './pages/admin/AdminChatsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

import { SmoothScroll } from './components/common/SmoothScroll';

export function App() {
  return (
    <Router>
      <ThemeProvider>
        <SmoothScroll>
          <SettingsProvider>
            <DialogAccessibility />
            <Seo />
            <Notices />
            <AuthProvider>
              <ChatProvider>
                <Routes>
                  {/* Public Consumer Routes */}
                  <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/services/:slug" element={<ServiceDetailPage />} />
                  <Route path="/portfolio" element={<PortfolioPage />} />
                  <Route path="/portfolio/:slug" element={<ProjectDetailPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/track" element={<TrackingPage />} />
                  <Route path="/manage-booking" element={<ManageBookingPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/quote" element={<QuotationPage />} />
                  <Route path="/book" element={<BookingPage />} />
                  <Route path="/reviews" element={<ReviewsPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogDetailPage />} />
                  <Route path="/faqs" element={<FaqPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Admin Authentication */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Protected Admin Console Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="inquiries" element={<AdminInquiriesPage />} />
                  <Route path="quotations" element={<AdminQuotationsPage />} />
                  <Route path="appointments" element={<AdminAppointmentsPage />} />
                  <Route path="services" element={<AdminServicesPage />} />
                  <Route path="portfolio" element={<AdminProjectsPage />} />
                  <Route path="pricing" element={<AdminPricingPage />} />
                  <Route path="testimonials" element={<TestimonialsEditorPage />} />
                  <Route path="blog" element={<AdminBlogPage />} />
                  <Route path="faqs" element={<AdminFaqPage />} />
                  <Route path="chats" element={<AdminChatsPage />} />
                  <Route path="settings" element={<StudioSettingsPage />} />
                  <Route path="client-projects" element={<AdminClientProjectsPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="notifications" element={<AdminNotificationsPage />} />
                </Route>
              </Routes>
            </ChatProvider>
          </AuthProvider>
          </SettingsProvider>
        </SmoothScroll>
      </ThemeProvider>
    </Router>
  );
}

export default App;
