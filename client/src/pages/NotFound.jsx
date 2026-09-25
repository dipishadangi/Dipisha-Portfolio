import { BurstGrid } from '../components/art/Illustrations';
import { Button, Section } from '../components/ui';
import { usePageMeta } from '../lib/usePageMeta';

export function NotFound() {
  usePageMeta('Page not found');

  return (
    <Section>
      <div className="block fill-indigo mx-auto max-w-xl overflow-hidden p-10 text-center text-white">
        <BurstGrid highlight={9} className="mx-auto w-40" />
        <h1 className="mt-8 text-4xl">404</h1>
        <p className="mt-3 text-white/80">
          There is nothing at this address. It may have been renamed.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button to="/" tone="yellow">
            Back home
          </Button>
          <Button to="/work" className="bg-white">
            See the work
          </Button>
        </div>
      </div>
    </Section>
  );
}
