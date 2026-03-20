import Section from '../components/Section';
import Container from '../components/Container';
import Heading from '../components/Heading';
import Text from '../components/Text';
import DotsPattern from '../components/DotsPattern';

export default function AIAssistSection() {
  return (
    <Section background="white">
      <Container>
        <div className="bg-[#F9F7F4] dark:bg-card border border-[#E9E6DF] dark:border-border rounded-3xl p-12 sm:p-16 relative overflow-hidden">
          <DotsPattern />

          <div className="max-w-3xl mx-auto text-center relative z-10">
            <Heading level={2} className="mb-4">
              Not sure how Sourcery can help you invest?
            </Heading>
            <Text variant="body" className="mb-10">
              Let your favorite LLM help you get a clear answer.
            </Text>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://chat.openai.com/?q=Tell+me+how+Sourcery+helps+property+investors+find+verified+off-market+deals"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-[#1287ff] hover:opacity-90 text-white font-medium px-6 py-3 text-sm rounded-3xl transition-opacity cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <img src="/logo/openai.svg" alt="ChatGPT" className="h-5 w-5" />
                Ask ChatGPT
              </a>
              <a
                href="https://claude.ai/new?q=Tell+me+how+Sourcery+helps+property+investors+find+verified+off-market+deals"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-[#1287ff] hover:opacity-90 text-white font-medium px-6 py-3 text-sm rounded-3xl transition-opacity cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <img src="/logo/claude.svg" alt="Claude" className="h-5 w-5" />
                Ask Claude
              </a>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
