export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: November 21, 2025</p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Information We Collect</h2>
          <p className="text-gray-700 mb-4">
            Selfie Mailer collects the following information:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Your Google account email address and profile information</li>
            <li>Photos you capture using the camera feature</li>
            <li>Access to your Gmail account to send selfie emails</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">
            We use your information to:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Authenticate you via Google OAuth</li>
            <li>Capture and store your selfies in AWS S3</li>
            <li>Generate AI-powered fun comments about your selfies using OpenAI</li>
            <li>Send selfie emails to your Gmail account</li>
            <li>Display your selfies in the admin gallery</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Data Storage</h2>
          <p className="text-gray-700">
            Your selfies are stored securely in Amazon S3 (AWS) storage. Metadata is stored in JSON format in the same S3 bucket.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Third-Party Services</h2>
          <p className="text-gray-700 mb-4">
            We use the following third-party services:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li><strong>Google OAuth & Gmail API</strong> - For authentication and sending emails</li>
            <li><strong>Amazon S3 (AWS)</strong> - For storing selfie images</li>
            <li><strong>OpenAI API</strong> - For generating AI comments about selfies</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Gmail Permissions</h2>
          <p className="text-gray-700">
            We request the following Gmail permissions:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li><code>gmail.readonly</code> - Read your Gmail profile information</li>
            <li><code>gmail.compose</code> - Compose emails on your behalf</li>
            <li><code>gmail.send</code> - Send emails on your behalf</li>
            <li><code>gmail.modify</code> - Manage your email</li>
          </ul>
          <p className="text-gray-700 mt-4">
            These permissions are used exclusively to send selfie emails to your account.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Data Security</h2>
          <p className="text-gray-700">
            We take data security seriously. All data transmission is encrypted via HTTPS, and we use secure authentication via Google OAuth.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Your Rights</h2>
          <p className="text-gray-700">
            You can revoke access to your Google account at any time by visiting{" "}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Google Account Permissions
            </a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Contact</h2>
          <p className="text-gray-700">
            For questions about this privacy policy, contact: aloysjehwin@gmail.com
          </p>
        </section>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
