import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
export default function DataPolicy() {
  return (
    <>
      <div className="text-center min-h-screen flex items-center justify-center font-mono py-20 dark:bg-black">
        <Card className="w-[40rem] pt-5">
          <CardContent>
            <div className="pb-1">
              <Link href="/" className="text-xl font-semibold">
                elr
              </Link>
            </div>
            <p className="text-xs text-gray-500 mb-4 pb-3">
              A minimal URL shortener service. Enter your destination URL and
              get a shortened link.
            </p>
            <h2 className="font-semibold mb-2">Data Policy</h2>
            <p className="text-xs text-gray-400 mb-3">
              Last updated: February 26, 2025
            </p>

            <h3 className="font-semibold text-xs mt-4">1. Introduction</h3>
            <p className="text-xs mb-3">
              This explains how elr.sh collects and uses information when you
              use our URL-shortening service.
            </p>

            <h3 className="font-semibold text-xs mt-4">2. Data Collection</h3>
            <ul className="text-xs list-disc pl-5 mb-3">
              <li>We store your target URL and selected backend</li>
              <li>
                If using GitHub login, we collect your email address and
                maintain a record of links created by your account
              </li>
              <li>All shortened links you create are associated with your user account</li>
              <li>Data is stored indefinitely in a Redis database</li>
              <li>We collect your theme preference (light mode/dark mode) and save it for 30 days</li>
              <li>
                Certain request data is securely sent to Arcjet to prevent abuse
                and protect the service
              </li>
            </ul>

            <h3 className="font-semibold text-xs mt-4">3. Data Usage</h3>
            <p className="text-xs mb-3">
              All data is used exclusively for providing our service and
              preventing abuse. We associate links with your account to provide you access to your link history
              and to prevent abuse of the platform. Theme preferences are stored to enhance your user experience.
              We use Arcjet, a trusted security partner, to
              help protect against spam and malicious activity. We do not share
              your personal data with other third parties.
            </p>

            <h3 className="font-semibold text-xs mt-4">
              4. Security & Updates
            </h3>
            <p className="text-xs mb-3">
              Access to personal data is limited to elr.sh and our security
              service provider Arcjet. We may update this policy occasionally,
              with changes posted on our website.
            </p>

            <p className="text-xs mt-4">
              By using elr.sh, you agree to these terms.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
