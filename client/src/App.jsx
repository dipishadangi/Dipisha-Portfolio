import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ContentProvider, useContent } from './lib/content';
import { AuthProvider } from './lib/auth';

import { SiteLayout } from './components/site/SiteLayout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Work } from './pages/Work';
import { WorkDetail } from './pages/WorkDetail';
import { Services } from './pages/Services';
import { Contact } from './pages/Contact';
import { NotFound } from './pages/NotFound';

import { AdminLayout } from './pages/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { ProfileEditor } from './pages/admin/ProfileEditor';
import { SectionsEditor } from './pages/admin/SectionsEditor';
import { SkillsEditor } from './pages/admin/SkillsEditor';
import { ServicesEditor } from './pages/admin/ServicesEditor';
import { ProjectsEditor } from './pages/admin/ProjectsEditor';
import { TimelineEditor } from './pages/admin/TimelineEditor';
import { Inbox } from './pages/admin/Inbox';
import { MediaLibrary } from './pages/admin/MediaLibrary';

import { ErrorBox, Loading } from './components/ui';

/** Holds the whole site back until the first content load settles. */
function SiteGate() {
  const { status, error, reload } = useContent();

  if (status === 'loading') return <Loading label="Loading the site" />;

  if (status === 'error') {
    return (
      <div className="shell py-24">
        <ErrorBox title="Could not load the site">
          {error} — check that the API is running, then{' '}
          <button
            type="button"
            onClick={reload}
            className="font-bold underline"
          >
            try again
          </button>
          .
        </ErrorBox>
      </div>
    );
  }

  return <SiteLayout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ContentProvider>
          <Routes>
            {/* ------------------------------------------------ the site */}
            <Route element={<SiteGate />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="work" element={<Work />} />
              <Route path="work/:slug" element={<WorkDetail />} />
              <Route path="services" element={<Services />} />
              <Route path="contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* ----------------------------------------- the control desk */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<ProfileEditor />} />
              <Route path="sections" element={<SectionsEditor />} />
              <Route path="skills" element={<SkillsEditor />} />
              <Route path="services" element={<ServicesEditor />} />
              <Route path="projects" element={<ProjectsEditor />} />
              <Route path="journey" element={<TimelineEditor />} />
              <Route path="inbox" element={<Inbox />} />
              <Route path="media" element={<MediaLibrary />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Routes>
        </ContentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
