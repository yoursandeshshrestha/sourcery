export default function AIAssistSection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#F9F7F4] border border-[#E9E6DF] rounded-3xl p-12 sm:p-16 relative overflow-hidden">
          {/* Dots Pattern Background */}
          <div
            className="absolute inset-0 "
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'2\' cy=\'2\' r=\'1\' fill=\'%23E9E6DF\'/%3E%3C/svg%3E")',
              backgroundRepeat: 'repeat',
              backgroundSize: '20px 20px'
            }}
          />

          <div className="max-w-3xl mx-auto text-center relative z-10">
            

            {/* Content */}
            <h2
              className="text-4xl sm:text-5xl font-normal text-[#1A2208] mb-4 leading-tight"
              style={{ fontFamily: "'Recoleta Regular', serif" }}
            >
              Not sure how Sourcery can help you invest?
            </h2>
            <p className="text-base text-[#5C5C49] mb-10">
              Let your favorite LLM help you get a clear answer.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://chat.openai.com/?q=Tell+me+how+Sourcery+helps+property+investors+find+verified+off-market+deals"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-[#1A2208] hover:opacity-90 text-white font-medium px-6 py-3 text-sm rounded-3xl transition-opacity cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
                </svg>
                Ask ChatGPT
              </a>
              <a
                href="https://claude.ai/new?q=Tell+me+how+Sourcery+helps+property+investors+find+verified+off-market+deals"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-[#1A2208] hover:opacity-90 text-white font-medium px-6 py-3 text-sm rounded-3xl transition-opacity cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.5 2C20.5 2 22 3.5 22 6.5V17.5C22 20.5 20.5 22 17.5 22H6.5C3.5 22 2 20.5 2 17.5V6.5C2 3.5 3.5 2 6.5 2H17.5ZM16.5 8.5C16.2 8.5 15.9 8.6 15.7 8.8L12 12.5L8.3 8.8C8.1 8.6 7.8 8.5 7.5 8.5C6.7 8.5 6 9.2 6 10C6 10.3 6.1 10.6 6.3 10.8L10.6 15.1C11 15.5 11.5 15.7 12 15.7C12.5 15.7 13 15.5 13.4 15.1L17.7 10.8C17.9 10.6 18 10.3 18 10C18 9.2 17.3 8.5 16.5 8.5Z" />
                </svg>
                Ask Claude
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
